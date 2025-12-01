const { StatusCodes, ReasonPhrases } = require("http-status-codes");

module.exports = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const google_token =
            authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : null;

        if (!google_token) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                code: ReasonPhrases.BAD_REQUEST,
                message: "No active session found",
            });
        }

        return res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            message: "Logged out successfully",
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
