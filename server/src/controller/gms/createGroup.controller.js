const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    const { name = "", description = "" } = req.body || {};
    const { id: currentUserId } = req.userinfo;

    let conn;

    try {
        conn = await db.startTransaction();

        const [group] = await db.insertOne(
            groupModel,
            {
                name,
                description,
                createdBy: currentUserId,
            },
            conn
        );

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

        return res.status(StatusCodes.CREATED).json({
            code: ReasonPhrases.CREATED,
            message: "Group created successfully",
            group,
        });
    } catch (err) {
        if (conn) await db.rollbackTransaction(conn);
        console.error("create Group error: ", err);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    } finally {
        if (conn) await db.endTransaction(conn);
    }
};
