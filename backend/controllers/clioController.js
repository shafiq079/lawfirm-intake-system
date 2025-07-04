
const asyncHandler = require('express-async-handler');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Intake = require('../models/intakeModel');
const User = require('../models/userModel');

const { CLIO_CLIENT_ID, CLIO_CLIENT_SECRET, CLIO_REDIRECT_URI, CLIO_AUTH_SUCCESS_REDIRECT_URI } = process.env;

if (!CLIO_CLIENT_ID || !CLIO_CLIENT_SECRET || !CLIO_REDIRECT_URI || !CLIO_AUTH_SUCCESS_REDIRECT_URI) {
  throw new Error('Missing required Clio environment variables');
}

const syncIntakeToClio = async (intake, token) => {
  try {
    // 1. Lookup or create contact
    const contactSearchRes = await fetch(`https://app.clio.com/api/v4/contacts.json?query=${intake.formData.email}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contactSearchData = await contactSearchRes.json();

    let contactId;
    if (contactSearchData.data?.length > 0) {
      contactId = contactSearchData.data[0].id;
    } else {
      const newContactRes = await fetch('https://app.clio.com/api/v4/contacts.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            type: 'Person',
            first_name: intake.formData.fullName?.split(' ')[0] || '',
            last_name: intake.formData.fullName?.split(' ').slice(1).join(' ') || '',
            email_addresses: intake.formData.email ? [{ type: 'Work', address: intake.formData.email }] : [],
            phone_numbers: intake.formData.phoneNumber ? [{ type: 'Work', number: intake.formData.phoneNumber }] : [],
          },
        }),
      });
      const newContact = await newContactRes.json();
      if (!newContact.data) throw new Error('Failed to create contact');
      contactId = newContact.data.id;
    }

    // 2. Create matter
    const matterRes = await fetch('https://app.clio.com/api/v4/matters.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          client: { type: 'Contact', id: contactId },
          status: 'Open',
          description: `Intake for ${intake.formData.fullName} - ${intake.intakeType || 'N/A'}`,
        },
      }),
    });
    const matter = await matterRes.json();
    if (!matter.data) throw new Error('Failed to create matter');

    // 3. Add note
    if (intake.summary) {
      await fetch('https://app.clio.com/api/v4/notes.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            content: intake.summary,
            subject_type: 'Matter',
            subject_id: matter.data.id,
          },
        }),
      });
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

  const result = await syncIntakeToClio(intake, user.clioAccessToken);

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
