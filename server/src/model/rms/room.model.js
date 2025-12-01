const mongoose = require("mongoose");
const messageModel = require("../mms/messages.model");

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

roomSchema.pre(
    "deleteOne",
    { document: true, query: false },
    async function (next) {
        const roomId = this._id;
        await messageModel.deleteMany({ roomId });
        next();
    }
);

roomSchema.pre("findOneAndDelete", async function (next) {
    const filter = this.getFilter();
    const room = await this.model.findOne(filter).select("_id");
    if (room) {
        await messageModel.deleteMany({ roomId: room._id });
    }
    next();
});

roomSchema.index({ participants: 1 });

const roomModel = mongoose.model("rms_room", roomSchema);
module.exports = roomModel;
