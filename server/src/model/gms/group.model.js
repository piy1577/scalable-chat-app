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

groupSchema.pre(
    "deleteOne",
    { document: true, query: false },
    async function (next) {
        const groupId = this._id;
        await groupRelationUserModel.deleteMany({ groupId });
        next();
    }
);

groupSchema.pre("findOneAndDelete", async function (next) {
    const filter = this.getFilter();
    const group = await this.model.findOne(filter).select("_id");
    if (group) {
        await groupRelationUserModel.deleteMany({ groupId: group._id });
    }
    next();
});

const groupModel = mongoose.model("gms_group", groupSchema);
module.exports = groupModel;
