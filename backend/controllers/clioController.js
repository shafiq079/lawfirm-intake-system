const asyncHandler = require('express-async-handler');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const multer = require('multer');
const FormData = require('form-data');
const Intake = require('../models/intakeModel');
const User = require('../models/userModel');

const { CLIO_CLIENT_ID, CLIO_CLIENT_SECRET, CLIO_REDIRECT_URI, CLIO_AUTH_SUCCESS_REDIRECT_URI } = process.env;

if (!CLIO_CLIENT_ID || !CLIO_CLIENT_SECRET || !CLIO_REDIRECT_URI || !CLIO_AUTH_SUCCESS_REDIRECT_URI) {
  throw new Error('Missing required Clio environment variables');
}

const refreshClioAccessToken = async (userId, refreshToken) => {
  try {
    if (!refreshToken) {
      console.error('No refresh token provided');
      return null;
    }

    console.log('Attempting to refresh token for user:', userId);
    console.log('Refresh token used:', refreshToken);
    
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', CLIO_CLIENT_ID);
    params.append('client_secret', CLIO_CLIENT_SECRET);
    params.append('redirect_uri', CLIO_REDIRECT_URI);
    params.append('refresh_token', refreshToken);

    const tokenResponse = await fetch('https://eu.app.clio.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokens = await tokenResponse.json();
    console.log('Clio Token Refresh Response:', tokens);

    if (!tokenResponse.ok) {
      console.error('Token refresh failed:', tokens);
      return null;
    }

    if (tokens.access_token) {
      const user = await User.findById(userId);
      if (user) {
        user.clioAccessToken = tokens.access_token;
        // Only update refresh token if a new one is provided (some OAuth providers rotate them)
        if (tokens.refresh_token) {
          user.clioRefreshToken = tokens.refresh_token;
        }
        await user.save();
        console.log('Clio tokens refreshed and saved successfully.');
        return tokens.access_token;
      } else {
        console.error('User not found for token refresh:', userId);
        return null;
      }
    }
    console.error('Failed to get new access token from refresh response:', tokens);
    return null;
  } catch (error) {
    console.error('Error refreshing Clio token:', error);
    return null;
  }
};

const makeClioApiCall = async (url, method, body, userId, refreshToken, currentAccessToken, maxRetries = 3) => {
  let retries = 0;
  let tokenToUse = currentAccessToken;

  while (retries < maxRetries) {
    const options = {
      method: method,
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
      },
    };

    if (method === 'POST') {
      options.headers['Content-Type'] = 'application/json';
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
      console.warn('Clio access token expired or unauthorized. Attempting to refresh...');
      retries++; 
      
      if (retries >= maxRetries) {
        throw new Error(`Max retries reached for Clio API call: ${url}`);
      }
      
      const newAccessToken = await refreshClioAccessToken(userId, refreshToken);
      if (newAccessToken) {
        tokenToUse = newAccessToken;
        continue; // Retry the current API call with the new token
      } else {
        throw new Error('Failed to refresh Clio access token.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Clio API Error Details:', errorData);
      console.error('Request Body:', body);
      throw new Error(errorData.error_description || `Clio API call failed with status ${response.status}: ${url}`);
    }

    const data = await response.json();
    return { data, accessToken: tokenToUse }; // Return parsed JSON and the current access token
  }
  
  throw new Error(`Max retries reached for Clio API call: ${url}`);
};

const syncIntakeToClio = async (intake, token, user, resync = false) => {
  let currentToken = token;
  let currentUser = user;

  try {
    // Get the latest user data to ensure we have the most current refresh token
    currentUser = await User.findById(currentUser._id);
    if (!currentUser || !currentUser.clioRefreshToken) {
      throw new Error('User not found or missing Clio refresh token');
    }

    // Prevent duplicate syncs unless resync is explicitly requested
    if (intake.clioSyncStatus === 'Synced' && !resync) {
      return { success: false, message: 'Intake already synced to Clio. Use resync option to force.' };
    }

    // 1. Prepare Contact Data
    const contactData = {
      type: 'Person',
      first_name: intake.formData.firstName || '',
      last_name: intake.formData.lastName || '',
      email_addresses: intake.formData.emailAddress ? [{ address: intake.formData.emailAddress, default: true }] : [],
      phone_numbers: intake.formData.phoneNumber ? [{ number: intake.formData.phoneNumber, default: true }] : [],
      date_of_birth: intake.formData.dateOfBirth || undefined,
      // Add custom fields for other relevant personal info if Clio supports them
      // For example, if you have a custom field for 'Country of Citizenship' in Clio
      // custom_fields: {
      //   'Country of Citizenship': intake.formData.countryOfCitizenship,
      // },
    };

    let contactId = null;
    let contactSearchResponse;
    let contactSearchData = null;

    // Search for existing contact by email
    if (intake.formData.emailAddress) {
      try {
        contactSearchResponse = await makeClioApiCall(
          `https://eu.app.clio.com/api/v4/contacts.json?query=${encodeURIComponent(intake.formData.emailAddress)}`,
          'GET',
          null,
          currentUser._id,
          currentUser.clioRefreshToken,
          currentToken
        );
        currentToken = contactSearchResponse.accessToken;
        contactSearchData = contactSearchResponse.data;
      } catch (error) {
        console.warn('Clio contact search by email failed:', error.message);
      }
    }

    if (contactSearchData && contactSearchData.data?.length > 0) {
      // Contact found, update it
      contactId = contactSearchData.data[0].id;
      console.log(`Updating existing Clio contact with ID: ${contactId}`);
      const updateContactResponse = await makeClioApiCall(
        `https://eu.app.clio.com/api/v4/contacts/${contactId}.json`,
        'PUT', // Use PUT for updating an existing resource
        { data: contactData },
        currentUser._id,
        currentUser.clioRefreshToken,
        currentToken
      );
      currentToken = updateContactResponse.accessToken;
    } else {
      // Contact not found, create new
      console.log('Creating new Clio contact.');
      const createContactResponse = await makeClioApiCall(
        'https://eu.app.clio.com/api/v4/contacts.json',
        'POST',
        { data: contactData },
        currentUser._id,
        currentUser.clioRefreshToken,
        currentToken
      );
      currentToken = createContactResponse.accessToken;
      if (createContactResponse.data && createContactResponse.data.id) {
        contactId = createContactResponse.data.id;
      } else {
        throw new Error('Failed to create contact: No valid contact ID returned from Clio API.');
      }
    }

    if (!contactId) {
      throw new Error('Clio contact ID could not be obtained after search or creation.');
    }

    // 2. Create Matter
    const matterTitle = `${intake.formData.immigrationBenefit || 'Immigration Case'} for ${intake.formData.firstName || ''} ${intake.formData.lastName || ''}`;
    const matterDescription = intake.formData.applicationReason || 'No specific reason provided.';
    const matterType = intake.formData.immigrationBenefit || 'General Immigration'; // Map to Clio practice area if possible

    const matterResponse = await makeClioApiCall(
      'https://eu.app.clio.com/api/v4/matters.json',
      'POST',
      {
        data: {
          client: { id: contactId },
          status: 'open',
          description: matterDescription,
          name: matterTitle,
          open_date: new Date().toISOString().split('T')[0], // Current date
          practice_area: { name: matterType }, // This might need to be an ID if Clio has strict practice area definitions
        },
      },
      currentUser._id,
      currentUser.clioRefreshToken,
      currentToken
    );
    currentToken = matterResponse.accessToken;
    if (!matterResponse.data) throw new Error('Failed to create matter');
    const matter = matterResponse.data;

    // 3. Create Note
    let noteContent = `Intake Data Summary:\n`;
    noteContent += `Submission Method: ${intake.intakeType || 'N/A'}\n`;
    noteContent += `Application Reason: ${intake.formData.applicationReason || 'N/A'}\n`;
    if (intake.riskAlerts && intake.riskAlerts.length > 0) {
      noteContent += `Risk Alerts: ${intake.riskAlerts.join(', ')}\n`;
    }
    noteContent += `\nFull Intake Form Data:\n${JSON.stringify(intake.formData, null, 2)}`;

    const noteResponse = await makeClioApiCall(
      'https://eu.app.clio.com/api/v4/notes.json',
      'POST',
      {
        data: {
          content: noteContent,
          matter: {
            id: matter.id,
          },
        },
      },
      currentUser._id,
      currentUser.clioRefreshToken,
      currentToken
    );
    currentToken = noteResponse.accessToken;

    // 4. Handle Document Uploads (Simulated for now)
    if (intake.formData.uploadedDocuments && intake.formData.uploadedDocuments.length > 0) {
      console.log(`Simulating upload of ${intake.formData.uploadedDocuments.length} documents to Clio for matter ID: ${matter.id}`);
      for (const doc of intake.formData.uploadedDocuments) {
        console.log(`  - Document: ${doc.name} (Type: ${doc.type}, Size: ${doc.size} bytes) would be uploaded here.`);
        // In a real implementation, you would retrieve the actual file from temporary storage
        // and then call a function like uploadDocumentToClio with the file buffer and metadata.
        // Example: await uploadDocumentToClioHelper(fileBuffer, doc.name, doc.type, matter.id, currentUser._id, currentUser.clioRefreshToken, currentToken);
      }
    }

    // 5. Update Intake Model with sync status and Clio Matter ID
    intake.clioSyncStatus = 'Synced';
    intake.clioMatterId = matter.id;
    await intake.save();

    return { success: true, intake };

  } catch (err) {
    console.error('Clio sync error:', err);
    return { success: false, message: err.message };
  }
};

// @desc    Initiate Clio OAuth2 flow
const getClioAuthUrl = asyncHandler(async (req, res) => {
  const scopes = [
    'read_contacts',
    'write_contacts',
    'read_matters',
    'write_matters',
    'write_notes',
    'write_custom_fields'
  ].join(' ');

  const authUrl = `https://app.clio.com/oauth/authorize?response_type=code&client_id=${CLIO_CLIENT_ID}&redirect_uri=${CLIO_REDIRECT_URI}&scope=${encodeURIComponent(scopes)}&state=${req.user._id}`;
  res.json({ authUrl });
});

// @desc    Handle Clio OAuth2 callback
const clioCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const userId = state;

  if (!code) {
    res.status(400);
    throw new Error('Authorization code not received');
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIO_CLIENT_ID);
    params.append('client_secret', CLIO_CLIENT_SECRET);
    params.append('redirect_uri', CLIO_REDIRECT_URI);
    params.append('code', code);

    const tokenResponse = await fetch('https://eu.app.clio.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokens = await tokenResponse.json();
    console.log('Clio Authorization Tokens:', tokens);

    if (tokens.access_token) {
      const user = await User.findById(userId);
      if (user) {
        user.clioAccessToken = tokens.access_token;
        user.clioRefreshToken = tokens.refresh_token;
        await user.save();
      } else {
        console.warn(`User not found for ID: ${userId}`);
      }
      res.redirect(CLIO_AUTH_SUCCESS_REDIRECT_URI);
    } else {
      res.status(tokenResponse.status || 400);
      throw new Error(`Token exchange failed: ${tokens.error_description || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('OAuth processing failed.');
  }
});

// @desc    Sync intake data to Clio
const syncToClio = asyncHandler(async (req, res) => {
  const { intakeLink, resync } = req.body;
  const intake = await Intake.findOne({ intakeLink });
  if (!intake) return res.status(404).json({ message: 'Intake not found' });

  const user = await User.findById(req.user?._id);
  if (!user || !user.clioAccessToken)
    return res.status(401).json({ message: 'Clio not authorized. Please authorize Clio first.' });

  const result = await syncIntakeToClio(intake, user.clioAccessToken, user, resync);

  if (result.success) {
    res.json({ message: 'Synced to Clio', intake: result.intake });
  } else {
    res.status(500).json({ message: `Clio sync failed: ${result.message}` });
  }
});

const getClioStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user && user.clioAccessToken) {
    res.json({ isConnected: true });
  } else {
    res.json({ isConnected: false });
  }
});

const uploadDocumentToClio = asyncHandler(async (req, res) => {
  const { intakeId, clioMatterId } = req.body;
  const file = req.file; // Assuming multer processes the file and attaches it to req.file

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!intakeId || !clioMatterId) {
    return res.status(400).json({ message: 'Intake ID and Clio Matter ID are required.' });
  }

  const user = await User.findById(req.user?._id);
  if (!user || !user.clioAccessToken) {
    return res.status(401).json({ message: 'Clio not authorized. Please authorize Clio first.' });
  }

  try {
    const form = new FormData();
    form.append('data', JSON.stringify({
      type: 'Document',
      name: file.originalname,
      matter: { id: clioMatterId },
      document_category: { name: 'Client Intake Documents' }, // Or a more specific category
    }), { contentType: 'application/json' });
    form.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });

    const response = await fetch('https://eu.app.clio.com/api/v4/documents.json', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.clioAccessToken}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Clio Document Upload Error Details:', errorData);
      throw new Error(errorData.error_description || `Clio document upload failed with status ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json({ message: 'Document uploaded to Clio successfully', document: data });
  } catch (error) {
    console.error('Error uploading document to Clio:', error);
    res.status(500).json({ message: `Failed to upload document to Clio: ${error.message}` });
  }
});

module.exports = {
  getClioAuthUrl,
  clioCallback,
  syncToClio,
  getClioStatus,
  syncIntakeToClio,
  uploadDocumentToClio,
};