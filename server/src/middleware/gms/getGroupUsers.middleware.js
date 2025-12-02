const DBService = require("../../services/db.service");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");

const db = new DBService();

module.exports = async (req, res, next) => {
    const { id } = req.userInfo;
    const { groupId } = req.params;
    try {
        const userGroup = await db.find(groupRelationUserModel, {
            query: {
                groupId,
            },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
        });

        const userIds = userGroup.map(({ groupId, userId }) => ({
            roomId: groupId,
            userId,
            admin: userId === id,
        }));

        req.users = userIds;
        next();
    } catch (err) {
        console.error("error in get group users: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
