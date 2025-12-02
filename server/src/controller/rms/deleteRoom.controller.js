const DBService = require("../../services/db.service");
const roomModel = require("../../model/rms/room.model");

const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    const { id } = req.userInfo;
    const { id: roomId } = req.params;
    let conn;
    try {
        conn = await db.startTransaction();
        const room = await db.find(
            roomModel,
            {
                query: { id: roomId },
                exclude: { participants: 1 },
                one: true,
            },
            conn
        );

        if (!room || !room.participants.include(id)) {
            await db.rollbackTransaction(conn);
            return res.status(StatusCodes.BAD_REQUEST).json({
                code: ReasonPhrases.BAD_REQUEST,
                message: "User is not a participants of chat",
            });
        }
        await db.delete(roomModel, {
            query: { id: roomId },
            one: true,
        });
        await db.commitTransaction(conn);
        res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            message: "CHAT DELETED SUCCESSFULLY",
        });
    } catch (err) {
        await db.rollbackTransaction(conn);
        console.error("error in deleting room: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    } finally {
        await db.endTransaction(conn);
    }
};
