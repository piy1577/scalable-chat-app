jest.mock("../../../services/db.service");
jest.mock("../../../model/rms/room.model");

const DBService = require("../../../services/db.service");
const roomModel = require("../../../model/rms/room.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const mockDBInstance = {
    find: jest.fn(),
};
DBService.mockImplementation(() => mockDBInstance);

// Import after mocking
const getAllRooms = require("../getAllRooms.middleware");

describe("getAllRooms Middleware", () => {
    let mockReq;
    let mockRes;
    let mockNext;
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

        mockNext = jest.fn();

        mockReq = {
            userInfo: { id: "user123" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should set req.users and call next() with user rooms", async () => {
        const mockUserRooms = [
            { _id: "room1", participants: ["user123", "user456"] },
            { _id: "room2", participants: ["user789", "user123"] },
            { _id: "room3", participants: ["user123", "user999"] },
        ];
        mockDBInstance.find.mockResolvedValue(mockUserRooms);

        await getAllRooms(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(roomModel, {
            query: { participants: { $in: ["user123"] } },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
        });
        expect(mockReq.users).toEqual([
            { roomId: "room1", userId: "user456" },
            { roomId: "room2", userId: "user789" },
            { roomId: "room3", userId: "user999" },
        ]);
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should handle empty user rooms array", async () => {
        mockDBInstance.find.mockResolvedValue([]);

        await getAllRooms(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(roomModel, {
            query: { participants: { $in: ["user123"] } },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
        });
        expect(mockReq.users).toEqual([]);
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBInstance.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await getAllRooms(mockReq, mockRes, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith(
            "error in get all rooms: ",
            error
        );
        expect(mockStatus).toHaveBeenCalledWith(
            StatusCodes.INTERNAL_SERVER_ERROR
        );
        expect(mockJson).toHaveBeenCalledWith({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error,
        });
        expect(mockNext).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
