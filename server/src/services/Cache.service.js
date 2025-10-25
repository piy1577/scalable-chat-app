const NodeCache = require("node-cache");

class CacheService {
    static instance = null;
    cache = null;

    constructor() {
        if (CacheService.instance) {
            return CacheService.instance;
        }
        this.cache = new NodeCache({ stdTTL: 0, checkperiod: 600 });

        this.cache.on("expired", (key, value) =>
            console.log(`⌛ Cache expired for key: ${key}`)
        );

        CacheService.instance = this;
        console.log("🔌 Node-Cache initialized");
    }

    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    async set(key, value, expiryInSeconds = null) {
        try {
            if (expiryInSeconds) this.cache.set(key, value, expiryInSeconds);
            else this.cache.set(key, value);
        } catch (err) {
            console.error(`Cache SET error for key: ${key}`, err);
        }
    }

    async get(key) {
        try {
            const value = this.cache.get(key);
            return value === undefined ? null : value;
        } catch (err) {
            console.error(`Cache GET error for key: ${key}`, err);
            return null;
        }
    }

    async delete(key) {
        try {
            this.cache.del(key);
        } catch (err) {
            console.error(`Cache DEL error for key: ${key}`, err);
        }
    }

    async flushAll() {
        try {
            this.cache.flushAll();
            console.log("🗑️ Cache cleared");
        } catch (err) {
            console.error("Cache FLUSH error", err);
        }
    }
}

module.exports = CacheService;
