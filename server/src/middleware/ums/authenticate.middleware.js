const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const {
    checkTokenValid,
    refreshGoogleToken,
    getProfile,
} = require("../../util/google.utils");

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    let accessToken =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

    if (!accessToken)
        return res.status(StatusCodes.UNAUTHORIZED).json({
            code: ReasonPhrases.UNAUTHORIZED,
            message: "access token not found",
        });

    try {
        let valid = await checkTokenValid(accessToken);
        if (!valid) {
            const newAccessToken = await refreshGoogleToken(accessToken);
            if (!newAccessToken)
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    code: ReasonPhrases.UNAUTHORIZED,
                    message: "Unable to refresh token",
                });
            accessToken = newAccessToken;
            res.setHeader("X-New-Token", newAccessToken);
        }
        userinfo = await getProfile(accessToken);
        if (!userinfo)
            return res.status(StatusCodes.UNAUTHORIZED).json({
                code: ReasonPhrases.UNAUTHORIZED,
                message: "Unable to fetch user info",
            });
        req.userinfo = userinfo;
        next();
    } catch (err) {
        console.error("Error in authenticate:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
