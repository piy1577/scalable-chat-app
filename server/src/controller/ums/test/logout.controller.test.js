const { StatusCodes } = require("http-status-codes");

const logoutController = require("../logout.controller");
describe("logout Controller", () => {
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
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should logout successfully with valid token", async () => {
        mockReq = {
            headers: {
                authorization: "Bearer valid-token-123",
            },
        };

        await logoutController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
        expect(mockJson).toHaveBeenCalledWith({
            code: "OK",
            message: "Logged out successfully",
            timestamp: expect.any(String),
        });
    });

    test("should return bad request if no authorization header", async () => {
        mockReq = {
            headers: {},
        };

        await logoutController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "No active session found",
        });
    });

    test("should return bad request if authorization header doesn't start with Bearer", async () => {
        mockReq = {
            headers: {
                authorization: "Basic token123",
            },
        };

        await logoutController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "No active session found",
        });
    });

    test("should handle errors gracefully", async () => {
        mockReq = {
            headers: {
                authorization: "Bearer valid-token-123",
            },
        };

        // Mock Date.toISOString to throw error
        const originalToISOString = Date.prototype.toISOString;
        Date.prototype.toISOString = jest.fn().mockImplementation(() => {
            throw new Error("Date error");
        });

        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await logoutController(mockReq, mockRes);

        expect(consoleSpy).toHaveBeenCalledWith(
            "Logout error:",
            expect.any(Error)
        );
        expect(mockStatus).toHaveBeenCalledWith(
            StatusCodes.INTERNAL_SERVER_ERROR
        );
        expect(mockJson).toHaveBeenCalledWith({
            code: "Internal Server Error",
            error: expect.any(Error),
        });

        // Restore original method
        Date.prototype.toISOString = originalToISOString;
        consoleSpy.mockRestore();
    });
});
