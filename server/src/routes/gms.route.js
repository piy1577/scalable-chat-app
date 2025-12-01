const { Router } = require("express");
const createGroupController = require("../controller/gms/createGroup.controller");
const addUserController = require("../controller/gms/addUser.controller");
const getAllGroupsController = require("../controller/gms/getAllGroups.controller");
const leaveGroupController = require("../controller/gms/leaveGroup.controller");
const removeUserController = require("../controller/gms/removeUser.controller");
const deleteGroupController = require("../controller/gms/deleteGroup.controller");
const authenticateMiddleware = require("../middleware/ums/authenticate.middleware");
const checkGroupAdminMiddleware = require("../middleware/gms/checkGroupAdmin.middleware");
const checkUserExistsMiddleware = require("../middleware/ums/checkUserExists.middleware");

const gmsRouter = Router();

gmsRouter.get("/", authenticateMiddleware, getAllGroupsController);
gmsRouter.post("/", authenticateMiddleware, createGroupController);
gmsRouter.post("/:id/leave", authenticateMiddleware, leaveGroupController);
gmsRouter.delete("/:id", authenticateMiddleware, deleteGroupController);
gmsRouter.post(
    "/:id/addUser",
    authenticateMiddleware,
    checkGroupAdminMiddleware,
    checkUserExistsMiddleware,
    addUserController
);
gmsRouter.post(
    "/:id/removeUser/:userId",
    authenticateMiddleware,
    checkGroupAdminMiddleware,
    removeUserController
);

module.exports = gmsRouter;
