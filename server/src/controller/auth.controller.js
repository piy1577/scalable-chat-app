const CacheService = require("../services/Cache.service");
const DBService = require("../services/db.service");
const { getGoogleUser } = require("../middleware/authenticate.middleware");
const userModel = require("../model/user.model");
const inviteModel = require("../model/invite.model");
const roomModel = require("../model/room.model");
const messageModel = require("../model/message.model");

const cache = CacheService.getInstance();
const db = DBService.getInstance();
const client_id = process.env.GOOGLE_CLIENT_ID;

const callback = async (req, res) => {
    try {
        const { code, error: oauthError } = req.query;

        if (oauthError) {
            console.error("OAuth error:", oauthError);
            return res.status(400).json({
                message: "Authentication failed",
                error: oauthError,
            });
        }

        if (!code) {
            return res.status(400).json({
                message: "Authorization code is required",
            });
        }

        validateEnvironmentVariables();
        const redirect_uri = getRedirectUri(req);

        const tokenResponse = await fetch(
            `https://oauth2.googleapis.com/token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id,
                    client_secret,
                    redirect_uri,
                    code,
                    grant_type: "authorization_code",
                }),
            }
        );

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Token exchange failed:", errorData);
            return res.status(400).json({
                message: "Failed to exchange authorization code",
            });
        }

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error("Invalid token response:", tokenData);
            return res.status(400).json({
                message: "Invalid token response from Google",
            });
        }

        const userInfo = await getGoogleUser(tokenData.access_token);

        if (!userInfo || !userInfo.email) {
            console.error("Invalid user info:", userInfo);
            return res.status(400).json({
                message: "Failed to get user information",
            });
        }

        const requiredFields = ["id", "email", "name", "picture"];
        for (const field of requiredFields) {
            if (!userInfo[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        await db.update(userModel, {
            query: { email: userInfo.email },
            data: {
                $set: {
                    id: userInfo.id,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    email: userInfo.email,
                    lastLogin: new Date(),
                },
            },
            one: true,
            upsert: true,
        });

        const checkInvites = await db.find(inviteModel, {
            query: { email: userInfo.email },
        });
        if (checkInvites && checkInvites.length > 0) {
            const insertValue = checkInvites.map(
                async (t) =>
                    await db.insert(roomModel, {
                        participants: [t.senderId, userInfo.id],
                    })
            );
            const rooms = await Promise.all(insertValue);

            for (let i = 0; i < rooms.length; i++) {
                const room = rooms[i];
                const invite = checkInvites[i];

                const inviterUser = await db.find(userModel, {
                    query: { id: invite.senderId },
                    one: true,
                });

                await db.insert(messageModel, {
                    roomId: room._id,
                    senderId: "system",
                    content: `${
                        inviterUser ? inviterUser.name : "User"
                    } created a chat message`,
                    createdAt: invite.createdAt,
                });

                await db.insert(messageModel, {
                    roomId: room._id,
                    senderId: "system",
                    content: `${userInfo.name} joined the chat message`,
                });
            }
            await db.delete(inviteModel, {
                query: { email: userInfo.email },
            });
        }
        if (tokenData.refresh_token) {
            await cache.set(tokenData.access_token, tokenData.refresh_token);
        }

        // Store token in a way that frontend can access it
        const clientUrl = new URL(process.env.CLIENT_URL);
        const redirectUrl = `${clientUrl.toString()}?token=${
            tokenData.access_token
        }`;
        res.redirect(redirectUrl);
    } catch (err) {
        console.error("OAuth callback error:", err);
        const clientUrl = new URL(process.env.CLIENT_URL);
        res.redirect(clientUrl.toString());
    }
};

const status = async (req, res) => {
    try {
        if (!req.userinfo) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        const { id, email, name, picture } = req.userinfo;

        if (!id || !email || !name) {
            console.error("Invalid user info:", req.userinfo);
            return res.status(400).json({
                message: "Invalid user data",
            });
        }

        const userData = await db.find(userModel, {
            query: { id },
            one: true,
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
        });

        if (!userData) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            id,
            email,
            name,
            picture,
            isActive: userData.isActive || false,
            lastLogin: userData.lastLogin,
        });
    } catch (err) {
        console.error("Status check error:", err);
        return res.status(500).json({
            message: "Failed to get user status",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const google_token =
            authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : null;

        if (!google_token) {
            return res.status(400).json({
                message: "No active session found",
            });
        }

        // Get refresh token from Redis
        const refresh_token = await cache.get(google_token);

        // Revoke refresh token if available
        if (refresh_token) {
            try {
                const revokeResponse = await fetch(
                    `https://oauth2.googleapis.com/revoke`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({
                            token: refresh_token,
                        }),
                    }
                );

                if (!revokeResponse.ok) {
                    console.warn(
                        "Failed to revoke refresh token:",
                        revokeResponse.status
                    );
                }
            } catch (err) {
                console.error("Error revoking refresh token:", err.message);
            }
        }

        // Clean up Redis
        try {
            await cache.delete(google_token);
        } catch (err) {
            console.error("Error deleting token from Redis:", err.message);
        }

        return res.status(200).json({
            message: "Logged out successfully",
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
            message: "Logout failed",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
};

module.exports = { login, callback, status, logout };
