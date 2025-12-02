const { Router } = require("express");
const createRoomController = require("../controller/rms/createRoom.controller");
const deleteRoomController = require("../controller/rms/deleteRoom.controller");
const authenticateMiddleware = require("../middleware/ums/authenticate.middleware");
const checkUserExistsMiddleware = require("../middleware/ums/checkUserExists.middleware");

const rmsRouter = Router();

rmsRouter.post(
    "/",
    authenticateMiddleware,
    checkUserExistsMiddleware,
    createRoomController
);
rmsRouter.delete("/:id", authenticateMiddleware, deleteRoomController);

module.exports = rmsRouter;
