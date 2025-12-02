process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const mockConn = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    endSession: jest.fn(),
};

const mockDBService = {
    startTransaction: jest.fn().mockResolvedValue(mockConn),
    insertOne: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    endTransaction: jest.fn(),
};

jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group.model");
jest.mock("../../../model/gms/group_relation_user.model");

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);
const groupModel = require("../../../model/gms/group.model");
const groupRelationUserModel = require("../../../model/gms/group_relation_user.model");
const { StatusCodes } = require("http-status-codes");

const createGroupController = require("../createGroup.controller");
describe("createGroup Controller", () => {
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
            body: {
                name: "Test Group",
                description: "Test Description",
            },
            userinfo: { id: "user123" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should create group successfully", async () => {
        const mockGroup = {
            _id: "group123",
            name: "Test Group",
            description: "Test Description",
            createdBy: "user123",
        };

        mockDBService.insertOne
            .mockResolvedValueOnce([mockGroup]) // First call for group creation
            .mockResolvedValueOnce([]); // Second call for relation creation

        await createGroupController(mockReq, mockRes);

        expect(mockDBService.startTransaction).toHaveBeenCalled();
        expect(mockDBService.insertOne).toHaveBeenNthCalledWith(
            1,
            groupModel,
            {
                name: "Test Group",
                description: "Test Description",
                createdBy: "user123",
            },
            mockConn
        );
        expect(mockDBService.insertOne).toHaveBeenNthCalledWith(
            2,
            groupRelationUserModel,
            {
                groupId: mockGroup._id,
                userId: "user123",
                isAdmin: true,
            },
            mockConn
        );
        expect(mockDBService.commitTransaction).toHaveBeenCalledWith(mockConn);
        expect(mockDBService.endTransaction).toHaveBeenCalledWith(mockConn);
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Created",
            message: "Group created successfully",
            group: mockGroup,
        });
    });

    test("should handle missing body gracefully", async () => {
        mockReq.body = null;

        const mockGroup = {
            _id: "group123",
            name: "",
            description: "",
            createdBy: "user123",
        };

        mockDBService.insertOne
            .mockResolvedValueOnce([mockGroup])
            .mockResolvedValueOnce([]);

        await createGroupController(mockReq, mockRes);

        expect(mockDBService.insertOne).toHaveBeenNthCalledWith(
            1,
            groupModel,
            {
                name: "",
                description: "",
                createdBy: "user123",
            },
            mockConn
        );
    });

    test("should rollback transaction on error", async () => {
        const error = new Error("Database error");
        mockDBService.insertOne.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await createGroupController(mockReq, mockRes);

        expect(mockDBService.rollbackTransaction).toHaveBeenCalledWith(
            mockConn
        );
        expect(mockDBService.endTransaction).toHaveBeenCalledWith(mockConn);
        expect(consoleSpy).toHaveBeenCalledWith("create Group error: ", error);
        expect(mockStatus).toHaveBeenCalledWith(
            StatusCodes.INTERNAL_SERVER_ERROR
        );
        expect(mockJson).toHaveBeenCalledWith({
            code: "Internal Server Error",
            error,
        });
        consoleSpy.mockRestore();
    });

    test("should handle transaction start error", async () => {
        const error = new Error("Transaction start error");
        mockDBService.startTransaction.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await createGroupController(mockReq, mockRes);
        expect(consoleSpy).toHaveBeenCalledWith("create Group error: ", error);
        consoleSpy.mockRestore();
    });
});
