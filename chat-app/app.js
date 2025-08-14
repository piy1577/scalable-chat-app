const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Redis } = require("ioredis");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);
    const pub = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
    const sub = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
    let userRoom = null;

    socket.on("join", (room) => {
        sub.unsubscribe();
        sub.subscribe(room, (err, count) => {
            if (err) {
                console.error("Failed to subscribe redis: ", err);
                socket.emit("error", err);
            } else {
                userRoom = room;
            }
        });
    });

    sub.on("message", (channel, message) => {
        if (userRoom === channel) {
            const msg = JSON.parse(message);
            if (socket.id != msg.id) socket.emit("message", msg.message);
        }
    });

    socket.on("leave", () => {
        sub.unsubscribe();
        userRoom = null;
    });

    socket.on("room", () => {
        socket.emit("room", userRoom);
    });

    socket.on("message", async (message) => {
        const msg = JSON.stringify({ id: socket.id, message });
        await pub.publish(userRoom, msg);
    });

    socket.on("disconnect", () => {
        sub.unsubscribe();
        console.log("User disconnected:", socket.id);
    });
});

server.listen(process.env.PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
