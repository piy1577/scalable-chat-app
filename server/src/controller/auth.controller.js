const RedisService = require("../services/Redis.service");
const DBService = require("../services/db.service");
const { getGoogleUser } = require("../middleware/authenticate.middleware");
const userModel = require("../model/user.model");

const redis = RedisService.getInstance();
const db = DBService.getInstance();
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

// Input validation helper
const validateEnvironmentVariables = () => {
    const requiredEnvVars = [
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "CLIENT_URL",
    ];
    const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
    }
};

// Generate secure redirect URI
const getRedirectUri = (req) => {
    if (!req.get("host")) {
        throw new Error("Host header is missing");
    }
    return `${req.protocol}://${req.get("host")}/api/auth/callback`;
};

const login = (req, res) => {
    try {
        validateEnvironmentVariables();

        const redirect_uri = getRedirectUri(req);
        const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

        console.log(
            "\x1b[33m%s\x1b[0m",
            `Redirecting to Google OAuth from IP: ${req.ip}`
        );
        res.redirect(loginUrl);
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({
            message: "Authentication service unavailable",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
};

const callback = async (req, res) => {
    try {
        const { code, error: oauthError } = req.query;

        // Handle OAuth errors
        if (oauthError) {
            console.error("OAuth error:", oauthError);
            return res.status(400).json({
                message: "Authentication failed",
                error: oauthError,
            });
        }

        // Validate authorization code
        if (!code) {
            return res.status(400).json({
                message: "Authorization code is required",
            });
        }

        validateEnvironmentVariables();
        const redirect_uri = getRedirectUri(req);

        // Exchange code for tokens
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

        // Validate token response
        if (!tokenData.access_token) {
            console.error("Invalid token response:", tokenData);
            return res.status(400).json({
                message: "Invalid token response from Google",
            });
        }

        // Get user info from Google
        const userInfo = await getGoogleUser(tokenData.access_token);

        if (!userInfo || !userInfo.email) {
            console.error("Invalid user info:", userInfo);
            return res.status(400).json({
                message: "Failed to get user information",
            });
        }

        // Validate required user fields
        const requiredFields = ["id", "email", "name"];
        for (const field of requiredFields) {
            if (!userInfo[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Update or create user in database
        const userUpdateResult = await db.update(userModel, {
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

        // Set secure cookie with access token
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        res.cookie("google_token", tokenData.access_token, cookieOptions);

        // Store refresh token in Redis if available
        if (tokenData.refresh_token) {
            await redis.set(tokenData.access_token, tokenData.refresh_token);
        }

        console.log(
            "\x1b[33m%s\x1b[0m",
            `User ${userInfo.email} authenticated successfully`
        );

        // Redirect to client with success state
        const clientUrl = new URL(process.env.CLIENT_URL);
        res.redirect(clientUrl.toString());
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
        const { google_token } = req.cookies || {};

        if (!google_token) {
            return res.status(400).json({
                message: "No active session found",
            });
        }

        // Get refresh token from Redis
        const refresh_token = await redis.get(google_token);

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
                } else {
                    console.log(
                        "\x1b[33m%s\x1b[0m",
                        "Refresh token revoked successfully"
                    );
                }
            } catch (err) {
                console.error("Error revoking refresh token:", err.message);
            }
        }

        // Clean up Redis
        try {
            await redis.delete(google_token);
        } catch (err) {
            console.error("Error deleting token from Redis:", err.message);
        }

        // Clear cookie
        res.clearCookie("google_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/", // Ensure cookie is cleared for all paths
        });

        console.log(
            `User logged out successfully, token: ${google_token.substring(
                0,
                10
            )}...`
        );

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
