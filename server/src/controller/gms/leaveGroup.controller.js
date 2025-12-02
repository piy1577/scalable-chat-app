const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    let conn;
    const { id: userId } = req.userinfo;
    const { id: groupId } = req.params;

    try {
        conn = await db.startTransaction();

        const currentRelation = await db.find(
            groupRelationUserModel,
            { query: { groupId, userId }, one: true },
            conn
        );

        if (!currentRelation) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                code: ReasonPhrases.BAD_REQUEST,
                message: "User does not belong to this group",
            });
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
            return res.status(StatusCodes.OK).json({
                code: ReasonPhrases.OK,
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

        return res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            message: "Successfully left the group",
            adminChanged: isAdminLeaving ? true : false,
        });
    } catch (err) {
        if (conn) await db.rollbackTransaction(conn);
        console.error("Leave Group Error:", err);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    } finally {
        if (conn) await db.endTransaction(conn);
    }
};
