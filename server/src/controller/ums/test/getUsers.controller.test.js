const mockDBService = {
    find: jest.fn(),
};

jest.mock("../../../services/db.service");
jest.mock("../../../model/ums/user.model");

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);

const userModel = require("../../../model/ums/user.model");
const { StatusCodes } = require("http-status-codes");

process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const getUsersController = require("../getUsers.controller");

describe("getUsers Controller", () => {
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
            users: [
                { userId: "user1", roomId: "room123", admin: true },
                { userId: "user2", roomId: "room123", admin: false },
            ],
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should get users successfully", async () => {
        const mockUsersFromDB = [
            { id: "user1", name: "User One", email: "user1@example.com" },
            { id: "user2", name: "User Two", email: "user2@example.com" },
        ];

        mockDBService.find.mockResolvedValue(mockUsersFromDB);

        await getUsersController(mockReq, mockRes);

        expect(mockDBService.find).toHaveBeenCalledWith(userModel, {
            query: {
                id: { $in: ["user1", "user2"] },
            },
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            users: [
                {
                    id: "user1",
                    name: "User One",
                    email: "user1@example.com",
                    roomId: "room123",
                    admin: true,
                },
                {
                    id: "user2",
                    name: "User Two",
                    email: "user2@example.com",
                    roomId: "room123",
                    admin: false,
                },
            ],
        });
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBService.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});

        await getUsersController(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith("err in get users: ", error);
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
