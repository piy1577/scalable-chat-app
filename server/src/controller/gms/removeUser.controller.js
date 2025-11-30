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
            exclude: {},
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.adminId.toString() !== adminId) {
            return res.status(403).json({
                message: "Only the group admin can remove users",
            });
        }

        const relation = await db.find(groupRelationUserModel, {
            one: true,
            query: { groupId, userId },
        });

        if (!relation) {
            return res.status(400).json({
                message: "User is not a member of this group",
            });
        }

        if (userId === adminId) {
            return res.status(400).json({
                message: "Admin cannot remove themselves from their own group",
            });
        }

        await groupRelationUserModel.deleteOne({ groupId, userId });

        return res.status(200).json({
            message: "User removed from group successfully",
        });
    } catch (err) {
        console.error("remove user error:", err);
        return res.status(500).json({
            message: "Unable to remove user",
            error: err.message,
        });
    }
};
