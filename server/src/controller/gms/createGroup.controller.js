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
        //create group
        const group = await db.insertOne(
            groupModel,
            {
                name,
                description,
                createdBy: currentUserId,
            },
            conn
        );

        // create admin user
        await db.insertOne(
            groupRelationUserModel,
            { groupId: group._id, userId: currentUserId, isAdmin: true },
            conn
        );

        await db.commitTransaction(conn);
    } catch (err) {
        await db.rollbackTransaction(conn);
        console.log("create Group error: ", err);
        res.status(500).json({ message: "Unable to create group", error: err });
    } finally {
        await db.endTransaction(conn);
    }
};
