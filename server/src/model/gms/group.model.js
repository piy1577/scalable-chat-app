const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        picture: { type: String, default: "" },
        description: { type: String },
        createdBy: { type: String, required: true },
    },
    { timestamps: true, strict: true }
);

const groupModel = mongoose.model("gms_group", groupSchema);
module.exports = groupModel;
