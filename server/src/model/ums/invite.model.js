const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, lowercase: true },
        senderId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true, strict: true }
);

const inviteModel = mongoose.model("ums_user_invite", inviteSchema);
module.exports = inviteModel;
