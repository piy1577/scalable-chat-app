const { Router } = require("express");
const loginController = require("../controller/ums/login.controller");
const callbackController = require("../controller/ums/callback.controller");
const logoutController = require("../controller/ums/logout.controller");

const umsRouter = Router();

umsRouter.get("/login", loginController);
umsRouter.get("/callback", callbackController);
umsRouter.get("/logout", logoutController);

module.exports = umsRouter;
