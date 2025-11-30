const { ReasonPhrases, StatusCodes } = require("http-status-codes");

const DBService = require("../../services/db.service");
const userModel = require("../../model/ums/user.model");

const db = new DBService();

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

        await db.commitTransaction(conn);
        const clientUrl = new URL(process.env.CLIENT_URL);
        const redirectUrl = `${clientUrl.toString()}?token=${
            tokenData.access_token
        }`;
        res.redirect(redirectUrl);
    } catch (err) {
        await db.rollbackTransaction(conn);
        console.error("OAuth callback error:", err);
        const clientUrl = new URL(process.env.CLIENT_URL);
        res.redirect(clientUrl.toString());
    } finally {
        await db.endTransaction(conn);
    }
};
