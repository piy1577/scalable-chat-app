const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const notFoundHanlder = require("./src/middleware/notFound.middleware");
const connectSocket = require("./src/routes/socket.router");

const app = express();
const server = http.createServer(app);
connectSocket(server); //chat management service
/**
 * /send message
 * /seen message
 */
app.use(
    cors({
        origin: "https://d26wu93n9u19t.cloudfront.net",
    })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/ums"); // user management service
/**
 * /login
 * /callback
 * /logout
 * /invite User
 * /get all users
 */

app.use("/gms"); // group management service
/**
 * /create group
 * /add user to group
 * /leave grp
 * /remove user
 * /message info
 */

app.use("/ups"); // user presense service
/**
 * /hearbeat -> client heartbeat every second and heartbeat will contain current room is typing or not.
 * /online -> if last heartbeat > 10 second offline.
 */

app.use("/mms"); // message management service
/**
 * /get all message
 */


/**
 * new branch -> pull then -> git checkout -b branchName
 * switch branch -> git checkout branchName
 */
app.use("*", notFoundHanlder);
const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
    console.info(`Server running on port ${PORT}`);
});

module.exports = { app, server };
