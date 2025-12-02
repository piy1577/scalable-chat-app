const DBService = require("../../services/db.service");
const roomModel = require("../../model/rms/room.model");

const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res, next) => {
    const { id } = req.userInfo;
    const { id: roomId } = req.params;
    try {
        const userRooms = await db.find(roomModel, {
            query: { _id: roomId },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });

        if (!userRooms) next();

        if (userRooms.participants.include(id)) {
            req.userRoom = true;
        }
        next();
    } catch (err) {
        console.error("error in check user Room: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
