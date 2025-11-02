const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const authRouter = require("./src/routes/auth.router");
const userRouter = require("./src/routes/user.router");
const errorHandler = require("./src/middleware/Error.middleware");
const notFoundHanlder = require("./src/middleware/notFound.middleware");
const connectSocket = require("./src/routes/socket.router");

const app = express();
const server = http.createServer(app);
connectSocket(server);
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://d26wu93n9u19t.cloudfront.net",
        ],
    })
);
app.use(express.json());
app.use(morgan("short"));
app.use("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use(errorHandler);
app.use("*", notFoundHanlder);
const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
    console.info(`Server running on port ${PORT}`);
});

module.exports = { app, server };
