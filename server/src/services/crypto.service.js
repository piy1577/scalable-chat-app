const crypto = require("crypto");

const SECRET_KEY = Buffer.from(process.env.DATA_ENCRYPTION_KEY, "hex");

const ALGO = "aes-256-gcm";
class cryptoService {
    static encrypt = (value) => {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);

        const encrypted = Buffer.concat([
            cipher.update(value, "utf8"),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();

        return JSON.stringify({
            iv: iv.toString("hex"),
            content: encrypted.toString("hex"),
            tag: authTag.toString("hex"),
        });
    };

    static decrypt = (value) => {
        const { iv, content, tag } = JSON.parse(value);

        const decipher = crypto.createDecipheriv(
            ALGO,
            SECRET_KEY,
            Buffer.from(iv, "hex")
        );

        decipher.setAuthTag(Buffer.from(tag, "hex"));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(content, "hex")),
            decipher.final(),
        ]);

        return decrypted.toString("utf8");
    };
}

module.exports = cryptoService;
