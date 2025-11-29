const socketIo = require("socket.io");
const {
    socketConnect,
    sendMessage,
    disconnectSocket,
} = require("../controller/mms/sendMessage.controller");

let io;

const connectSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "https://d26wu93n9u19t.cloudfront.net",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        socket.on("register", (userId) => socketConnect(socket, userId));
        socket.on("send_message", (data) => sendMessage(socket, data));
        socket.on("disconnect", () => disconnectSocket(socket));

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });
};

module.exports = connectSocket;
