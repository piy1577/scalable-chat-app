const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const connectSocket = require("./src/routes/socket.router");
const umsRouter = require("./src/routes/ums.router");
const gmsRouter = require("./src/routes/gms.route");
const mmsRouter = require("./src/routes/mms.router");
const rmsRouter = require("./src/routes/rms.router");

const app = express();
const server = http.createServer(app);
connectSocket(server);
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

app.use("/ums", umsRouter);
app.use("/rms", rmsRouter);
app.use("/gms", gmsRouter);
app.use("/ups");
/**
 * /hearbeat -> client heartbeat every second and heartbeat will contain current room is typing or not.
 */
app.use("/mms", mmsRouter);
const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
    console.info(`Server running on port ${PORT}`);
});

module.exports = { app, server };
