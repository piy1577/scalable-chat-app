module.exports = (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    let responseBody = "";

    // Capture response body
    res.send = function (data) {
        responseBody = data;
        return originalSend.call(this, data);
    };

    //Log when response finishes
    res.on("finish", () => {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        console.log("\x1b[34m%s\x1b[0m", "\n=== API Request Log ===");
        console.log(
            "\x1b[34m%s\x1b[0m",
            `Endpoint: ${req.method} ${req.originalUrl}`
        );
        console.log("\x1b[34m%s\x1b[0m", `Execution Time: ${executionTime}ms`);
        console.log("\x1b[34m%s\x1b[0m", `Response Body: ${responseBody}`);
        console.log("\x1b[34m%s\x1b[0m", "=======================\n");
    });

    next();
};
