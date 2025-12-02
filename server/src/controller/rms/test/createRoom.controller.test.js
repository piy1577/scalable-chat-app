process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

jest.mock("../../../services/db.service");
jest.mock("../../../model/rms/room.model");

const mockDBService = {
    insertOne: jest.fn(),
};

const DBService = require("../../../services/db.service");

DBService.mockImplementation(() => mockDBService);
const roomModel = require("../../../model/rms/room.model");
const { StatusCodes } = require("http-status-codes");

const createRoomController = require("../createRoom.controller");
describe("createRoom Controller", () => {
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
            userInfo: { id: "user123" },
            invitedUser: "user456",
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should create room successfully", async () => {
        mockDBService.insertOne.mockResolvedValue({});

        await createRoomController(mockReq, mockRes);

        expect(mockDBService.insertOne).toHaveBeenCalledWith(roomModel, {
            participants: ["user123", "user456"],
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Created",
            message: "CHAT CREATED SUCCESSFULLY",
        });
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBService.insertOne.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await createRoomController(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith(
            "error in get all rooms: ",
            error
        );
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
