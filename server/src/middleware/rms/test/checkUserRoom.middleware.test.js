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
const checkUserRoom = require("../checkUserRoom.middleware");

describe("checkUserRoom Middleware", () => {
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
            params: { id: "room123" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should call next() if room not found", async () => {
        mockDBInstance.find.mockResolvedValue(null);

        await checkUserRoom(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(roomModel, {
            query: { _id: "room123" },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.userRoom).toBeUndefined();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should set req.userRoom to true if user is in room participants", async () => {
        const mockRoom = {
            _id: "room123",
            participants: ["user123", "user456"],
        };
        mockDBInstance.find.mockResolvedValue(mockRoom);

        await checkUserRoom(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(roomModel, {
            query: { _id: "room123" },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });
        expect(mockReq.userRoom).toBe(true);
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should not set req.userRoom if user is not in room participants", async () => {
        const mockRoom = {
            _id: "room123",
            participants: ["user456", "user789"],
        };
        mockDBInstance.find.mockResolvedValue(mockRoom);

        await checkUserRoom(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(roomModel, {
            query: { _id: "room123" },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });
        expect(mockReq.userRoom).toBeUndefined();
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBInstance.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await checkUserRoom(mockReq, mockRes, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith(
            "error in check user Room: ",
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
