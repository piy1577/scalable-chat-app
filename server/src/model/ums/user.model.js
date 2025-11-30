const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        name: { type: String, required: true },
        picture: { type: String },
    },
    { timestamps: true, strict: true }
);

const userModel = mongoose.model("ums_user", userSchema);
module.exports = userModel;
