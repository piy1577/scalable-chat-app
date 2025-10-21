// jwt.service.js
const jwt = require("jsonwebtoken");

class JWTService {
    static instance = null;

    constructor() {
        if (JWTService.instance) return JWTService.instance;

        this.secret = process.env.JWT_SECRET || "default_secret";
        this.expiresIn = process.env.JWT_EXPIRES_IN || "1h"; // default 1 hour

        JWTService.instance = this;
    }

    static getInstance() {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        }
        return JWTService.instance;
    }

    sign(payload, options = {}) {
        try {
            const token = jwt.sign(payload, this.secret, {
                expiresIn: options.expiresIn || this.expiresIn,
                ...options,
            });
            return token;
        } catch (err) {
            console.error("❌ JWT Sign Error:", err);
            throw err;
        }
    }

    verify(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (err) {
            console.error("⚠️ JWT Verify Error:", err.message);
            return null;
        }
    }

    decode(token) {
        try {
            return jwt.decode(token);
        } catch (err) {
            console.error("⚠️ JWT Decode Error:", err.message);
            return null;
        }
    }
}
module.exports = JWTService;
