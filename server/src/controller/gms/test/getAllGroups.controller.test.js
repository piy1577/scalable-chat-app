process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const mockDBService = {
    find: jest.fn(),
};
jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group.model");
jest.mock("../../../model/gms/group_relation_user.model");

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);

const groupModel = require("../../../model/gms/group.model");
const groupRelationUserModel = require("../../../model/gms/group_relation_user.model");
const { StatusCodes } = require("http-status-codes");

const getAllGroupsController = require("../getAllGroups.controller");

describe("getAllGroups Controller", () => {
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
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should get all groups for user successfully", async () => {
        const mockRelations = [{ groupId: "group1" }, { groupId: "group2" }];
        const mockGroups = [
            { _id: "group1", name: "Group 1" },
            { _id: "group2", name: "Group 2" },
        ];

        mockDBService.find
            .mockResolvedValueOnce(mockRelations)
            .mockResolvedValueOnce(mockGroups);

        await getAllGroupsController(mockReq, mockRes);

        expect(mockDBService.find).toHaveBeenNthCalledWith(
            1,
            groupRelationUserModel,
            {
                query: { userId: "user123" },
                exclude: { groupId: 1 },
            }
        );
        expect(mockDBService.find).toHaveBeenNthCalledWith(2, groupModel, {
            query: { _id: { $in: ["group1", "group2"] } },
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            groups: mockGroups,
        });
    });

    test("should handle empty relations", async () => {
        mockDBService.find.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

        await getAllGroupsController(mockReq, mockRes);

        expect(mockDBService.find).toHaveBeenNthCalledWith(2, groupModel, {
            query: { _id: { $in: [] } },
        });
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            groups: [],
        });
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBService.find.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await getAllGroupsController(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith(
            "fetch All Groups error: ",
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
