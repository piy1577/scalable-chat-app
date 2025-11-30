const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        participants: {
            type: [
                {
                    type: String,
                    ref: "ums_user",
                    required: true,
                },
            ],
            validate: {
                validator: (arr) => arr.length == 2,
                message: "A room must have at least two participants.",
            },
        },
    },
    { timestamps: true, strict: true }
);

roomSchema.index({ participants: 1 });

const roomModel = mongoose.model("rms_room", roomSchema);
module.exports = roomModel;
