const { Router } = require("express");
const loginController = require("../controller/ums/login.controller");
const callbackController = require("../controller/ums/callback.controller");
const logoutController = require("../controller/ums/logout.controller");
const getAllRoomsMiddleware = require("../middleware/rms/getAllRooms.middleware");
const getUsersController = require("../controller/ums/getUsers.controller");
const authenticateMiddleware = require("../middleware/ums/authenticate.middleware");
const getGroupUsersMiddleware = require("../middleware/gms/getGroupUsers.middleware");

const umsRouter = Router();

umsRouter.get("/login", loginController);
umsRouter.get("/callback", callbackController);
umsRouter.get("/logout", logoutController);
umsRouter.get(
    "/",
    authenticateMiddleware,
    getAllRoomsMiddleware,
    getUsersController
);
umsRouter.get(
    "/:groupId",
    authenticateMiddleware,
    getGroupUsersMiddleware,
    getUsersController
);

module.exports = umsRouter;
