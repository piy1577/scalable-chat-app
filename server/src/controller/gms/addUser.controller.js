const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");

const db = new DBService();

module.exports = async (req, res) => {
    const adminId = req.userinfo.id;
    const { id: groupId, userId } = req.params;

    try {
        const group = await db.find(groupModel, {
            one: true,
            query: { _id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.adminId.toString() !== adminId) {
            return res.status(403).json({
                message: "Only the group admin can add users",
            });
        }

        const existing = await db.find(groupRelationUserModel, {
            one: true,
            query: { groupId, userId },
        });

        if (existing) {
            return res.status(400).json({
                message: "User is already a member of this group",
            });
        }

        await db.insertOne(groupRelationUserModel, { groupId, userId });

        return res.status(200).json({
            message: "User added to group successfully",
        });
    } catch (err) {
        console.error("add user error:", err);
        return res.status(500).json({
            message: "Unable to add user to group",
            error: err.message,
        });
    }
};
