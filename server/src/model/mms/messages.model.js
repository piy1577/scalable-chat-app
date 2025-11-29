const mongoose = require("mongoose");
const cryptoService = require("../../services/crypto.service");

const messageSchema = new mongoose.Schema(
    {
        roomId: { type: mongoose.Schema.ObjectId, required: true, index: true },
        senderId: {
            type: mongoose.Schema.ObjectId,
            ref: "ums_user",
            required: true,
        },
        message: { type: String, required: true },

        seen: { type: Boolean, default: false },
    },
    { timestamps: true }
);

messageSchema.pre("save", function (next) {
    if (this.isModified("message")) {
        this.message = cryptoService.encrypt(this.message);
    }
    next();
});

const messageModel = mongoose.model("mms_message", messageSchema);
module.exports = messageModel;
