const asyncHandler = require('express-async-handler');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
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

const syncIntakeToClio = async (intake, token, user) => {
  let currentToken = token;
  let currentUser = user;

  try {
    // Get the latest user data to ensure we have the most current refresh token
    currentUser = await User.findById(currentUser._id);
    if (!currentUser || !currentUser.clioRefreshToken) {
      throw new Error('User not found or missing Clio refresh token');
    }

    // 1. Lookup or create contact
    let contactId = null; // Initialize contactId to null

    // 1. Lookup or create contact
    let contactSearchResponse;
    let contactSearchData = null; // Initialize to null
    try {
      contactSearchResponse = await makeClioApiCall(
        `https://eu.app.clio.com/api/v4/contacts.json?query=${encodeURIComponent(intake.formData.email)}`,
        'GET',
        null,
        currentUser._id,
        currentUser.clioRefreshToken,
        currentToken
      );
      currentToken = contactSearchResponse.accessToken;
      contactSearchData = contactSearchResponse.data;
    } catch (error) {
      console.warn('Contact search failed, attempting to create new contact:', error.message);
      // contactSearchData remains null, which will trigger the else block for creation
    }

    if (contactSearchData && contactSearchData.data?.length > 0) {
      contactId = contactSearchData.data[0].id;
    } else {
      if (!intake.formData.fullName) {
        throw new Error('Contact full name is required for Clio sync.');
      }
      const newContactResponse = await makeClioApiCall(
        'https://eu.app.clio.com/api/v4/contacts.json',
        'POST',
        {
          data: {
            type: 'Person',
            first_name: intake.formData.fullName?.split(' ')[0] || '',
            last_name: intake.formData.fullName?.split(' ').slice(1).join(' ') || '',
            email_addresses: intake.formData.email ? [{ name: 'Work', address: intake.formData.email, default_email: true }] : [],
            phone_numbers: intake.formData.phoneNumber ? [{ name: 'Work', number: intake.formData.phoneNumber, default_number: true }] : [],
          },
        },
        currentUser._id,
        currentUser.clioRefreshToken,
        currentToken
      );
      currentToken = newContactResponse.accessToken;
      if (newContactResponse.data && newContactResponse.data.id) {
        contactId = newContactResponse.data.id;
      } else {
        throw new Error('Failed to create contact: No valid contact ID returned from Clio API.');
      }
    }

    // Final check for contactId before proceeding to matter creation
    if (contactId === null) {
      throw new Error('Clio contact ID could not be obtained after search or creation.');
    }

    const matterResponse = await makeClioApiCall(
      'https://eu.app.clio.com/api/v4/matters.json',
      'POST',
      {
        data: {
          client: { id: contactId },
          status: 'open',
          description: `Intake for ${intake.formData.fullName} - ${intake.intakeType || 'N/A'}`,
        },
      },
      currentUser._id,
      currentUser.clioRefreshToken,
      currentToken
    );
    currentToken = matterResponse.accessToken;
    if (!matterResponse.data) throw new Error('Failed to create matter');
    const matter = matterResponse.data;

    if (intake.summary) {
      const noteResponse = await makeClioApiCall(
        'https://eu.app.clio.com/api/v4/notes.json',
        'POST',
        {
          data: {
            content: intake.summary,
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
    }

    intake.status = 'Synced to Clio';
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
  const { intakeLink } = req.body;
  const intake = await Intake.findOne({ intakeLink });
  if (!intake) return res.status(404).json({ message: 'Intake not found' });

  const user = await User.findById(req.user?._id);
  if (!user || !user.clioAccessToken)
    return res.status(401).json({ message: 'Clio not authorized. Please authorize Clio first.' });

  const result = await syncIntakeToClio(intake, user.clioAccessToken, user);

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

module.exports = {
  getClioAuthUrl,
  clioCallback,
  syncToClio,
  getClioStatus,
  syncIntakeToClio,
};