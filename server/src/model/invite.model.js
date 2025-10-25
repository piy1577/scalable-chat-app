const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        senderId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true, strict: true }
);

const inviteModel = mongoose.model("Invite", inviteSchema);
module.exports = inviteModel;
