const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");

const db = new DBService();

module.exports = async (req, res) => {
    const { name = "", description = "" } = req.body || {};
    const { id: currentUserId } = req.userinfo;

    let conn;

    try {
        conn = await db.startTransaction();

        // 1. Create group
        const [group] = await db.insertOne(
            groupModel,
            {
                name,
                description,
                createdBy: currentUserId,
            },
            conn
        );

        // 2. Create admin user relation
        await db.insertOne(
            groupRelationUserModel,
            {
                groupId: group._id,
                userId: currentUserId,
                isAdmin: true,
            },
            conn
        );

        await db.commitTransaction(conn);

        return res.status(201).json({
            message: "Group created successfully",
            group,
        });
    } catch (err) {
        if (conn) await db.rollbackTransaction(conn);
        console.error("create Group error: ", err);

        return res.status(500).json({
            message: "Unable to create group",
            error: err.message,
        });
    } finally {
        if (conn) await db.endTransaction(conn);
    }
};
