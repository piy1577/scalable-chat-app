jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group_relation_user.model");

const DBService = require("../../../services/db.service");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const groupRelationUserModel = require("../../../model/gms/group_relation_user.model");

const mockDBInstance = {
    find: jest.fn(),
};
DBService.mockImplementation(() => mockDBInstance);

// Import after mocking
const getGroupUsers = require("../getGroupUsers.middleware");

describe("getGroupUsers Middleware", () => {
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
            params: { groupId: "group123" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should set req.users and call next() with group users", async () => {
        const mockUserGroups = [
            { groupId: "group123", userId: "user123" },
            { groupId: "group123", userId: "user456" },
            { groupId: "group123", userId: "user789" },
        ];
        mockDBInstance.find.mockResolvedValue(mockUserGroups);

        await getGroupUsers(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(
            groupRelationUserModel,
            {
                query: { groupId: "group123" },
                exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            }
        );
        expect(mockReq.users).toEqual([
            { roomId: "group123", userId: "user123", admin: true },
            { roomId: "group123", userId: "user456", admin: false },
            { roomId: "group123", userId: "user789", admin: false },
        ]);
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should handle empty group users array", async () => {
        mockDBInstance.find.mockResolvedValue([]);

        await getGroupUsers(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(
            groupRelationUserModel,
            {
                query: { groupId: "group123" },
                exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            }
        );
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

        await getGroupUsers(mockReq, mockRes, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith(
            "error in get group users: ",
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
