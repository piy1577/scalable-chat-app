const { Router } = require("express");
const createGroupController = require("../controller/gms/createGroup.controller");
const addUserController = require("../controller/gms/addUser.controller");
const getAllGroupsController = require("../controller/gms/getAllGroups.controller");
const leaveGroupController = require("../controller/gms/leaveGroup.controller");
const removeUserController = require("../controller/gms/removeUser.controller");
const groupInfoController = require("../controller/gms/groupInfo.controller");
const deleteGroupController = require("../controller/gms/deleteGroup.controller");

const gmsRouter = Router();

gmsRouter.get("/", getAllGroupsController);
gmsRouter.post("/", createGroupController);
gmsRouter.post("/:id/leave", leaveGroupController);
gmsRouter.get("/:id/info", groupInfoController);
gmsRouter.delete("/:id", deleteGroupController);
gmsRouter.post("/:id/addUser/:userId", addUserController);
gmsRouter.post("/:id/removeUser/:userId", removeUserController);

module.exports = gmsRouter;
