const DBService = require("../../services/db.service");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    const { id: groupId } = req.params;
    const userId = req.invitedUser;

    try {
        const existing = await db.find(groupRelationUserModel, {
            one: true,
            query: { groupId, userId },
        });

        if (existing) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                code: ReasonPhrases.BAD_REQUEST,
                message: "User is already a member of this group",
            });
        }

        await db.insertOne(groupRelationUserModel, { groupId, userId });

        return res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            message: "User added to group successfully",
        });
    } catch (err) {
        console.error("add user error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
