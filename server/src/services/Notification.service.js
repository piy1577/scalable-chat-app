const { SNS } = require("aws-sdk");
const SNS_ARN = process.env.SNS_ARN;
const region = "ap-south-1";

class NotificationService {
    static instance = null;

    constructor() {
        if (NotificationService.instance) return NotificationService.instance;
        this.notify = new SNS({ region });
    }

    static getInstance = () => {
        if (!NotificationService.instance)
            NotificationService.instance = new NotificationService();
        return NotificationService.instance;
    };

    sendMessage = async (roomId, senderId, content) => {
        if (!this.notify) return;
        await this.notify
            .publish({
                TopicArn: SNS_ARN,
                Subject: "send_message",
                Message: JSON.stringify({ roomId, senderId, content }),
            })
            .promise();
    };

    seenMessage = async (roomId, senderId) => {
        if (!this.notify) return;
        await this.notify
            .publish({
                TopicArn: SNS_ARN,
                Subject: "seen_message",
                Message: JSON.stringify({ roomId, senderId }),
            })
            .promise();
    };
}

module.exports = NotificationService;
