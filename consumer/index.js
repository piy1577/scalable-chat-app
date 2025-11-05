const DBService = require("./service/db.service");
const messageModel = require("./model/message.model");

const handler = async (event) => {
    const db = DBService.getInstance();

    for (const record of event.Records) {
        try {
            const sns = record.Sns;
            const subject = sns.Subject;
            const message = JSON.parse(record.Message);

            const { roomId, senderId, content } = message || {};

            if (subject === "send_message") {
                if (!roomId || !senderId || !content) {
                    console.warn("Invalid message format:", message);
                    continue;
                }

                const result = await db.insert(messageModel, {
                    roomId,
                    senderId,
                    content,
                });
                console.log("Inserted message", result);
            } else {
                if (!roomId || !senderId) {
                    console.warn("Invalid message format:", message);
                    continue;
                }
                const result = await db.update(messageModel, {
                    query: { roomId, seen: false, senderId: { $ne: senderId } },
                    data: { $set: { seen: true } },
                });
                console.log("message marked as seen", result);
            }
        } catch (err) {
            console.log(err, record);
        }
    }
};

module.exports = { handler };
