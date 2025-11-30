const { Router } = require("express");
const getAllRoomsController = require("../controller/rms/getAllRooms.controller");
const createRoomController = require("../controller/rms/createRoom.controller");
const deleteRoomController = require("../controller/rms/deleteRoom.controller");

const rmsRouter = Router();

rmsRouter.get("/", getAllRoomsController); //get all rooms
rmsRouter.post("/", createRoomController); //create room
rmsRouter.delete("/:id", deleteRoomController); //delete room

module.exports = rmsRouter;
