const GOOGLE = require("../../constants/google.const");
const CONTENT_TYPE = require("../../constants/HTTP_CONTENT_TYPE.const");
const METHODS = require("../../constants/HTTP_METHOD.const");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");

const DBService = require("../../services/db.service");
const userModel = require("../../model/ums/user.model");

const db = new DBService();

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
            grant_type: GOOGLE.GRANT_TYPE,
        }),
    });
    return await res.json();
};

const getProfile = async (token) => {
    const res = await fetch(GOOGLE.PROFILE_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
};

module.exports = async (req, res) => {
    const { code, error: oauthError } = req.query;

    if (oauthError) {
        console.error("OAuth error:", oauthError);
        return res.status(StatusCodes.BAD_REQUEST).json({
            code: ReasonPhrases.BAD_REQUEST,
            message: "Authentication failed",
            error: oauthError,
        });
    }

    if (!code) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            code: ReasonPhrases.BAD_REQUEST,
            message: "Authorization code is required",
        });
    }
    let conn;
    try {
        const tokenData = await generatetoken(code);

        if (!tokenData.access_token) {
            console.error("Invalid token response:", tokenData);
            return res.status(StatusCodes.BAD_REQUEST).json({
                code: ReasonPhrases.BAD_REQUEST,
                message: "Invalid token response from Google",
            });
        }

        const userInfo = await getProfile(tokenData.access_token);

        if (!userInfo || !userInfo.email) {
            console.error("Invalid user info:", userInfo);
            return res.status(StatusCodes.BAD_REQUEST).json({
                code: ReasonPhrases.BAD_REQUEST,
                message: "Failed to get user information",
            });
        }
        conn = await db.startTransaction();

        await db.update(
            userModel,
            {
                query: { email: userInfo.email },
                data: {
                    $set: {
                        id: userInfo.id,
                        name: userInfo.name,
                        picture: userInfo.picture,
                        email: userInfo.email,
                    },
                },
                one: true,
                upsert: true,
            },
            conn
        );

        if (tokenData.refresh_token) {
            await cache.set(tokenData.access_token, tokenData.refresh_token);
        }

        
    } catch (err) {}
};
