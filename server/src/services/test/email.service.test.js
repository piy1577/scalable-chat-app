const nodemailer = require("nodemailer");

jest.mock("nodemailer");

describe("EmailService", () => {
    let emailService;
    let mockTransporter;
    let EmailService;

    beforeEach(() => {
        jest.clearAllMocks();

        mockTransporter = {
            sendMail: jest.fn(),
            verify: jest.fn(),
        };

        nodemailer.createTransport.mockReturnValue(mockTransporter);
        mockTransporter.verify.mockImplementation((callback) => callback(null, true));

        process.env.EMAIL_HOST = "smtp.gmail.com";
        process.env.EMAIL_PORT = "587";
        process.env.EMAIL_SECURE = "false";
        process.env.EMAIL_USER = "test@example.com";
        process.env.EMAIL_PASS = "password";
        process.env.CLIENT_URL = "http://localhost:3000";

        EmailService = require("../email.service.js");
        EmailService.instance = null; // Reset singleton
        emailService = EmailService.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete process.env.EMAIL_HOST;
        delete process.env.EMAIL_PORT;
        delete process.env.EMAIL_SECURE;
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;
        delete process.env.CLIENT_URL;
    });

    test("should create a singleton instance", () => {
        const instance1 = emailService;
        const instance2 = emailService.constructor.getInstance();
        expect(instance1).toBe(instance2);
    });

    test("should initialize transporter with correct config", () => {
        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "test@example.com",
                pass: "password",
            },
        });
    });

    test("should verify transporter", () => {
        expect(mockTransporter.verify).toHaveBeenCalled();
    });

    test("should send email with default from address", async () => {
        const emailData = {
            to: "recipient@example.com",
            subject: "Test Subject",
            text: "Test text",
            html: "<p>Test HTML</p>",
        };
        const mockInfo = { messageId: "123" };
        mockTransporter.sendMail.mockResolvedValue(mockInfo);

        const result = await emailService.sendEmail(emailData);

        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
            from: "test@example.com",
            to: "recipient@example.com",
            subject: "Test Subject",
            text: "Test text",
            html: "<p>Test HTML</p>",
            headers: {
                "X-Priority": "3",
                "X-Mailer": "Chat App Mailer",
                "List-Unsubscribe": "<http://localhost:3000/unsubscribe>",
            },
        });
        expect(result).toEqual(mockInfo);
    });

    test("should send email with custom from address", async () => {
        const emailData = {
            to: "recipient@example.com",
            subject: "Test Subject",
            from: "custom@example.com",
        };
        const mockInfo = { messageId: "456" };
        mockTransporter.sendMail.mockResolvedValue(mockInfo);

        const result = await emailService.sendEmail(emailData);

        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
            from: "custom@example.com",
            to: "recipient@example.com",
            subject: "Test Subject",
            text: undefined,
            html: undefined,
            headers: {
                "X-Priority": "3",
                "X-Mailer": "Chat App Mailer",
                "List-Unsubscribe": "<http://localhost:3000/unsubscribe>",
            },
        });
        expect(result).toEqual(mockInfo);
    });

    test("should handle sendMail errors", async () => {
        const emailData = {
            to: "recipient@example.com",
            subject: "Test Subject",
        };
        const error = new Error("Send failed");
        mockTransporter.sendMail.mockRejectedValue(error);

        await expect(emailService.sendEmail(emailData)).rejects.toThrow("Send failed");
    });

    test("should handle transporter verification error", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        EmailService.instance = null; // Reset to trigger new instance

        const EmailServiceNew = require("../email.service.js");
        EmailServiceNew.instance = null;

        mockTransporter.verify.mockImplementation((callback) => callback(new Error("Verification failed"), false));

        const newInstance = EmailServiceNew.getInstance();

        expect(consoleSpy).toHaveBeenCalledWith(
            "❌ Email transporter verification failed:",
            expect.any(Error)
        );
        consoleSpy.mockRestore();
    });
});
