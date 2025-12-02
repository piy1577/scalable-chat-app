process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const mockDBService = {
    find: jest.fn(),
};

jest.mock("../../../services/db.service");
jest.mock("../../../model/mms/messages.model");
jest.mock("../../../services/crypto.service");

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);

const messageModel = require("../../../model/mms/messages.model");
const cryptoService = require("../../../services/crypto.service");
cryptoService.decrypt = jest.fn();

const { StatusCodes } = require("http-status-codes");

const getAllMessageController = require("../getAllMessage.controller");

describe("getAllMessage Controller", () => {
    let mockReq;
    let mockRes;
    let mockJson;
    let mockStatus;

    beforeEach(() => {
        jest.clearAllMocks();

        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockRes = {
            status: mockStatus,
            json: mockJson,
        };

        mockReq = {
            params: { id: "room123" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should get and decrypt messages successfully", async () => {
        const mockMessages = [
            {
                senderId: "user1",
                message: "encrypted1",
                seen: true,
                createdAt: new Date(),
            },
            {
                senderId: "user2",
                message: "encrypted2",
                seen: false,
                createdAt: new Date(),
            },
        ];

        mockDBService.find.mockResolvedValue(mockMessages);
        cryptoService.decrypt
            .mockReturnValueOnce("decrypted message 1")
            .mockReturnValueOnce("decrypted message 2");

        await getAllMessageController(mockReq, mockRes);

        expect(mockDBService.find).toHaveBeenCalledWith(messageModel, {
            query: { roomId: "room123" },
            sort: { createdAt: -1 },
        });
        expect(cryptoService.decrypt).toHaveBeenCalledWith("encrypted1");
        expect(cryptoService.decrypt).toHaveBeenCalledWith("encrypted2");
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            count: 2,
            messages: [
                {
                    senderId: "user1",
                    seen: true,
                    message: "decrypted message 1",
                },
                {
                    senderId: "user2",
                    seen: false,
                    message: "decrypted message 2",
                },
            ],
        });
    });

    test("should handle empty messages", async () => {
        mockDBService.find.mockResolvedValue([]);

        await getAllMessageController(mockReq, mockRes);

        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            count: 0,
            messages: [],
        });
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBService.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await getAllMessageController(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith("fetch messages error:", error);
        expect(mockStatus).toHaveBeenCalledWith(
            StatusCodes.INTERNAL_SERVER_ERROR
        );
        expect(mockJson).toHaveBeenCalledWith({
            code: "Internal Server Error",
            error,
        });
        consoleSpy.mockRestore();
    });
});
