const DBService = require("../../services/db.service");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    const adminId = req.userinfo.id;
    const { id: groupId, userId } = req.params;

    try {
        const relation = await db.find(groupRelationUserModel, {
            one: true,
            query: { groupId, userId },
        });

        if (!relation) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                code: ReasonPhrases.BAD_REQUEST,
                message: "User is not a member of this group",
            });
        }

        if (userId === adminId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                code: ReasonPhrases.BAD_REQUEST,
                message: "Admin cannot remove themselves from their own group",
            });
        }

        await groupRelationUserModel.deleteOne({ groupId, userId });

        return res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            message: "User removed from group successfully",
        });
    } catch (err) {
        console.error("remove user error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
