jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group.model");

const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const DBService = require("../../../services/db.service");
const groupModel = require("../../../model/gms/group.model");

const mockDBInstance = {
    find: jest.fn(),
};
DBService.mockImplementation(() => mockDBInstance);

// Import after mocking
const checkGroupAdmin = require("../checkGroupAdmin.middleware");

describe("checkGroupAdmin Middleware", () => {
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
            userinfo: { id: "admin123" },
            params: { id: "group123" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should call next() if user is group admin", async () => {
        const mockGroup = {
            _id: "group123",
            adminId: "admin123",
        };
        mockDBInstance.find.mockResolvedValue(mockGroup);

        await checkGroupAdmin(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(groupModel, {
            one: true,
            query: { _id: "group123" },
            exclude: {},
        });
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should return 404 if group not found", async () => {
        mockDBInstance.find.mockResolvedValue(null);

        await checkGroupAdmin(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(groupModel, {
            one: true,
            query: { _id: "group123" },
            exclude: {},
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            code: ReasonPhrases.NOT_FOUND,
            message: "Group not found",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test("should return 403 if user is not group admin", async () => {
        const mockGroup = {
            _id: "group123",
            adminId: "otherAdmin456",
        };
        mockDBInstance.find.mockResolvedValue(mockGroup);

        await checkGroupAdmin(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(groupModel, {
            one: true,
            query: { _id: "group123" },
            exclude: {},
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
        expect(mockJson).toHaveBeenCalledWith({
            code: ReasonPhrases.FORBIDDEN,
            message: "Only the group admin have this permission",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBInstance.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});

        await checkGroupAdmin(mockReq, mockRes, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith(
            "error while checking group admin:",
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
