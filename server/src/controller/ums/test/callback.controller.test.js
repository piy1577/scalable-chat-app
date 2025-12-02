const mockConn = {};

const mockDBService = {
    startTransaction: jest.fn().mockResolvedValue(mockConn),
    update: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    endTransaction: jest.fn(),
};

jest.mock("../../../services/db.service");
jest.mock("../../../model/ums/user.model");
jest.mock("../../../util/google.utils");

const DBService = require("../../../services/db.service");
DBService.mockImplementation(() => mockDBService);

const userModel = require("../../../model/ums/user.model");
const { generatetoken, getProfile } = require("../../../util/google.utils");
const { StatusCodes } = require("http-status-codes");

process.env.DATA_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.CLIENT_URL = "http://localhost:3000";

const callbackController = require("../callback.controller");

describe("callback Controller", () => {
    let mockReq;
    let mockRes;
    let mockJson;
    let mockStatus;
    let mockRedirect;

    beforeEach(() => {
        jest.clearAllMocks();

        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockRedirect = jest.fn();
        mockRes = {
            status: mockStatus,
            json: mockJson,
            redirect: mockRedirect,
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should handle OAuth callback successfully", async () => {
        mockReq = {
            query: { code: "auth-code-123" },
        };

        const mockTokenData = { access_token: "access-token-123" };
        const mockUserInfo = {
            id: "google-user-123",
            name: "John Doe",
            email: "john@example.com",
            picture: "http://example.com/picture.jpg",
        };

        generatetoken.mockResolvedValue(mockTokenData);
        getProfile.mockResolvedValue(mockUserInfo);

        await callbackController(mockReq, mockRes);

        expect(generatetoken).toHaveBeenCalledWith("auth-code-123");
        expect(getProfile).toHaveBeenCalledWith("access-token-123");
        expect(mockDBService.update).toHaveBeenCalledWith(
            userModel,
            {
                query: { email: "john@example.com" },
                data: {
                    $set: {
                        id: "google-user-123",
                        name: "John Doe",
                        picture: "http://example.com/picture.jpg",
                        email: "john@example.com",
                    },
                },
                one: true,
                upsert: true,
            },
            mockConn
        );
        expect(mockDBService.commitTransaction).toHaveBeenCalledWith(mockConn);
        expect(mockRedirect).toHaveBeenCalledWith(
            "http://localhost:3000/?token=access-token-123"
        );
    });

    test("should return bad request if OAuth error in query", async () => {
        mockReq = {
            query: { error: "access_denied" },
        };

        await callbackController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "Authentication failed",
            error: "access_denied",
        });
    });

    test("should return bad request if no authorization code", async () => {
        mockReq = {
            query: {},
        };

        await callbackController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "Authorization code is required",
        });
    });

    test("should return bad request if no access token in response", async () => {
        mockReq = {
            query: { code: "auth-code-123" },
        };

        generatetoken.mockResolvedValue({});

        await callbackController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "Invalid token response from Google",
        });
    });

    test("should return bad request if invalid user info", async () => {
        mockReq = {
            query: { code: "auth-code-123" },
        };

        generatetoken.mockResolvedValue({ access_token: "token" });
        getProfile.mockResolvedValue({});

        await callbackController(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            code: "Bad Request",
            message: "Failed to get user information",
        });
    });

    test("should rollback transaction on error", async () => {
        mockReq = {
            query: { code: "auth-code-123" },
        };

        generatetoken.mockResolvedValue({ access_token: "token" });
        getProfile.mockResolvedValue({
            id: "user123",
            name: "John",
            email: "john@example.com",
        });

        const error = new Error("Database error");
        mockDBService.update.mockRejectedValue(error);
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await callbackController(mockReq, mockRes);

        expect(mockDBService.rollbackTransaction).toHaveBeenCalledWith(
            mockConn
        );
        expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/");
        consoleSpy.mockRestore();
    });
});
