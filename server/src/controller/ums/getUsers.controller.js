const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const userModel = require("../../model/ums/user.model");
const DBService = require("../../services/db.service");

const db = new DBService();

module.exports = async (req, res) => {
    try {
        const users = req.users;

        const userIds = users.map((u) => u.userId);

        const usersFromDB = await db.find(userModel, {
            query: {
                id: { $in: userIds },
            },
        });

        const userMap = new Map();
        for (const u of usersFromDB) {
            userMap.set(u.id, u);
        }

        const finalUsers = users.map(({ userId, roomId, admin }) => {
            const dbUser = userMap.get(userId);
            return {
                ...dbUser,
                roomId,
                admin,
            };
        });

        return res.status(StatusCodes.OK).json({
            code: ReasonPhrases.OK,
            users: finalUsers,
        });
    } catch (err) {
        console.log("err in get users: ", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
        });
    }
};
