const { Router } = require("express");
const loginController = require("../controller/ums/login.controller");
const callbackController = require("../controller/ums/callback.controller");
const logoutController = require("../controller/ums/logout.controller");
const inviteUserController = require("../controller/ums/inviteUser.controller");
const getAllUserController = require("../controller/ums/getAllUser.controller");

const umsRouter = Router();

umsRouter.get("/", getAllUserController);
umsRouter.get("/login", loginController);
umsRouter.get("/callback", callbackController);
umsRouter.get("/logout", logoutController);
umsRouter.post("/inviteUser", inviteUserController);

module.exports = umsRouter;
