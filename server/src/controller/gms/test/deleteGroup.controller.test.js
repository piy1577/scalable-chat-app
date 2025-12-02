process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const mockDBService = {
    delete: jest.fn(),
};
jest.mock("../../../services/db.service");
jest.mock("../../../model/gms/group.model");

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);

const groupModel = require("../../../model/gms/group.model");
const { StatusCodes } = require("http-status-codes");

const deleteGroupController = require("../deleteGroup.controller");

describe("deleteGroup Controller", () => {
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
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should delete group successfully", async () => {
        mockDBService.delete.mockResolvedValue({});

        await deleteGroupController(mockReq, mockRes);

        expect(mockDBService.delete).toHaveBeenCalledWith(groupModel, {
            query: { _id: "group123" },
            one: true,
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            message: "Group deleted successfully",
        });
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBService.delete.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await deleteGroupController(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith("delete Group error: ", error);
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
