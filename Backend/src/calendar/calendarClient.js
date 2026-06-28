const { google } = require('googleapis');

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

const getAuthenticatedClient = (tokens) => {
  const client = createOAuthClient();
  client.setCredentials(tokens);
  return client;
};

module.exports = { createOAuthClient, getAuthUrl, getTokens, getAuthenticatedClient };