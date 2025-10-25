const nodemailer = require("nodemailer");

class EmailService {
    static instance = null;
    transporter = null;

    constructor() {
        if (EmailService.instance) return EmailService.instance;

        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: process.env.EMAIL_PORT
                ? parseInt(process.env.EMAIL_PORT)
                : 587,
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        this.transporter.verify((error, success) => {
            if (error) {
                console.error(
                    "❌ Email transporter verification failed:",
                    error
                );
            } else {
                console.log("✅ Email transporter is ready");
            }
        });

        EmailService.instance = this;
    }

    static getInstance() {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    async sendEmail({ to, subject, text, html, from }) {
        try {
            const info = await this.transporter.sendMail({
                from: from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to,
                subject,
                text,
                html,
            });

            console.log(`📧 Email sent: ${info.messageId}`);
            return info;
        } catch (err) {
            console.error("❌ Failed to send email:", err);
            throw err;
        }
    }
}

export default EmailService;
