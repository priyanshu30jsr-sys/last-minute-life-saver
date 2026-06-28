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
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      // Changed from full /calendar to /calendar.events to bypass policy blocks
      'https://www.googleapis.com/auth/calendar.events', 
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent' 
  });

  // CRITICAL DEBUG LOG: If it still fails, copy this exact string from Render logs!
  console.log("=== OAUTH URL BEING SENT TO GOOGLE ===", authUrl);
  
  return authUrl;
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