const socketIo = require("socket.io");
const {
    socketConnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    seenMessage,
    disconnectSocket,
    startTyping,
    stopTyping,
    getRoomUsers,
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
        console.log("\x1b[31m%s\x1b[0m", "User connected:", socket.id);

        socket.on("register", (userId) => socketConnect(io, socket, userId));

        socket.on("send_message", (data) => sendMessage(socket, data));
        socket.on("seen_message", (data) => seenMessage(io, socket, data));

        socket.on("start_typing", (data) => startTyping(socket, data));
        socket.on("stop_typing", (data) => stopTyping(socket, data));

        socket.on("disconnect", () => disconnectSocket(io, socket));

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });
};

module.exports = connectSocket;
