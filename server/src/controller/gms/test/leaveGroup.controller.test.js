const mockConn = {};

const mockDBService = {
    startTransaction: jest.fn().mockResolvedValue(mockConn),
    find: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    endTransaction: jest.fn(),
};

jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group.model");
jest.mock("../../../model/gms/group_relation_user.model");

process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);
const groupModel = require("../../../model/gms/group.model");
const groupRelationUserModel = require("../../../model/gms/group_relation_user.model");
const { StatusCodes } = require("http-status-codes");

const leaveGroupController = require("../leaveGroup.controller");

describe("leaveGroup Controller", () => {
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
            userinfo: { id: "user123" },
            params: { id: "group456" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should return bad request if user not in group", async () => {
        mockDBService.find.mockResolvedValue(null);

        await leaveGroupController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "User does not belong to this group",
        });
    });

    test("should leave group and assign new admin when admin leaves", async () => {
        const currentRelation = { isAdmin: true };
        const remainingMembers = [{ userId: "user789", createdAt: new Date() }];

        mockDBService.find
            .mockResolvedValueOnce(currentRelation)
            .mockResolvedValueOnce(remainingMembers);

        await leaveGroupController(mockReq, mockRes);

        expect(mockDBService.delete).toHaveBeenCalledWith(
            groupRelationUserModel,
            {
                query: { groupId: "group456", userId: "user123" },
                one: true,
            },
            mockConn
        );
        expect(mockDBService.update).toHaveBeenNthCalledWith(
            1,
            groupRelationUserModel,
            {
                query: { groupId: "group456", userId: "user789" },
                data: { isAdmin: true },
                one: true,
            },
            mockConn
        );
        expect(mockDBService.update).toHaveBeenNthCalledWith(
            2,
            groupModel,
            {
                query: { _id: "group456" },
                data: { createdBy: "user789" },
                one: true,
            },
            mockConn
        );
        expect(mockDBService.commitTransaction).toHaveBeenCalledWith(mockConn);
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            message: "Successfully left the group",
            adminChanged: true,
        });
    });

    test("should leave group without admin change when non-admin leaves", async () => {
        const currentRelation = { isAdmin: false };
        const remainingMembers = [{ userId: "user789", createdAt: new Date() }];

        mockDBService.find
            .mockResolvedValueOnce(currentRelation)
            .mockResolvedValueOnce(remainingMembers);

        await leaveGroupController(mockReq, mockRes);

        expect(mockDBService.update).not.toHaveBeenCalled();
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            message: "Successfully left the group",
            adminChanged: false,
        });
    });

    test("should delete group when no members left", async () => {
        const currentRelation = { isAdmin: false };

        mockDBService.find
            .mockResolvedValueOnce(currentRelation)
            .mockResolvedValueOnce([]);

        await leaveGroupController(mockReq, mockRes);

        expect(mockDBService.delete).toHaveBeenNthCalledWith(
            1,
            groupRelationUserModel,
            {
                query: { groupId: "group456", userId: "user123" },
                one: true,
            },
            mockConn
        );
        expect(mockDBService.delete).toHaveBeenNthCalledWith(
            2,
            groupModel,
            {
                query: { _id: "group456" },
                one: true,
            },
            mockConn
        );
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            message: "Group deleted because no members were left",
        });
    });

    test("should rollback transaction on error", async () => {
        const error = new Error("Database error");
        mockDBService.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await leaveGroupController(mockReq, mockRes);

        expect(mockDBService.rollbackTransaction).toHaveBeenCalledWith(
            mockConn
        );
        expect(mockDBService.endTransaction).toHaveBeenCalledWith(mockConn);
        expect(consoleSpy).toHaveBeenCalledWith("Leave Group Error:", error);
        expect(mockStatus).toHaveBeenCalledWith(
            StatusCodes.INTERNAL_SERVER_ERROR
        );
        consoleSpy.mockRestore();
    });
});
