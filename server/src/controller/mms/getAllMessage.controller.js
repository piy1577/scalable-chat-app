const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const messageModel = require("../../model/mms/messages.model");
const cryptoService = require("../../services/crypto.service");
const DBService = require("../../services/db.service");

const db = new DBService();

module.exports = async (req, res) => {
    const { id: groupId } = req.params; 

    try {
        const messages = await db.find(messageModel, {
            query: { roomId: groupId },
            sort: { createdAt: -1 },
        });

        const decryptedMessages = messages.map(
            ({ senderId, message, seen }) => ({
                senderId,
                seen,
                message: cryptoService.decrypt(message),
            })
        );

        return res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            count: messages.length,
            messages: decryptedMessages,
        });
    } catch (err) {
        console.error("fetch messages error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
