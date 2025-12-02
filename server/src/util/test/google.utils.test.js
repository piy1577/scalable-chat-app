jest.mock("../../services/Cache.service");

const CacheService = require("../../services/Cache.service");

const mockCacheInstance = {
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
};
CacheService.mockImplementation(() => mockCacheInstance);

global.fetch = jest.fn();

const {
    generatetoken,
    getProfile,
    revokeToken,
    checkTokenValid,
    refreshGoogleToken,
} = require("../google.utils");

describe("Google Utils", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("generatetoken", () => {
        test("should generate token and cache refresh token if present", async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    access_token: "access123",
                    refresh_token: "refresh123",
                }),
            };
            fetch.mockResolvedValue(mockResponse);

            const result = await generatetoken("code123");

            expect(fetch).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: expect.any(URLSearchParams),
                }
            );
            expect(mockCacheInstance.set).toHaveBeenCalledWith(
                "access123",
                "refresh123"
            );
            expect(result).toEqual({
                access_token: "access123",
                refresh_token: "refresh123",
            });
        });

        test("should generate token without caching if no refresh token", async () => {
            const mockResponse = {
                ok: true,
                json: jest
                    .fn()
                    .mockResolvedValue({ access_token: "access123" }),
            };
            fetch.mockResolvedValue(mockResponse);

            const result = await generatetoken("code123");

            expect(mockCacheInstance.set).not.toHaveBeenCalled();
            expect(result).toEqual({ access_token: "access123" });
        });

        test("should handle fetch error", async () => {
            fetch.mockRejectedValue(new Error("Network error"));

            await expect(generatetoken("code123")).rejects.toThrow(
                "Network error"
            );
        });
    });

    describe("getProfile", () => {
        test("should fetch user profile", async () => {
            const mockResponse = {
                json: jest
                    .fn()
                    .mockResolvedValue({ email: "user@example.com" }),
            };
            fetch.mockResolvedValue(mockResponse);

            const result = await getProfile("token123");

            expect(fetch).toHaveBeenCalledWith(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                    headers: { Authorization: "Bearer token123" },
                }
            );
            expect(result).toEqual({ email: "user@example.com" });
        });

        test("should handle fetch error", async () => {
            fetch.mockRejectedValue(new Error("Network error"));

            await expect(getProfile("token123")).rejects.toThrow(
                "Network error"
            );
        });
    });

    describe("revokeToken", () => {
        test("should revoke refresh token and delete cache", async () => {
            mockCacheInstance.get.mockReturnValue("refresh123");
            const mockResponse = { ok: true };
            fetch.mockResolvedValue(mockResponse);

            await revokeToken("access123");

            expect(mockCacheInstance.get).toHaveBeenCalledWith("access123");
            expect(fetch).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/revoke",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: expect.any(URLSearchParams),
                }
            );
            expect(mockCacheInstance.delete).toHaveBeenCalledWith("access123");
        });

        test("should not revoke if no refresh token in cache", async () => {
            mockCacheInstance.get.mockReturnValue(null);

            await revokeToken("access123");

            expect(fetch).not.toHaveBeenCalled();
            expect(mockCacheInstance.delete).toHaveBeenCalledWith("access123");
        });

        test("should handle revoke failure", async () => {
            mockCacheInstance.get.mockReturnValue("refresh123");
            const mockResponse = { ok: false, status: 404 };
            fetch.mockResolvedValue(mockResponse);
            const consoleSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            await revokeToken("access123");

            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to revoke refresh token:",
                404
            );
            consoleSpy.mockRestore();
        });
    });

    describe("checkTokenValid", () => {
        test("should return true for valid token", async () => {
            const mockResponse = { ok: true };
            fetch.mockResolvedValue(mockResponse);

            const result = await checkTokenValid("token123");

            expect(fetch).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/tokeninfo?access_token=token123"
            );
            expect(result).toBe(true);
        });

        test("should return false for invalid token", async () => {
            const mockResponse = { ok: false };
            fetch.mockResolvedValue(mockResponse);

            const result = await checkTokenValid("token123");

            expect(result).toBe(false);
        });

        test("should return false on error", async () => {
            fetch.mockRejectedValue(new Error("Network error"));
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const result = await checkTokenValid("token123");

            expect(consoleSpy).toHaveBeenCalledWith(
                "Check token error: ",
                expect.any(Error)
            );
            expect(result).toBe(false);
            consoleSpy.mockRestore();
        });
    });

    describe("refreshGoogleToken", () => {
        test("should refresh token successfully", async () => {
            mockCacheInstance.get.mockReturnValue("refresh123");
            const mockResponse = {
                ok: true,
                json: jest
                    .fn()
                    .mockResolvedValue({ access_token: "newAccess123" }),
            };
            fetch.mockResolvedValue(mockResponse);

            const result = await refreshGoogleToken("oldAccess123");

            expect(mockCacheInstance.get).toHaveBeenCalledWith("oldAccess123");
            expect(fetch).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: expect.any(URLSearchParams),
                }
            );
            expect(mockCacheInstance.delete).toHaveBeenCalledWith(
                "oldAccess123"
            );
            expect(mockCacheInstance.set).toHaveBeenCalledWith(
                "newAccess123",
                "refresh123"
            );
            expect(result).toBe("newAccess123");
        });

        test("should return null if no refresh token", async () => {
            mockCacheInstance.get.mockReturnValue(null);

            const result = await refreshGoogleToken("oldAccess123");

            expect(result).toBe(null);
            expect(fetch).not.toHaveBeenCalled();
        });

        test("should return null on fetch failure", async () => {
            mockCacheInstance.get.mockReturnValue("refresh123");
            const mockResponse = { ok: false };
            fetch.mockResolvedValue(mockResponse);

            const result = await refreshGoogleToken("oldAccess123");

            expect(result).toBe(null);
        });

        test("should return null on error", async () => {
            mockCacheInstance.get.mockReturnValue("refresh123");
            fetch.mockRejectedValue(new Error("Network error"));
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const result = await refreshGoogleToken("oldAccess123");

            expect(consoleSpy).toHaveBeenCalledWith(
                "refreshGoogleToken error:",
                expect.any(Error)
            );
            expect(result).toBe(null);
            consoleSpy.mockRestore();
        });
    });
});
