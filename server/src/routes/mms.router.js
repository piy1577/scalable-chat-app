const { Router } = require("express");
const getAllMessageController = require("../controller/mms/getAllMessage.controller");
const mmsRouter = Router();

mmsRouter.get("/:id", getAllMessageController);

module.exports = mmsRouter;
