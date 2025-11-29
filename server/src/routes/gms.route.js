const { Router } = require("express");

const gmsRouter = Router();

/**
 * /create group
 * /add user to group
 * /leave grp
 * /remove user
 * /message info
 */

gmsRouter.post("/");
gmsRouter.post("/:id/addUser");
gmsRouter.post("/:id/leave");
gmsRouter.post("/:id/removeUser");
gmsRouter.get("/:id/info");
gmsRouter.delete("/:id");

module.exports = gmsRouter;
