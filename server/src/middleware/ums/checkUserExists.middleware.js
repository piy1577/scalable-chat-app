const userModel = require("../../model/ums/user.model");
const DBService = require("../../services/db.service");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const EmailService = require("../../services/email.service");

const db = new DBService();
const emailSender = new EmailService();

module.exports = async (req, res, next) => {
    const { email: sender } = req.userInfo;
    const { email } = req.body;
    try {
        const user = await db.find(userModel, {
            query: { email: email.toLowerCase() },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });

        if (!user || user.length == 0) {
            const mail = {
                to: email,
                subject: "You're invited to join Chat App!",
                from: "Chat App Team",
                text: `Hi there!
You've been invited by ${sender} to join our chat app. Click the link below to get started:

${process.env.CLIENT_URL}

If you didn't expect this invitation, ignore this email.

Best regards,
Chat App Team`,
                html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 20px; border-radius: 8px;">
            <h2 style="text-align: center; color: #333;">You're Invited!</h2>
            <p style="color: #555;">Hi there! Join our chat app to connect with friends and colleagues in real-time.</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="${process.env.CLIENT_URL}"
                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Join Chat App
                </a>
            </p>
            <p style="font-size: 12px; color: #999; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
            </p>
        </div>
    </div>`,
            };

            await emailSender.sendEmail(mail);
            return res.status(StatusCodes.NOT_FOUND).json({
                code: ReasonPhrases.NOT_FOUND,
                message: "User not found. try again after user is joins",
            });
        }

        req.invitedUser = user.id;
        next();
    } catch (err) {
        console.error("error in check User exists: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
