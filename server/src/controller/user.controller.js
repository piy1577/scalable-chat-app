const messageModel = require("../model/message.model");
const roomModel = require("../model/room.model");
const userModel = require("../model/user.model");
const DBService = require("../services/db.service");
const RedisService = require("../services/Redis.service");

const db = DBService.getInstance();
const redis = RedisService.getInstance();

// Input validation helper
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateUserInput = (data, requiredFields) => {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid input data");
    }
    for (const field of requiredFields) {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
};

const inviteUser = async (req, res) => {
    try {
        const { id: currentUserId } = req.userinfo;

        if (!currentUserId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }
        validateUserInput(req.body, ["email"]);
        const { email } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }

        if (email === req.userinfo.email) {
            return res.status(400).json({
                message: "Cannot invite yourself",
            });
        }

        const targetUser = await db.find(userModel, {
            query: { email: email.toLowerCase() },
            one: true,
        });

        if (!targetUser) {
            try {
                const existingInvites = await redis.get(email);
                let inviteList = [currentUserId];

                if (existingInvites) {
                    inviteList = [
                        ...new Set([...existingInvites, currentUserId]),
                    ];
                }

                await redis.set(email, inviteList);
                console.log(
                    "\x1b[33m%s\x1b[0m",
                    `Invitation stored for non-existing user: ${email}`
                );

                return res.status(200).json({
                    message:
                        "Invitation sent successfully. User will be notified when they join.",
                    invitedEmail: email,
                });
            } catch (redisErr) {
                console.error("Redis error:", redisErr);
                return res.status(500).json({
                    message: "Failed to store invitation",
                });
            }
        }

        const existingRoom = await db.findOne(roomModel, {
            query: {
                participants: {
                    $all: [currentUserId, targetUser.id],
                    $size: 2,
                },
            },
        });

        if (existingRoom) {
            return res.status(409).json({
                message: "Chat room already exists between users",
                roomId: existingRoom._id,
            });
        }

        const newRoom = await db.insert(roomModel, {
            participants: [currentUserId, targetUser.id],
        });

        console.log(
            "\x1b[33m%s\x1b[0m",
            `New chat room created: ${newRoom._id} between ${currentUserId} and ${targetUser.id}`
        );

        return res.status(201).json({
            message: "Chat room created successfully",
            roomId: newRoom._id,
            participants: [currentUserId, targetUser.id],
        });
    } catch (err) {
        console.error("Invite user error:", err);
        return res.status(500).json({
            message: "Failed to process invitation",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
};
const getAllUser = async (req, res) => {
    try {
        const { id: currentUserId } = req.userinfo;
        if (!currentUserId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const userRooms = await db.find(roomModel, {
            query: { participants: { $in: [currentUserId] } },
            exclude: { __v: 0, createdAt: 0, updatedAt: 0 },
        });

        if (!userRooms?.length) {
            return res.status(200).json({
                message: "No chat rooms found",
                users: [],
            });
        }

        const roomIds = userRooms.map((room) => room._id);
        const messageSummary = await messageModel.aggregate([
            {
                $match: {
                    roomId: { $in: roomIds },
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$roomId",
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$seen", false] },
                                        { $ne: ["$senderId", currentUserId] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "rooms",
                    localField: "_id",
                    foreignField: "_id",
                    as: "room",
                },
            },
            { $unwind: "$room" },
            { $unwind: "$room.participants" },
            {
                $match: {
                    "room.participants": { $ne: currentUserId },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "room.participants",
                    foreignField: "id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    roomId: "$_id",
                    unreadCount: 1,
                    lastMessage: {
                        content: "$lastMessage.content",
                        senderId: "$lastMessage.senderId",
                        createdAt: "$lastMessage.createdAt",
                        seen: "$lastMessage.seen",
                    },
                    userId: "$user.id",
                    name: "$user.name",
                    email: "$user.email",
                    picture: "$user.picture",
                    updatedAt: "$user.updatedAt",
                    isActive: "$user.isActive",
                },
            },
            { $sort: { "lastMessage.createdAt": -1 } },
        ]);

        console.log(
            "\x1b[33m%s\x1b[0m",
            `Retrieved ${messageSummary.length} chat users for user ${currentUserId}`
        );

        return res.status(200).json(messageSummary);
    } catch (err) {
        console.error("Get all users error:", err);
        return res.status(500).json({
            message: "Failed to retrieve chat users",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
};

const getUserMessage = async (req, res) => {
    try {
        const { id: roomId } = req.params;
        const { id: currentUserId } = req.userinfo;

        if (!currentUserId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }
        if (!roomId) {
            return res.status(400).json({
                message: "Room ID is required",
            });
        }
        const room = await db.find(roomModel, {
            query: {
                _id: roomId,
                participants: { $in: [currentUserId] },
            },
            one: true,
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found or access denied",
            });
        }

        const {
            limit = 50,
            offset = 0,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset);

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                message: "Limit must be between 1 and 100",
            });
        }

        if (isNaN(offsetNum) || offsetNum < 0) {
            return res.status(400).json({
                message: "Offset must be a non-negative number",
            });
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const messages = await db.find(messageModel, {
            query: { roomId },
            options: {
                sort: sortOptions,
                limit: limitNum,
                skip: offsetNum,
            },
        });

        const totalCount = await db.count(messageModel, { roomId });
        const formattedMessages = messages.map((message) => ({
            id: message._id,
            roomId: message.roomId,
            senderId: message.senderId,
            content: message.content,
            seen: message.seen,
            createdAt: message.createdAt,
        }));

        return res.status(200).json({
            message: "Messages retrieved successfully",
            messages: formattedMessages,
            pagination: {
                total: totalCount,
                limit: limitNum,
                offset: offsetNum,
                hasMore: offsetNum + limitNum < totalCount,
            },
            roomId,
        });
    } catch (err) {
        console.error("Get user messages error:", err);
        return res.status(500).json({
            message: "Failed to retrieve messages",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
};

// Get room information
const getRoomInfo = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { id: currentUserId } = req.userinfo;

        // Validate current user exists
        if (!currentUserId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        // Validate roomId parameter
        if (!roomId) {
            return res.status(400).json({
                message: "Room ID is required",
            });
        }

        // Get room with participant details
        const room = await db.findOne(roomModel, {
            query: { _id: roomId },
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found",
            });
        }

        // Verify user is a participant
        if (!room.participants.includes(currentUserId)) {
            return res.status(403).json({
                message: "Access denied to this room",
            });
        }

        // Get participant user details
        const participants = await db.find(userModel, {
            query: { id: { $in: room.participants } },
            exclude: { __v: 0, createdAt: 0 },
        });

        // Get recent messages count
        const recentMessagesCount = await db.count(messageModel, { roomId });

        return res.status(200).json({
            message: "Room information retrieved successfully",
            room: {
                id: room._id,
                participants: participants.map((user) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    isActive: user.isActive,
                    lastSeen: user.lastSeen,
                })),
                createdAt: room.createdAt,
                updatedAt: room.updatedAt,
            },
        });
    } catch (err) {
        console.error("Get room info error:", err);
        return res.status(500).json({
            message: "Failed to retrieve room information",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
};

// Search users (for inviting to chat)
const searchUsers = async (req, res) => {
    try {
        const { id: currentUserId } = req.userinfo;
        const { query, limit = 10 } = req.query;

        // Validate current user exists
        if (!currentUserId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        // Validate search query
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                message: "Search query must be at least 2 characters long",
            });
        }

        const searchTerm = query.trim();
        const limitNum = parseInt(limit);

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
            return res.status(400).json({
                message: "Limit must be between 1 and 50",
            });
        }

        // Search users by name or email
        const users = await db.find(userModel, {
            query: {
                $and: [
                    {
                        $or: [
                            { name: { $regex: searchTerm, $options: "i" } },
                            { email: { $regex: searchTerm, $options: "i" } },
                        ],
                    },
                    { id: { $ne: currentUserId } }, // Exclude current user
                ],
            },
            options: {
                limit: limitNum,
            },
            exclude: { __v: 0, createdAt: 0 },
        });

        // Format users for response
        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            isActive: user.isActive,
        }));

        return res.status(200).json({
            message: "Users found successfully",
            users: formattedUsers,
            query: searchTerm,
            total: formattedUsers.length,
        });
    } catch (err) {
        console.error("Search users error:", err);
        return res.status(500).json({
            message: "Failed to search users",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    }
};

module.exports = {
    inviteUser,
    getAllUser,
    getUserMessage,
    getRoomInfo,
    searchUsers,
};
