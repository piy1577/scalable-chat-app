const DBService = require("../../../services/db.service");
const groupRelationUserModel = require("../../../model/gms/group_relation_user.model");
const { StatusCodes } = require("http-status-codes");

jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group_relation_user.model");

process.env.DATA_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const mockDBInstance = {
    find: jest.fn(),
    insertOne: jest.fn(),
};
DBService.mockImplementation(() => mockDBInstance);

// Import after mocking
const addUserController = require("../addUser.controller");

describe("addUser Controller", () => {
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
            params: { id: "group123" },
            invitedUser: "user456",
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should add user to group successfully", async () => {
        mockDBInstance.find.mockResolvedValue(null);
        mockDBInstance.insertOne.mockResolvedValue({});

        await addUserController(mockReq, mockRes);

        expect(mockDBInstance.find).toHaveBeenCalledWith(groupRelationUserModel, {
            one: true,
            query: { groupId: "group123", userId: "user456" },
        });
        expect(mockDBInstance.insertOne).toHaveBeenCalledWith(groupRelationUserModel, {
            groupId: "group123",
            userId: "user456",
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            message: "User added to group successfully",
        });
    });

    test("should return bad request if user is already in group", async () => {
        mockDBInstance.find.mockResolvedValue({ groupId: "group123", userId: "user456" });

        await addUserController(mockReq, mockRes);

        expect(mockDBInstance.find).toHaveBeenCalledWith(groupRelationUserModel, {
            one: true,
            query: { groupId: "group123", userId: "user456" },
        });
        expect(mockDBInstance.insertOne).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "User is already a member of this group",
        });
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBInstance.find.mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await addUserController(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith("add user error:", error);
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Internal Server Error",
            error,
        });
        consoleSpy.mockRestore();
    });
});
