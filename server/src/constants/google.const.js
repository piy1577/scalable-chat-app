const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

const serverUrl = process.env.SERVER_URL;
const redirect_uri = `${serverUrl}/api/ums/callback`;

module.exports = {
    LOGIN_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    TOKEN_URL: "https://oauth2.googleapis.com/token",
    REVOKE_TOKEN_URL: "https://oauth2.googleapis.com/revoke",
    PROFILE_URL: "https://www.googleapis.com/oauth2/v2/userinfo",
    CLIENT_ID: client_id,
    CLIENT_SECRET: client_secret,
    REDIRECT_URI: redirect_uri,
    RESPONSE_TYPE: "code",
    SCOPE: "openid%20email%20profile",
    ACCESS_TYPE: "offline",
    PROMPT: "consent",
    GRANT_TYPE: "authorization_code",
};
