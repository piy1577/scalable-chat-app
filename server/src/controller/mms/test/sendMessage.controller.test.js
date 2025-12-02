process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const mockNotify = {
    sendMessage: jest.fn(),
};

jest.mock("../../../services/Notification.service");
jest.mock("../../../services/user-mapping.service");

const NotificationService = require("../../../services/Notification.service");
NotificationService.getInstance.mockReturnValue(mockNotify);

const UserMappingService = require("../../../services/user-mapping.service");

const {
    socketConnect,
    sendMessage,
    disconnectSocket,
} = require("../sendMessage.controller");

describe("sendMessage Controller", () => {
    let mockSocket;
    let mockEmit;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEmit = jest.fn();
        mockSocket = {
            id: "socket123",
            emit: mockEmit,
            to: jest.fn().mockReturnValue({ emit: mockEmit }),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should connect socket successfully", async () => {
        UserMappingService.register = jest.fn();

        await socketConnect(mockSocket, "user123");

        expect(UserMappingService.register).toHaveBeenCalledWith(
            "user123",
            mockSocket
        );
    });

    test("should emit error for invalid socket connection data", async () => {
        const mockSocket = { emit: mockEmit };
        await socketConnect(mockSocket, null);

        expect(mockEmit).toHaveBeenCalledWith(
            "error",
            "Invalid socket connection data"
        );
    });

    test("should send message successfully", async () => {
        UserMappingService.socketIds = {
            get: jest.fn().mockReturnValue("user123"),
        };
        UserMappingService.getRoomUsers = jest
            .fn()
            .mockReturnValue(["socket1", "socket2"]);

        const data = { content: "Hello world", roomId: "room123" };

        await sendMessage(mockSocket, data);

        expect(UserMappingService.socketIds.get).toHaveBeenCalledWith(
            "socket123"
        );
        expect(mockNotify.sendMessage).toHaveBeenCalledWith(
            "room123",
            "user123",
            "Hello world"
        );
        expect(UserMappingService.getRoomUsers).toHaveBeenCalledWith("room123");
        expect(mockSocket.to).toHaveBeenCalledWith("socket1");
        expect(mockSocket.to).toHaveBeenCalledWith("socket2");
    });

    test("should handle send message error when user not authenticated", async () => {
        UserMappingService.socketIds = { get: jest.fn().mockReturnValue(null) };

        const data = { content: "Hello", roomId: "room123" };

        await sendMessage(mockSocket, data);

        expect(mockEmit).toHaveBeenCalledWith("error", {
            message: "User not authenticated",
        });
    });

    test("should disconnect socket", async () => {
        UserMappingService.disconnect = jest.fn();

        disconnectSocket(mockSocket);

        expect(UserMappingService.disconnect).toHaveBeenCalledWith(mockSocket);
    });
});
