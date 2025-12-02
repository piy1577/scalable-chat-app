const groupRelationUserModel = require("../../model/gms/group_relation_user.model");
const DBService = require("../../services/db.service");

const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res, next) => {
    const { id } = req.userInfo;
    const { id: groupId } = req.params;
    try {
        if (req.userRoom) return next();
        const userRooms = await db.find(groupRelationUserModel, {
            query: { groupId: groupId, userId: id },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
            one: true,
        });

        if (!userRooms)
            return res.status(StatusCodes.FORBIDDEN).json({
                code: ReasonPhrases.FORBIDDEN,
                message: "user is not part of this chat",
            });

        next();
    } catch (err) {
        console.error("error in check User Group: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
