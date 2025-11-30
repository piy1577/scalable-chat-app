const DBService = require("../../services/db.service");
const roomModel = require("../../model/rms/room.model");

const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    const { id } = req.userInfo;
    try {
        const userRooms = await db.find(roomModel, {
            query: { participants: { $in: [id] } },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
        });

        const userIds = userRooms.map(({ _id, participants }) => ({
            roomId: _id,
            userId: participants[0] === id ? participants[1] : participants[0],
        }));
        res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            users: userIds,
        });
    } catch (err) {
        console.error("error in get all rooms: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            message: err.message,
        });
    }
};
