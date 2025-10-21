const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true }, // custom server id
        email: { type: String, required: true, unique: true, lowercase: true },
        name: { type: String, required: true },
        picture: { type: String },
        isActive: { type: Boolean, default: false },
    },
    { timestamps: true, strict: true }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
