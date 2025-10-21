const { Router } = require("express");
const {
    getAllUser,
    inviteUser,
    getUserMessage,
} = require("../controller/user.controller");
const { authenticate } = require("../middleware/authenticate.middleware");

const userRouter = Router();

userRouter.get("/", authenticate, getAllUser); //getAllRoomUSer
userRouter.post("/", authenticate, inviteUser); //invite a user
userRouter.get("/:id", authenticate, getUserMessage);
// userRouter.delete("/:id"); //delete user chats

module.exports = userRouter;
