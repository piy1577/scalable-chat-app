const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        roomId: { type: mongoose.Schema.ObjectId, ref: "Room", required: true },
        senderId: {
            type: String,
            required: true,
        },
        content: { type: String, required: true },
        seen: { type: Boolean, default: false },
    },
    { timestamps: true, strict: true }
);

const messageModel = mongoose.model("Message", messageSchema);
module.exports = messageModel;
