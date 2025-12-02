describe("UserMappingService", () => {
    let userMappingService;

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset static maps
        const UserMappingService = require("../user-mapping.service.js");
        UserMappingService.users = new Map();
        UserMappingService.rooms = new Map();
        UserMappingService.sockets = new Map();
        UserMappingService.socketIds = new Map();
        userMappingService = UserMappingService;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should add user to rooms", () => {
        const userId = "user1";
        const roomIds = ["room1", "room2"];

        userMappingService.addUserToRooms(userId, roomIds);

        expect(userMappingService.users.get(userId)).toEqual(roomIds);
        expect(userMappingService.rooms.get("room1")).toEqual([userId]);
        expect(userMappingService.rooms.get("room2")).toEqual([userId]);
    });

    test("should add multiple users to same room", () => {
        userMappingService.addUserToRooms("user1", ["room1"]);
        userMappingService.addUserToRooms("user2", ["room1"]);

        expect(userMappingService.rooms.get("room1")).toEqual(["user1", "user2"]);
    });

    test("should not add duplicate user to room", () => {
        userMappingService.addUserToRooms("user1", ["room1"]);
        userMappingService.addUserToRooms("user1", ["room1"]);

        expect(userMappingService.rooms.get("room1")).toEqual(["user1"]);
    });

    test("should get room users", () => {
        userMappingService.addUserToRooms("user1", ["room1"]);
        userMappingService.addUserToRooms("user2", ["room1"]);

        // Mock socketIds
        userMappingService.socketIds.set("user1", "socket1");
        userMappingService.socketIds.set("user2", "socket2");

        const roomUsers = userMappingService.getRoomUsers("room1");

        expect(roomUsers).toEqual(["socket1", "socket2"]);
    });

    test("should return empty array for non-existent room", () => {
        const roomUsers = userMappingService.getRoomUsers("nonexistent");

        expect(roomUsers).toEqual([]);
    });

    test("should register user and socket", () => {
        const userId = "user1";
        const mockSocket = { id: "socket123" };

        userMappingService.register(userId, mockSocket);

        expect(userMappingService.socketIds.get("socket123")).toBe(userId);
        expect(userMappingService.sockets.get(userId)).toBe(mockSocket);
    });

    test("should disconnect user and clean up rooms", () => {
        // Setup initial state
        userMappingService.addUserToRooms("user1", ["room1", "room2"]);
        userMappingService.addUserToRooms("user2", ["room1"]);
        userMappingService.register("user1", { id: "socket1" });
        userMappingService.register("user2", { id: "socket2" });

        userMappingService.disconnect("socket1");

        // Check socket cleanup
        expect(userMappingService.socketIds.has("socket1")).toBe(false);
        expect(userMappingService.sockets.has("user1")).toBe(false);

        // Check user cleanup
        expect(userMappingService.users.has("user1")).toBe(false);

        // Check room cleanup
        expect(userMappingService.rooms.get("room1")).toEqual(["user2"]);
        expect(userMappingService.rooms.get("room2")).toBeUndefined(); // Room should be deleted if empty
    });

    test("should not crash if disconnecting non-existent socket", () => {
        expect(() => userMappingService.disconnect("nonexistent")).not.toThrow();
    });

    test("should handle disconnect when user has no rooms", () => {
        userMappingService.register("user1", { id: "socket1" });

        expect(() => userMappingService.disconnect("socket1")).not.toThrow();

        expect(userMappingService.socketIds.has("socket1")).toBe(false);
        expect(userMappingService.sockets.has("user1")).toBe(false);
    });

    test("should remove room when last user disconnects", () => {
        userMappingService.addUserToRooms("user1", ["room1"]);
        userMappingService.register("user1", { id: "socket1" });

        userMappingService.disconnect("socket1");

        expect(userMappingService.rooms.has("room1")).toBe(false);
    });

    test("should keep room when other users remain", () => {
        userMappingService.addUserToRooms("user1", ["room1"]);
        userMappingService.addUserToRooms("user2", ["room1"]);
        userMappingService.register("user1", { id: "socket1" });
        userMappingService.register("user2", { id: "socket2" });

        userMappingService.disconnect("socket1");

        expect(userMappingService.rooms.get("room1")).toEqual(["user2"]);
    });
});
