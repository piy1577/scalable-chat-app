const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const GOOGLE = require("../../constants/google.const");

module.exports = (req, res) => {
    try {
        const loginUrl = `${GOOGLE.LOGIN_URL}?client_id=${GOOGLE.CLIENT_ID}&redirect_uri=${GOOGLE.REDIRECT_URI}&response_type=${GOOGLE.RESPONSE_TYPE}&scope=${GOOGLE.SCOPE}&access_type=${GOOGLE.ACCESS_TYPE}&prompt=${GOOGLE.PROMPT}`;
        res.redirect(loginUrl);
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
