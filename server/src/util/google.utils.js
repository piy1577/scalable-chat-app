const GOOGLE = require("../constants/google.const");
const CONTENT_TYPE = require("../constants/HTTP_CONTENT_TYPE.const");
const METHODS = require("../constants/HTTP_METHOD.const");
const CacheService = require("../services/Cache.service");

const cache = new CacheService();

const generatetoken = async (code) => {
    const res = await fetch(GOOGLE.TOKEN_URL, {
        method: METHODS.POST,
        headers: {
            [CONTENT_TYPE.CONTENT_TYPE]: CONTENT_TYPE.urlEncoded,
        },
        body: new URLSearchParams({
            client_id: GOOGLE.CLIENT_ID,
            client_secret: GOOGLE.CLIENT_SECRET,
            redirect_uri: GOOGLE.REDIRECT_URI,
            code,
            grant_type: GOOGLE.GRANT_TYPE.code,
        }),
    });
    const data = await res.json();
    if (data.refresh_token) {
        cache.set(tokenData.access_token, tokenData.refresh_token);
    }
    return data;
};

const getProfile = async (token) => {
    const res = await fetch(GOOGLE.PROFILE_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
};

const revokeToken = async (token) => {
    const refresh_token = await cache.get(token);

    if (refresh_token) {
        const revokeResponse = await fetch(GOOGLE.REVOKE_TOKEN_URL, {
            method: METHODS.POST,
            headers: {
                [CONTENT_TYPE.CONTENT_TYPE]: CONTENT_TYPE.urlEncoded,
            },
            body: new URLSearchParams({
                token: refresh_token,
            }),
        });

        if (!revokeResponse.ok) {
            console.warn(
                "Failed to revoke refresh token:",
                revokeResponse.status
            );
        }
    }

    cache.delete(token);
};

const checkTokenValid = async (token) => {
    try {
        const res = await fetch(
            `${GOOGLE.TOKEN_INFO_URL}?access_token=${token}`
        );
        if (!res.ok) return false;
        return true;
    } catch (err) {
        console.error("Check token error: ", err);
        return false;
    }
};

async function refreshGoogleToken(token) {
    try {
        const refresh_token = cache.get(token);
        if (!refresh_token) return null;

        const res = await fetch(GOOGLE.TOKEN_URL, {
            method: METHODS.POST,
            headers: { [CONTENT_TYPE.CONTENT_TYPE]: CONTENT_TYPE.urlEncoded },
            body: new URLSearchParams({
                client_id: GOOGLE.CLIENT_ID,
                client_secret: GOOGLE.CLIENT_SECRET,
                refresh_token,
                grant_type: GOOGLE.GRANT_TYPE.token,
            }),
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        cache.delete(token);
        cache.set(data.access_token, refresh_token);
        return data.access_token;
    } catch (err) {
        console.error("refreshGoogleToken error:", err);
        return null;
    }
}

module.exports = {
    generatetoken,
    getProfile,
    revokeToken,
    checkTokenValid,
    refreshGoogleToken,
};
