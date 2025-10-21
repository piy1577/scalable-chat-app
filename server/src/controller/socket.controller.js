const messageModel = require("../model/message.model");
const userModel = require("../model/user.model");
const roomModel = require("../model/room.model");
const DBService = require("../services/db.service");

const users = new Map();
const db = DBService.getInstance();

const validateInput = (data, requiredFields) => {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid input data");
    }
    for (const field of requiredFields) {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
};

const socketConnect = async (io, socket, userId) => {
    try {
        if (!userId || !socket?.id) {
            return socket.emit("error", "Invalid socket connection data");
        }
        users.set(socket.id, userId);
        await db.update(userModel, {
            query: { id: userId },
            data: { $set: { isActive: true } },
            one: true,
        });
        const userRoomsData = await db.find(roomModel, {
            query: {
                participants: { $in: [userId] },
            },
            exclude: { __v: 0, updatedAt: 0, createdAt: 0, participants: 0 },
        });
        userRoomsData.forEach(({ _id }) => socket.join(String(_id)));
        io.emit("get_users");
    } catch (err) {
        console.error("Socket connection error:", err);
        socket.emit("error", err);
    }
};

const sendMessage = async (socket, data) => {
    try {
        validateInput(data, ["content", "roomId"]);

        const { content, roomId } = data;
        const userId = users.get(socket.id);

        if (!userId) {
            throw new Error("User not authenticated");
        }

        const messageData = {
            roomId,
            senderId: userId,
            content: content.trim(),
        };

        const savedMessage = await db.insert(messageModel, messageData);
        socket.to(roomId).emit("new_message", savedMessage);
    } catch (err) {
        console.error("Send message error:", err);
        socket.emit("error", {
            message: err.message || "Failed to send message",
        });
    }
};

const seenMessage = async (io, socket, data) => {
    try {
        validateInput(data, ["roomId"]);

        const { roomId } = data;
        const userId = users.get(socket.id);

        if (!userId) {
            throw new Error("User not authenticated");
        }

        await db.update(messageModel, {
            query: { roomId, seen: false, senderId: { $ne: userId } },
            data: { $set: { seen: true } },
            one: true,
        });
        io.to(roomId).emit("message_seen", { roomId });
        console.log(
            "\x1b[31m%s\x1b[0m",
            `roomId ${roomId} marked as seen by ${userId}`
        );
    } catch (err) {
        console.error("Mark message seen error:", err);
        socket.emit("error", {
            message: err.message || "Failed to mark message as seen",
        });
    }
};

const disconnectSocket = async (io, socket) => {
    try {
        const userId = users.get(socket.id);
        users.delete(socket.id);
        if (userId) {
            await db.update(userModel, {
                query: { id: userId },
                data: { $set: { isActive: false } },
                one: true,
            });
            io.emit("get_users");
        }
    } catch (err) {
        console.error("Socket disconnect error:", err);
    }
};

const startTyping = async (socket, data) => {
    try {
        validateInput(data, ["roomId"]);
        const { roomId } = data;
        socket.to(roomId).emit("typing", roomId);
    } catch (err) {
        console.error("Start typing error:", err);
        socket.emit("error", {
            message: err.message || "Failed to start typing",
        });
    }
};

const stopTyping = async (socket, data) => {
    try {
        validateInput(data, ["roomId"]);

        const { roomId } = data;
        socket.to(roomId).emit("stopped_typing", roomId);
    } catch (err) {
        console.error("Stop typing error:", err);
        socket.emit("error", {
            message: err.message || "Failed to stop typing",
        });
    }
};

module.exports = {
    socketConnect,
    sendMessage,
    seenMessage,
    disconnectSocket,
    startTyping,
    stopTyping,
};
