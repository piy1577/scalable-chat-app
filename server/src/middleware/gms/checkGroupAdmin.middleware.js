const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");

const db = new DBService();

module.exports = async (req, res, next) => {
    const adminId = req.userinfo.id;
    const { id: groupId } = req.params;
    try {
        const group = await db.find(groupModel, {
            one: true,
            query: { _id: groupId },
            exclude: {},
        });

        if (!group) {
            return res.status(StatusCodes.NOT_FOUND).json({
                code: ReasonPhrases.NOT_FOUND,
                message: "Group not found",
            });
        }

        if (group.adminId.toString() !== adminId) {
            return res.status(StatusCodes.FORBIDDEN).json({
                code: ReasonPhrases.FORBIDDEN,
                message: "Only the group admin have this permission",
            });
        }
        next();
    } catch (err) {
        console.log("error while checking group admin:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
