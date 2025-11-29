const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");

const db = new DBService();

module.exports = async (req, res) => {
    let conn;
    const { id } = req.params;
    try {
        conn = await db.startTransaction();

        await db.delete(groupModel, { query: { _id: id }, one: true }, conn);

        await db.commitTransaction(conn);

        return res.status(200).json({
            message: "Group deleted successfully",
        });
    } catch (err) {
        if (conn) await db.rollbackTransaction(conn);
        console.error("delete Group error: ", err);

        return res.status(500).json({
            message: "Unable to delete group",
            error: err.message,
        });
    } finally {
        if (conn) await db.endTransaction(conn);
    }
};
