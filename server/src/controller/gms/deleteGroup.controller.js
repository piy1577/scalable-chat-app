const DBService = require("../../services/db.service");
const groupModel = require("../../model/gms/group.model");

const db = new DBService();

module.exports = async (req, res) => {
    let conn;
    const { id } = req.params;
    const { id: currentUserId } = req.userinfo;

    try {
        conn = await db.startTransaction();

        // 1. fetch group
        const group = await db.find(
            groupModel,
            { query: { _id: id }, one: true },
            conn
        );

        // 2. permission check
        if (!group || group.createdBy !== currentUserId) {
            return res.status(403).json({
                message: "user don't have permission for this operation",
            });
        }

        // 3. delete group
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
