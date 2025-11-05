const { SNS } = require("aws-sdk");
const SNS_ARN = process.env.SNS_ARN;
const region = "ap-south-1";

class NotificationService {
    static instance = null;

    static getInstance = () => {
        if (!instance) instance = new SNS({ region });
        return instance;
    };

    sendMessage = async (roomId, senderId, content) => {
        if (!instance) return;
        await instance
            .publish({
                TopicArn: SNS_ARN,
                Subject: "send_message",
                Message: JSON.stringify({ roomId, senderId, content }),
            })
            .promise();
    };

    seenMessage = async (roomId, senderId) => {
        if (!instance) return;
        await instance
            .publish({
                TopicArn: SNS_ARN,
                Subject: "seen_message",
                Message: JSON.stringify({ roomId, senderId }),
            })
            .promise();
    };
}

module.exports = NotificationService;
