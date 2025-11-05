const DBService = require("./service/db.service");
const messageModel = require("./model/message.model");

export const handler = async (event) => {
    const db = DBService.getInstance();
    const results = [];
    for (const record of event.Records) {
        try {
            const body = JSON.parse(record.body);

            const { roomId, senderId, content } = body || {};

            if (!roomId || !senderId || !content) {
                console.warn("Invalid message format:", body);
                continue;
            }

            const result = await db.insert(messageModel, {
                roomId,
                senderId,
                content,
            });

            console.log("Inserted message", result);
            results.push(result);
        } catch (err) {
            console.log(err, record);
        }
    }
};
