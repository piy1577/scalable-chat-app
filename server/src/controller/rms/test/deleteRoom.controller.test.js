process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

jest.mock("../../../services/db.service");
jest.mock("../../../model/rms/room.model");

const mockConn = {};

const mockDBService = {
    startTransaction: jest.fn().mockResolvedValue(mockConn),
    find: jest.fn(),
    delete: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    endTransaction: jest.fn(),
};

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);

const roomModel = require("../../../model/rms/room.model");
const { StatusCodes } = require("http-status-codes");

const deleteRoomController = require("../deleteRoom.controller");

describe("deleteRoom Controller", () => {
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
            params: { id: "room456" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should delete room successfully", async () => {
        const mockRoom = { participants: ["user123", "user456"] };
        mockDBService.find.mockResolvedValue(mockRoom);

        await deleteRoomController(mockReq, mockRes);

        expect(mockDBService.find).toHaveBeenCalledWith(
            roomModel,
            {
                query: { id: "room456" },
                exclude: { participants: 1 },
                one: true,
            },
            mockConn
        );
        expect(mockDBService.delete).toHaveBeenCalledWith(roomModel, {
            query: { id: "room456" },
            one: true,
        });
        expect(mockDBService.commitTransaction).toHaveBeenCalledWith(mockConn);
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            message: "CHAT DELETED SUCCESSFULLY",
        });
    });

    test("should return bad request if user not participant", async () => {
        const mockRoom = { participants: ["user456", "user789"] };
        mockDBService.find.mockResolvedValue(mockRoom);

        await deleteRoomController(mockReq, mockRes);

        expect(mockDBService.rollbackTransaction).toHaveBeenCalledWith(
            mockConn
        );
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "User is not a participants of chat",
        });
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBService.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await deleteRoomController(mockReq, mockRes);

        expect(mockDBService.rollbackTransaction).toHaveBeenCalledWith(
            mockConn
        );
        expect(consoleSpy).toHaveBeenCalledWith(
            "error in deleting room: ",
            error
        );
        expect(mockStatus).toHaveBeenCalledWith(
            StatusCodes.INTERNAL_SERVER_ERROR
        );
        consoleSpy.mockRestore();
    });
});
