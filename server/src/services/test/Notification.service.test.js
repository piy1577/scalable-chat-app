const { SNS } = require("aws-sdk");

jest.mock("aws-sdk");

describe("NotificationService", () => {
    let notificationService;
    let mockSNS;
    let mockPublish;
    let NotificationService;

    beforeEach(() => {
        jest.clearAllMocks();

        mockPublish = jest.fn();
        mockSNS = jest.fn().mockImplementation(() => ({
            publish: mockPublish,
        }));

        SNS.mockImplementation(mockSNS);

        process.env.SNS_ARN = "arn:aws:sns:ap-south-1:123456789012:test-topic";

        NotificationService = require("../Notification.service.js");
        NotificationService.instance = null; // Reset singleton
        notificationService = NotificationService.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete process.env.SNS_ARN;
    });

    test("should create a singleton instance", () => {
        const instance1 = notificationService;
        const instance2 = notificationService.constructor.getInstance();
        expect(instance1).toBe(instance2);
    });

    test("should initialize SNS with correct region", () => {
        expect(SNS).toHaveBeenCalledWith({ region: "ap-south-1" });
    });

    test("should send message notification", async () => {
        mockPublish.mockReturnValue({
            promise: jest.fn().mockResolvedValue({ MessageId: "123" }),
        });

        const roomId = "room1";
        const senderId = "user1";
        const content = "Hello world";

        await notificationService.sendMessage(roomId, senderId, content);

        expect(mockPublish).toHaveBeenCalledWith({
            TopicArn: "arn:aws:sns:ap-south-1:123456789012:test-topic",
            Subject: "send_message",
            Message: JSON.stringify({ roomId, senderId, content }),
        });
    });

    test("should send seen message notification", async () => {
        mockPublish.mockReturnValue({
            promise: jest.fn().mockResolvedValue({ MessageId: "456" }),
        });

        const roomId = "room1";
        const senderId = "user1";

        await notificationService.sendMessage(roomId, senderId);

        expect(mockPublish).toHaveBeenCalledWith({
            TopicArn: "arn:aws:sns:ap-south-1:123456789012:test-topic",
            Subject: "send_message",
            Message: JSON.stringify({ roomId, senderId, content: undefined }),
        });
    });

    test("should send seen message notification correctly", async () => {
        mockPublish.mockReturnValue({
            promise: jest.fn().mockResolvedValue({ MessageId: "789" }),
        });

        const roomId = "room2";
        const senderId = "user2";

        await notificationService.seenMessage(roomId, senderId);

        expect(mockPublish).toHaveBeenCalledWith({
            TopicArn: "arn:aws:sns:ap-south-1:123456789012:test-topic",
            Subject: "seen_message",
            Message: JSON.stringify({ roomId, senderId }),
        });
    });

    test("should not send message if notify is not initialized", async () => {
        NotificationService.instance = null;
        const NotificationServiceNew = require("../Notification.service.js");
        const newInstance = new NotificationServiceNew();
        newInstance.notify = null;

        await newInstance.sendMessage("room1", "user1", "content");

        // Since notify is null, publish should not be called
        expect(mockPublish).not.toHaveBeenCalled();
    });

    test("should not send seen message if notify is not initialized", async () => {
        NotificationService.instance = null;
        const NotificationServiceNew = require("../Notification.service.js");
        const newInstance = new NotificationServiceNew();
        newInstance.notify = null;

        await newInstance.seenMessage("room1", "user1");

        expect(mockPublish).not.toHaveBeenCalled();
    });

    test("should handle publish errors", async () => {
        const error = new Error("Publish failed");
        mockPublish.mockReturnValue({
            promise: jest.fn().mockRejectedValue(error),
        });

        await expect(notificationService.sendMessage("room1", "user1", "content")).rejects.toThrow("Publish failed");
    });
});
