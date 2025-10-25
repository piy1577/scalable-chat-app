const inviteModel = require("../model/invite.model");
const messageModel = require("../model/message.model");
const roomModel = require("../model/room.model");
const userModel = require("../model/user.model");
const DBService = require("../services/db.service");
const { default: EmailService } = require("../services/email.service");

const db = DBService.getInstance();
const emailSender = EmailService.getInstance();

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
                await db.insert(inviteModel, {
                    email,
                    senderId: currentUserId,
                });
                const mail = {
                    to: email,
                    subject: "You're invited to join our Chat App!",
                    text: `Hi there! You've been invited to join our chat application. Click the link below to get started:\n\n${
                        process.env.CLIENT_URL || "http://localhost:3000"
                    }\n\nBest regards,\nThe Chat App Team`,
                    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h1 style="color: #333; text-align: center; margin-bottom: 30px;">You're Invited!</h1>
                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                                    Hi there! You've been invited to join our amazing chat application where you can connect with friends and colleagues in real-time.
                                </p>
                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                    Click the button below to get started and explore all the features we have to offer!
                                </p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${
                                        process.env.CLIENT_URL ||
                                        "http://localhost:3000"
                                    }"
                                       style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                                        Join Chat App
                                    </a>
                                </div>
                                <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                                    If you didn't expect this invitation, you can safely ignore this email.
                                </p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">
                                    Best regards,<br>The Chat App Team
                                </p>
                            </div>
                        </div>
                    `,
                };
                await emailSender.sendEmail(mail);
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

        const existingRoom = await db.find(roomModel, {
            query: {
                participants: {
                    $all: [currentUserId, targetUser.id],
                    $size: 2,
                },
            },
            one: true,
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

        await db.insert(messageModel, {
            roomId: newRoom._id,
            senderId: "system",
            content: `${
                req.userinfo ? req.userinfo.name : "User"
            } created a chat message`,
        });

        await db.insert(messageModel, {
            roomId: newRoom._id,
            senderId: "system",
            content: `${targetUser.name} joined the chat message`,
        });

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

        const messageSummary = await roomModel.aggregate([
            {
                $match: {
                    _id: { $in: roomIds },
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "roomId",
                    as: "messages",
                },
            },
            {
                $addFields: {
                    lastMessage: { $last: "$messages" },
                    unreadCount: {
                        $size: {
                            $filter: {
                                input: "$messages",
                                as: "msg",
                                cond: {
                                    $and: [
                                        { $eq: ["$$msg.seen", false] },
                                        {
                                            $ne: [
                                                "$$msg.senderId",
                                                currentUserId,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            { $unwind: "$participants" },
            {
                $match: {
                    participants: { $ne: currentUserId },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
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
            {
                $sort: { "lastMessage.createdAt": -1 },
            },
        ]);

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
            page = 0,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                message: "Limit must be between 1 and 100",
            });
        }

        if (isNaN(pageNum) || pageNum < 0) {
            return res.status(400).json({
                message: "Offset must be a non-negative number",
            });
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const messages = await db.find(messageModel, {
            query: { roomId },
            sort: sortOptions,
            limit: limitNum,
            skip: pageNum * limitNum,
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
            messages: formattedMessages?.reverse(),
            pagination: {
                total: totalCount,
                limit: limitNum,
                page: pageNum,
                hasMore: (pageNum + 1) * limitNum < totalCount,
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

module.exports = {
    inviteUser,
    getAllUser,
    getUserMessage,
};
