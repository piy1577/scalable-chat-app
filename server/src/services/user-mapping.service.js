class UserMappingService {
    static users = new Map();
    static rooms = new Map();
    static sockets = new Map();
    static socketIds = new Map();

    static addUserToRooms = (userId, roomIds) => {
        this.users.set(userId, roomIds);

        for (const roomId of roomIds) {
            const roomUsers = this.rooms.get(roomId) || [];

            if (!roomUsers.includes(userId)) {
                this.rooms.set(roomId, [...roomUsers, userId]);
            }
        }
    };

    static getRoomUsers = (roomId) => {
        const userIds = this.rooms.get(roomId);
        if (!userIds) return [];

        const socketIds = userIds.map((t) => this.socketIds.get(t));
        return socketIds;
    };

    static register = (userId, socket) => {
        this.socketIds.set(socket?.id, userId);
        this.sockets.set(userId, socket);
    };

    static disconnect = (socketId) => {
        const userId = this.socketIds.get(socketId);
        this.socketIds.delete(socketId);
        this.sockets.delete(userId);

        const rooms = this.users.get(userId) || [];

        for (const roomId of rooms) {
            const roomUsers = this.rooms.get(roomId);
            if (!roomUsers) continue;
            const updatedRoomUsers = roomUsers.filter((u) => u !== userId);
            if (updatedRoomUsers.length === 0) {
                this.rooms.delete(roomId);
            } else {
                this.rooms.set(roomId, updatedRoomUsers);
            }
        }

        this.users.delete(userId);
    };
}

module.exports = UserMappingService;
