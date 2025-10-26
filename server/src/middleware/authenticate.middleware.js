const CacheService = require("../services/Cache.service");
const cache = CacheService.getInstance();

async function getGoogleUser(access_token) {
    try {
        const res = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: { Authorization: `Bearer ${access_token}` },
            }
        );
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("getGoogleUser error:", err);
        return null;
    }
}
async function refreshGoogleToken(refresh_token) {
    try {
        const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                refresh_token,
                grant_type: "refresh_token",
            }),
        });

        if (!res.ok) {
            console.error("Failed to refresh token:", await res.text());
            return null;
        }

        const data = await res.json();
        return data.access_token;
    } catch (err) {
        console.error("refreshGoogleToken error:", err);
        return null;
    }
}

const authenticate = async (req, res, next) => {
    const { google_token } = req.cookies || {};
    console.log("ACCESS_TOKEN: ", google_token);
    if (!google_token)
        return res
            .status(401)
            .json({ message: "UNAUTHORIZED", issue: "access token not found" });

    try {
        let userinfo = await getGoogleUser(google_token);
        if (!userinfo) {
            const refresh_token = await cache.get(google_token);
            if (!refresh_token)
                return res.status(401).json({
                    message: "UNAUTHORIZED",
                    issue: "refresh token not found",
                });

            const newAccessToken = await refreshGoogleToken(refresh_token);
            if (!newAccessToken)
                return res
                    .status(401)
                    .json({ message: "Unable to refresh token" });

            await cache.delete(google_token);
            await cache.set(newAccessToken, refresh_token);

            res.cookie("google_token", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            userinfo = await getGoogleUser(newAccessToken);
            if (!userinfo)
                return res
                    .status(401)
                    .json({ message: "Unable to fetch user info" });
        }
        req.userinfo = userinfo;
        next();
    } catch (err) {
        console.error("Error in /status:", err);
        return res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
};

module.exports = { getGoogleUser, authenticate };
