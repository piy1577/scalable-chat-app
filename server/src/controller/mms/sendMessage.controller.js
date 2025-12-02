const NotificationService = require("../../services/Notification.service");
const UserMappingService = require("../../services/user-mapping.service");

const notify = NotificationService.getInstance();

const socketConnect = async (socket, userId) => {
    try {
        if (!userId || !socket?.id) {
            return socket.emit("error", "Invalid socket connection data");
        }
        UserMappingService.register(userId, socket);
    } catch (err) {
        console.error("Socket connection error:", err);
        socket.emit("error", err);
    }
};

const sendMessage = async (socket, data) => {
    try {
        const { content, roomId } = data;
        const userId = UserMappingService.socketIds.get(socket.id);

        if (!userId) {
            throw new Error("User not authenticated");
        }

        const messageData = {
            roomId,
            senderId: userId,
            message: content.trim(),
        };

        await notify.sendMessage(roomId, userId, content.trim());
        const socketIds = UserMappingService.getRoomUsers(roomId);
        socketIds.map((id) => socket.to(id).emit("new_message", messageData));
    } catch (err) {
        console.error("Send message error:", err);
        socket.emit("error", {
            message: err.message || "Failed to send message",
        });
    }
};

const disconnectSocket = async (socket) => {
    UserMappingService.disconnect(socket);
};

module.exports = {
    socketConnect,
    sendMessage,
    disconnectSocket,
};
