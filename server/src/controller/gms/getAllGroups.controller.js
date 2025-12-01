const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");
const groupRelationUserModel = require("../../model/gms/group_relation_user.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    const { id } = req.userinfo;

    try {
        const groupRelations = await db.find(groupRelationUserModel, {
            query: { userId: id },
            exclude: { groupId: 1 },
        });

        const groupIds = groupRelations.map((t) => t.groupId);

        const groups = await db.find(groupModel, {
            query: { _id: { $in: groupIds } },
        });

        return res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            groups,
        });
    } catch (err) {
        console.error("fetch All Groups error: ", err);
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
