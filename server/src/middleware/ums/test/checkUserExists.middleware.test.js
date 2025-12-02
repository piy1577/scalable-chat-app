const userModel = require("../../../model/ums/user.model");
const DBService = require("../../../services/db.service");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const EmailService = require("../../../services/email.service");

jest.mock("../../../model/ums/user.model");
jest.mock("../../../services/db.service");
jest.mock("../../../services/email.service");

const mockDBInstance = {
    find: jest.fn(),
};
DBService.mockImplementation(() => mockDBInstance);

const mockEmailInstance = {
    sendEmail: jest.fn(),
};
EmailService.mockImplementation(() => mockEmailInstance);

const checkUserExists = require("../checkUserExists.middleware");

describe("checkUserExists Middleware", () => {
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
            userInfo: { email: "sender@example.com" },
            body: { email: "invitee@example.com" },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should send invitation email and return 404 if user does not exist", async () => {
        mockDBInstance.find.mockResolvedValue(null);
        mockEmailInstance.sendEmail.mockResolvedValue();

        await checkUserExists(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(userModel, {
            query: { email: "invitee@example.com" },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });
        expect(mockEmailInstance.sendEmail).toHaveBeenCalledWith({
            to: "invitee@example.com",
            subject: "You're invited to join Chat App!",
            from: "Chat App Team",
            text: `Hi there!
You've been invited by sender@example.com to join our chat app. Click the link below to get started:

https://example.com

If you didn't expect this invitation, ignore this email.

Best regards,
Chat App Team`,
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 20px; border-radius: 8px;">
            <h2 style="text-align: center; color: #333;">You're Invited!</h2>
            <p style="color: #555;">Hi there! Join our chat app to connect with friends and colleagues in real-time.</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="https://example.com"
                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Join Chat App
                </a>
            </p>
            <p style="font-size: 12px; color: #999; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
            </p>
        </div>
    </div>`,
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            code: ReasonPhrases.NOT_FOUND,
            message: "User not found. try again after user is joins",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test("should set req.invitedUser and call next() if user exists", async () => {
        const mockUser = { id: "user456", email: "invitee@example.com" };
        mockDBInstance.find.mockResolvedValue(mockUser);

        await checkUserExists(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(userModel, {
            query: { email: "invitee@example.com" },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });
        expect(mockEmailInstance.sendEmail).not.toHaveBeenCalled();
        expect(mockReq.invitedUser).toBe("user456");
        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    test("should handle empty user array as non-existent user", async () => {
        mockDBInstance.find.mockResolvedValue([]);
        mockEmailInstance.sendEmail.mockResolvedValue();

        await checkUserExists(mockReq, mockRes, mockNext);

        expect(mockDBInstance.find).toHaveBeenCalledWith(userModel, {
            query: { email: "invitee@example.com" },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });
        expect(mockEmailInstance.sendEmail).toHaveBeenCalledWith({
            to: "invitee@example.com",
            subject: "You're invited to join Chat App!",
            from: "Chat App Team",
            text: `Hi there!
You've been invited by sender@example.com to join our chat app. Click the link below to get started:

https://example.com

If you didn't expect this invitation, ignore this email.

Best regards,
Chat App Team`,
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 20px; border-radius: 8px;">
            <h2 style="text-align: center; color: #333;">You're Invited!</h2>
            <p style="color: #555;">Hi there! Join our chat app to connect with friends and colleagues in real-time.</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="https://example.com"
                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Join Chat App
                </a>
            </p>
            <p style="font-size: 12px; color: #999; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
            </p>
        </div>
    </div>`,
        });
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            code: ReasonPhrases.NOT_FOUND,
            message: "User not found. try again after user is joins",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test("should handle database errors", async () => {
        const error = new Error("Database error");
        mockDBInstance.find.mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await checkUserExists(mockReq, mockRes, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith("error in check User exists: ", error);
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error,
        });
        expect(mockNext).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    test("should handle email service errors", async () => {
        const error = new Error("Email service error");
        mockDBInstance.find.mockResolvedValue(null);
        mockEmailInstance.sendEmail.mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await checkUserExists(mockReq, mockRes, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith("error in check User exists: ", error);
        expect(mockStatus).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error,
        });
        expect(mockNext).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
