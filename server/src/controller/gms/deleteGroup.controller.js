const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const db = new DBService();

module.exports = async (req, res) => {
    const { id } = req.params;
    try {
        await db.delete(groupModel, { query: { _id: id }, one: true });
        return res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            message: "Group deleted successfully",
        });
    } catch (err) {
        console.error("delete Group error: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
