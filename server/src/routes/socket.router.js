const socketIo = require("socket.io");
const {
    socketConnect,
    sendMessage,
    seenMessage,
    disconnectSocket,
    startTyping,
    stopTyping,
    updateUsers,
    addRoom,
} = require("../controller/socket.controller");

let io;

const connectSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        socket.on("register", (userId) => socketConnect(socket, userId));

        socket.on("send_message", (data) => sendMessage(socket, data));
        socket.on("seen_message", (data) => seenMessage(socket, data));

        socket.on("start_typing", (data) => startTyping(socket, data));
        socket.on("stop_typing", (data) => stopTyping(socket, data));

        socket.on("disconnect", () => disconnectSocket(socket));

        socket.on("update_users", (data) => updateUsers(io, socket, data));

        socket.on("add_room", (data) => addRoom(io, socket, data));

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });
};

module.exports = connectSocket;
