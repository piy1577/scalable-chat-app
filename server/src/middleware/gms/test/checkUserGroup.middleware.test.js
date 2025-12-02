jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group_relation_user.model");

const DBService = require("../../../services/db.service");
const groupRelationUserModel = require("../../../model/gms/group_relation_user.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const mockDBInstance = {
    find: jest.fn(),
};
DBService.mockImplementation(() => mockDBInstance);

// Import after mocking
const checkUserGroup = require("../checkUserGroup.middleware");

describe("checkUserGroup Middleware", () => {
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
            params: { id: "group123" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should call next() if user is already in userRoom", async () => {
        mockReq.userRoom = true;

        await checkUserGroup(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should call next() if user is part of the group", async () => {
        const mockUserGroup = {
            groupId: "group123",
            userId: "user123",
        };
        mockDBInstance.find.mockResolvedValue(mockUserGroup);

        await checkUserGroup(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(
            groupRelationUserModel,
            {
                query: { groupId: "group123", userId: "user123" },
                exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
                one: true,
            }
        );
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should return 403 if user is not part of the group", async () => {
        mockDBInstance.find.mockResolvedValue(null);

        await checkUserGroup(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(
            groupRelationUserModel,
            {
                query: { groupId: "group123", userId: "user123" },
                exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
                one: true,
            }
        );
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
        expect(mockJson).toHaveBeenCalledWith({
            code: ReasonPhrases.FORBIDDEN,
            message: "user is not part of this chat",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBInstance.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await checkUserGroup(mockReq, mockRes, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith(
            "error in check User Group: ",
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
