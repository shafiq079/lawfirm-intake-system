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

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
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
    currentUser = await User.findById(currentUser._id);
    if (!currentUser || !currentUser.clioRefreshToken) {
      throw new Error('User not found or missing Clio refresh token');
    }

    if (intake.clioSyncStatus === 'Synced' && !resync) {
      return { success: false, message: 'Intake already synced to Clio. Use resync option to force.' };
    }

    if (!intake.fullName || !intake.email) {
        console.error('Sync failed: Intake form is incomplete. Full name and email are required.');
        return { success: false, message: 'Cannot sync an incomplete intake. Please ensure the form is filled out and submitted.' };
    }

    const [firstName, ...lastNameParts] = (intake.fullName || '').split(' ');
    const lastName = lastNameParts.join(' ');

    const contactData = {
      type: 'Person',
      first_name: firstName,
      last_name: lastName,
      email_addresses: intake.email ? [{ address: intake.email, default: true }] : [],
      phone_numbers: intake.phoneNumber ? [{ number: intake.phoneNumber, default: true }] : [],
      date_of_birth: intake.dateOfBirth || undefined,
    };

    let contactId = null;
    let contactSearchData = null;

    if (intake.email) {
      try {
        const contactSearchResponse = await makeClioApiCall(
          `https://eu.app.clio.com/api/v4/contacts.json?query=${encodeURIComponent(intake.email)}`,
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
      contactId = contactSearchData.data[0].id;
      console.log(`Updating existing Clio contact with ID: ${contactId}`);
      const updateContactResponse = await makeClioApiCall(
        `https://eu.app.clio.com/api/v4/contacts/${contactId}.json`,
        'PUT',
        { data: contactData },
        currentUser._id,
        currentUser.clioRefreshToken,
        currentToken
      );
      currentToken = updateContactResponse.accessToken;
    } else {
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
      if (createContactResponse.data.data && createContactResponse.data.data.id) {
        contactId = createContactResponse.data.data.id;
      } else {
        throw new Error('Failed to create contact: No valid contact ID returned from Clio API.');
      }
    }

    if (!contactId) {
      throw new Error('Clio contact ID could not be obtained after search or creation.');
    }

    const matterTitle = `${intake.visaType || 'Immigration Case'} for ${intake.fullName}`;
    const matterDescription = intake.immigrationGoal || 'No specific goal provided.';
    const matterType = intake.visaType || 'General Immigration';

    const matterResponse = await makeClioApiCall(
      'https://eu.app.clio.com/api/v4/matters.json',
      'POST',
      {
        data: {
          client: { id: contactId },
          status: 'open',
          description: matterDescription,
          name: matterTitle,
          open_date: new Date().toISOString().split('T')[0],
          practice_area: { name: matterType },
        },
      },
      currentUser._id,
      currentUser.clioRefreshToken,
      currentToken
    );
    currentToken = matterResponse.accessToken;
    if (!matterResponse.data.data) throw new Error('Failed to create matter');
    const matter = matterResponse.data.data;

    const noteSubject = `Intake Submission: ${intake.fullName}`;
    const noteDetail = `Full Intake Data:\n\n${JSON.stringify(intake.toObject(), null, 2)}`;

    const noteResponse = await makeClioApiCall(
      'https://eu.app.clio.com/api/v4/notes.json',
      'POST',
      {
        data: {
          type: 'Matter', // As per documentation
          subject: noteSubject,
          detail: noteDetail,
          date: new Date().toISOString().split('T')[0], // Required date field
          contact: { id: contactId }, // Associate contact with the note
          matter: { id: matter.id },
        },
      },
      currentUser._id,
      currentUser.clioRefreshToken,
      currentToken
    );
    currentToken = noteResponse.accessToken;

    intake.clioSyncStatus = 'Synced';
    intake.clioMatterId = matter.id;
    await intake.save();

    return { success: true, intake };

  } catch (err) {
    console.error('Clio sync error:', err);
    intake.clioSyncStatus = 'Failed';
    await intake.save();
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