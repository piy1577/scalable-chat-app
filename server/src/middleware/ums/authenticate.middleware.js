const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const {
    checkTokenValid,
    refreshGoogleToken,
    getProfile,
} = require("../../util/google.utils");

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const accessToken =
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
            const newAccessToken = await refreshGoogleToken(refresh_token);
            if (!newAccessToken)
                return res
                    .status(401)
                    .json({ message: "Unable to refresh token" });

            res.setHeader("X-New-Token", newAccessToken);

            userinfo = await getProfile(newAccessToken);
            if (!userinfo)
                return res
                    .status(401)
                    .json({ message: "Unable to fetch user info" });
        }
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
