const { Router } = require("express");
const {
    getAllUser,
    inviteUser,
    getUserMessage,
} = require("../controller/user.controller");
const { authenticate } = require("../middleware/authenticate.middleware");

const userRouter = Router();

userRouter.get("/", authenticate, getAllUser);
userRouter.post("/", authenticate, inviteUser);
userRouter.get("/:id", authenticate, getUserMessage);

module.exports = userRouter;
