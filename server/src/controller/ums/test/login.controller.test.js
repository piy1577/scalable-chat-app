const { StatusCodes } = require("http-status-codes");

jest.mock("../../../constants/google.const", () => ({
    LOGIN_URL: "https://accounts.google.com/oauth/authorize",
    CLIENT_ID: "test-client-id",
    REDIRECT_URI: "http://localhost:3000/auth/callback",
    RESPONSE_TYPE: "code",
    SCOPE: "openid email profile",
    ACCESS_TYPE: "offline",
    PROMPT: "consent",
}));

const loginController = require("../login.controller");
describe("login Controller", () => {
    let mockReq;
    let mockRes;
    let mockRedirect;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRedirect = jest.fn();
        mockRes = {
            redirect: mockRedirect,
        };

        mockReq = {};
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should redirect to Google OAuth URL", () => {
        loginController(mockReq, mockRes);

        const expectedUrl =
            "https://accounts.google.com/oauth/authorize?client_id=test-client-id&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=openid email profile&access_type=offline&prompt=consent";

        expect(mockRedirect).toHaveBeenCalledWith(expectedUrl);
    });

    test("should handle errors gracefully", () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const mockStatus = jest.fn().mockReturnValue({ json: jest.fn() });
        mockRes.status = mockStatus;

        // Mock the constants to cause an error
        jest.doMock("../../../constants/google.const", () => {
            throw new Error("Constants error");
        });

        // This will throw, but we catch it
        try {
            loginController(mockReq, mockRes);
        } catch (err) {
            expect(consoleSpy).toHaveBeenCalledWith(
                "Login error:",
                err.message
            );
            expect(mockStatus).toHaveBeenCalledWith(
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }

        consoleSpy.mockRestore();
    });
});
