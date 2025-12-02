const NodeCache = require("node-cache");

jest.mock("node-cache");

describe("CacheService", () => {
    let cacheService;
    let mockCache;
    let CacheService;

    beforeEach(() => {
        jest.clearAllMocks();
        NodeCache.mockClear();
        mockCache = {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
            on: jest.fn(),
        };
        NodeCache.mockImplementation(() => mockCache);
        CacheService = require("../Cache.service.js");
        CacheService.instance = null; // Reset singleton
        cacheService = CacheService.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should create a singleton instance", () => {
        const instance1 = cacheService;
        const instance2 = cacheService.constructor.getInstance();
        expect(instance1).toBe(instance2);
    });

    test("should initialize NodeCache with correct options", () => {
        expect(NodeCache).toHaveBeenCalledWith({ stdTTL: 0, checkperiod: 600 });
    });

    test("should set up expired event listener", () => {
        expect(mockCache.on).toHaveBeenCalledWith("expired", expect.any(Function));
    });

    test("should set key-value without expiry", () => {
        cacheService.set("key1", "value1");
        expect(mockCache.set).toHaveBeenCalledWith("key1", "value1");
    });

    test("should set key-value with expiry", () => {
        cacheService.set("key2", "value2", 300);
        expect(mockCache.set).toHaveBeenCalledWith("key2", "value2", 300);
    });

    test("should handle set errors gracefully", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        mockCache.set.mockImplementation(() => {
            throw new Error("Set error");
        });
        cacheService.set("key3", "value3");
        expect(consoleSpy).toHaveBeenCalledWith("Cache SET error for key: key3", expect.any(Error));
        consoleSpy.mockRestore();
    });

    test("should get value from cache", () => {
        mockCache.get.mockReturnValue("value");
        const result = cacheService.get("key");
        expect(mockCache.get).toHaveBeenCalledWith("key");
        expect(result).toBe("value");
    });

    test("should return null for undefined value", () => {
        mockCache.get.mockReturnValue(undefined);
        const result = cacheService.get("key");
        expect(result).toBe(null);
    });

    test("should handle get errors gracefully", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        mockCache.get.mockImplementation(() => {
            throw new Error("Get error");
        });
        const result = cacheService.get("key");
        expect(consoleSpy).toHaveBeenCalledWith("Cache GET error for key: key", expect.any(Error));
        expect(result).toBe(null);
        consoleSpy.mockRestore();
    });

    test("should delete key from cache", () => {
        cacheService.delete("key");
        expect(mockCache.del).toHaveBeenCalledWith("key");
    });

    test("should handle delete errors gracefully", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        mockCache.del.mockImplementation(() => {
            throw new Error("Delete error");
        });
        cacheService.delete("key");
        expect(consoleSpy).toHaveBeenCalledWith("Cache DEL error for key: key", expect.any(Error));
        consoleSpy.mockRestore();
    });
});
