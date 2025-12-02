const crypto = require("crypto");

jest.mock("crypto");

describe("cryptoService", () => {
    let cryptoService;
    let mockCipher;
    let mockDecipher;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.DATA_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 64 hex chars for 32 bytes

        mockCipher = {
            update: jest.fn().mockReturnValue(Buffer.from("encrypted")),
            final: jest.fn().mockReturnValue(Buffer.from("final")),
            getAuthTag: jest.fn().mockReturnValue(Buffer.from("tag")),
        };

        mockDecipher = {
            setAuthTag: jest.fn(),
            update: jest.fn().mockReturnValue(Buffer.from("decrypted")),
            final: jest.fn().mockReturnValue(Buffer.from("final")),
        };

        crypto.randomBytes.mockReturnValue(Buffer.from("123456789012")); // 12 bytes IV
        crypto.createCipheriv.mockReturnValue(mockCipher);
        crypto.createDecipheriv.mockReturnValue(mockDecipher);
        crypto.Buffer = Buffer;

        cryptoService = require("../crypto.service.js");
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete process.env.DATA_ENCRYPTION_KEY;
    });

    test("should encrypt value correctly", () => {
        const result = cryptoService.encrypt("test value");
        const parsed = JSON.parse(result);

        expect(crypto.randomBytes).toHaveBeenCalledWith(12);
        expect(crypto.createCipheriv).toHaveBeenCalledWith(
            "aes-256-gcm",
            Buffer.from(process.env.DATA_ENCRYPTION_KEY, "hex"),
            Buffer.from("123456789012")
        );
        expect(mockCipher.update).toHaveBeenCalledWith("test value", "utf8");
        expect(mockCipher.final).toHaveBeenCalled();
        expect(mockCipher.getAuthTag).toHaveBeenCalled();
        expect(parsed).toHaveProperty("iv", "313233343536373839303132");
        expect(parsed).toHaveProperty("content");
        expect(parsed).toHaveProperty("tag");
    });

    test("should decrypt value correctly", () => {
        const encryptedData = JSON.stringify({
            iv: "1234567890123456", // hex
            content: "encryptedcontent",
            tag: "authtag123",
        });

        const result = cryptoService.decrypt(encryptedData);

        expect(crypto.createDecipheriv).toHaveBeenCalledWith(
            "aes-256-gcm",
            Buffer.from(process.env.DATA_ENCRYPTION_KEY, "hex"),
            Buffer.from("1234567890123456", "hex")
        );
        expect(mockDecipher.setAuthTag).toHaveBeenCalledWith(Buffer.from("authtag123", "hex"));
        expect(mockDecipher.update).toHaveBeenCalledWith(Buffer.from("encryptedcontent", "hex"));
        expect(mockDecipher.final).toHaveBeenCalled();
        expect(result).toBe("decryptedfinal");
    });

    test("should handle encryption errors", () => {
        mockCipher.update.mockImplementation(() => {
            throw new Error("Encryption error");
        });
        expect(() => cryptoService.encrypt("test")).toThrow();
    });

    test("should handle decryption errors", () => {
        const encryptedData = JSON.stringify({
            iv: "1234567890123456",
            content: "encryptedcontent",
            tag: "authtag123",
        });

        mockDecipher.update.mockImplementation(() => {
            throw new Error("Decryption error");
        });
        expect(() => cryptoService.decrypt(encryptedData)).toThrow();
    });
});
