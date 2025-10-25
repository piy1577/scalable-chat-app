// redis.service.js
const Redis = require("ioredis");

class RedisService {
    static instance = null;
    client = null;

    constructor() {
        if (RedisService.instance) {
            return RedisService.instance;
        }

        this.client = new Redis({
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retryStrategy(times) {
                // exponential backoff up to 2 seconds
                return Math.min(times * 50, 2000);
            },
        });

        this.client.on("connect", () => console.log("🔌 Connected to Redis"));
        this.client.on("error", (err) => console.error("❌ Redis Error:", err));

        RedisService.instance = this;
    }

    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    async set(key, value, expiryInSeconds = null) {
        try {
            if (expiryInSeconds)
                await this.client.set(key, value, "EX", expiryInSeconds);
            else await this.client.set(key, value);
        } catch (err) {
            console.error(`Redis SET error for key: ${key}`, err);
        }
    }

    async get(key) {
        try {
            const value = await this.client.get(key);
            return value;
        } catch (err) {
            console.error(`Redis GET error for key: ${key}`, err);
            return null;
        }
    }

    async delete(key) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error(`Redis DEL error for key: ${key}`, err);
        }
    }
}

module.exports = RedisService;
