const { Router } = require("express");
const {
    login,
    callback,
    status,
    logout,
} = require("../controller/auth.controller");
const { authenticate } = require("../middleware/authenticate.middleware");

const authRouter = Router();

authRouter.get("/login", login);
authRouter.get("/callback", callback);
authRouter.get("/", authenticate, status);
authRouter.get("/logout", logout);

module.exports = authRouter;
