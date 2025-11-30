const messageModel = require("../../model/mms/messages.model");
const cryptoService = require("../../services/crypto.service");
const DBService = require("../../services/db.service");

const db = new DBService();

module.exports = async (req, res) => {
    const { id: groupId } = req.params; // groupId from params

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

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages: decryptedMessages,
        });
    } catch (err) {
        console.error("fetch messages error:", err);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch messages",
            error: err.message,
        });
    }
};
