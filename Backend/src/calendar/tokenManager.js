const { google } = require('googleapis');
const User = require('../models/User');

const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

const getAuthUrl = () => {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent' // Forces refresh_token to be returned every time
  });
};

const getTokens = async (code) => {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
};

// Refresh tokens if expired, update DB, and return valid tokens
const getValidTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.googleTokens) {
    throw new Error('User or Google tokens not found');
  }

  const tokens = user.googleTokens;
  const now = Date.now();

  // Check if token is expired (expiry_date is in milliseconds)
  if (tokens.expiry_date && tokens.expiry_date <= now + 60000) {
    // Token expired or expiring within 1 minute — refresh it
    const client = createOAuthClient();
    client.setCredentials(tokens);

    try {
      const { credentials } = await client.refreshAccessToken();
      // Update user's tokens in DB
      user.googleTokens = credentials;
      await user.save();
      return credentials;
    } catch (refreshErr) {
      throw new Error('Failed to refresh Google tokens: ' + refreshErr.message);
    }
  }

  return tokens;
};

const getAuthenticatedClient = (tokens) => {
  const client = createOAuthClient();
  client.setCredentials(tokens);
  return client;
};

module.exports = { createOAuthClient, getAuthUrl, getTokens, getValidTokens, getAuthenticatedClient };