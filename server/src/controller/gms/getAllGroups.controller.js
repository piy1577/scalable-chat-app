const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");

const db = new DBService();

module.exports = async (req, res) => {
    const { id } = req.userinfo;

    try {
        // 1. fetch groups relations
        const groupRelations = await db.find(groupRelationUserModel, {
            query: { userId: id },
            exclude: { groupId: 1 },
        });

        //fetch groups from relations
        const groupIds = groupRelations.map((t) => t.groupId);

        const groups = await db.find(groupModel, {
            query: { _id: { $in: groupIds } },
        });
        return res.status(200).json({
            groups,
        });
    } catch (err) {
        console.error("fetch All Groups error: ", err);
        return res.status(500).json({
            message: "Unable to fetch all groups",
            error: err.message,
        });
    }
};
