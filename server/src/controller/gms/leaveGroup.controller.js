const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");

const db = new DBService();

module.exports = async (req, res) => {
    let conn;
    const { id: userId } = req.userinfo.id;
    const { id: groupId } = req.params;

    try {
        conn = await db.startTransaction();

        const currentRelation = await db.find(
            groupRelationUserModel,
            { query: { groupId, userId }, one: true },
            conn
        );

        if (!currentRelation) {
            throw new Error("User does not belong to this group");
        }

        const isAdminLeaving = currentRelation.isAdmin;

        await db.delete(
            groupRelationUserModel,
            { query: { groupId, userId }, one: true },
            conn
        );

        const remainingMembers = await db.find(
            groupRelationUserModel,
            {
                query: { groupId },
                sort: { createdAt: 1 },
            },
            conn
        );

        if (remainingMembers.length === 0) {
            await db.delete(
                groupModel,
                { query: { _id: groupId }, one: true },
                conn
            );

            await db.commitTransaction(conn);
            return res.status(200).json({
                message: "Group deleted because no members were left",
            });
        }

        if (isAdminLeaving) {
            const newAdmin = remainingMembers[0];

            await db.update(
                groupRelationUserModel,
                {
                    query: { groupId, userId: newAdmin.userId },
                    data: { isAdmin: true },
                    one: true,
                },
                conn
            );

            await db.update(
                groupModel,
                {
                    query: { _id: groupId },
                    data: { createdBy: newAdmin.userId },
                    one: true,
                },
                conn
            );
        }

        await db.commitTransaction(conn);

        return res.status(200).json({
            message: "Successfully left the group",
            adminChanged: isAdminLeaving ? true : false,
        });
    } catch (err) {
        if (conn) await db.rollbackTransaction(conn);
        console.error("Leave Group Error:", err);

        return res.status(500).json({
            message: "Unable to leave group",
            error: err.message,
        });
    } finally {
        if (conn) await db.endTransaction(conn);
    }
};
