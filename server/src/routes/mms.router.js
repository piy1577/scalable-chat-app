const { Router } = require("express");
const getAllMessageController = require("../controller/mms/getAllMessage.controller");
const authenticateMiddleware = require("../middleware/ums/authenticate.middleware");
const checkUserRoomMiddleware = require("../middleware/rms/checkUserRoom.middleware");
const checkUserGroupMiddleware = require("../middleware/gms/checkUserGroup.middleware");
const mmsRouter = Router();

mmsRouter.get(
    "/:id",
    authenticateMiddleware,
    checkUserRoomMiddleware,
    checkUserGroupMiddleware,
    getAllMessageController
);

module.exports = mmsRouter;
