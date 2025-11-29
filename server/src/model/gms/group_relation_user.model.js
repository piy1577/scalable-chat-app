const mongoose = require("mongoose");

const groupRelationUserSchema = new mongoose.Schema(
    {
        participants: {
            type: [
                {
                    type: String,
                    ref: "ums_user",
                    required: true,
                },
            ],
        },
    },
    { timestamps: true, strict: true }
);

groupRelationUserSchema.index({ participants: 1 });

const groupRelationUserModel = mongoose.model("gms_group_relation_user", groupRelationUserSchema);
module.exports = groupRelationUserModel;
