const mockDBService = {
    find: jest.fn(),
};
jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group_relation_user.model");

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);

const removeUserController = require("../removeUser.controller");
const groupRelationUserModel = require("../../../model/gms/group_relation_user.model");
const { StatusCodes } = require("http-status-codes");

describe("removeUser Controller", () => {
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
            userinfo: { id: "admin123" },
            params: { id: "group456", userId: "user789" },
        };

        groupRelationUserModel.deleteOne = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should remove user from group successfully", async () => {
        mockDBService.find.mockResolvedValue({
            groupId: "group456",
            userId: "user789",
        });
        groupRelationUserModel.deleteOne.mockResolvedValue({});

        await removeUserController(mockReq, mockRes);

        expect(mockDBService.find).toHaveBeenCalledWith(
            groupRelationUserModel,
            {
                one: true,
                query: { groupId: "group456", userId: "user789" },
            }
        );
        expect(groupRelationUserModel.deleteOne).toHaveBeenCalledWith({
            groupId: "group456",
            userId: "user789",
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            message: "User removed from group successfully",
        });
    });

    test("should return bad request if user not in group", async () => {
        mockDBService.find.mockResolvedValue(null);

        await removeUserController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "User is not a member of this group",
        });
        expect(groupRelationUserModel.deleteOne).not.toHaveBeenCalled();
    });

    test("should return bad request if admin tries to remove themselves", async () => {
        mockReq.params.userId = "admin123";
        mockDBService.find.mockResolvedValue({
            groupId: "group456",
            userId: "admin123",
        });

        await removeUserController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "Admin cannot remove themselves from their own group",
        });
        expect(groupRelationUserModel.deleteOne).not.toHaveBeenCalled();
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBService.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await removeUserController(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith("remove user error:", error);
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
