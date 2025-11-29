const mongoose = require("mongoose");

const groupRelationUserSchema = new mongoose.Schema(
    {
        groupId: { type: mongoose.Schema.ObjectId, required: true },
        userId: { type: String, ref: "ums_user", required: true },
        isAdmin: { type: Boolean, default: false },
    },
    { timestamps: true, strict: true }
);

groupRelationUserSchema.index({ groupId: 1 });

const groupRelationUserModel = mongoose.model(
    "gms_group_relation_user",
    groupRelationUserSchema
);
module.exports = groupRelationUserModel;
