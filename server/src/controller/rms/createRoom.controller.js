const DBService = require("../../services/db.service");
const roomModel = require("../../model/rms/room.model");

const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    const { id, userId } = req.userInfo;
    try {
        await db.insertOne(roomModel, {
            participants: [id, userId],
        });

        res.status(StatusCodes.CREATED).json({
            code: ReasonPhrases.CREATED,
            message: "CHAT CREATED SUCCESSFULLY",
        });
    } catch (err) {
        console.error("error in get all rooms: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            message: err.message,
        });
    }
};
