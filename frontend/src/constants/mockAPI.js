import { DEMO_USERS, CURRENT_USER } from './users';
import { DEMO_MESSAGES } from './messages';
import { DEMO_ROOMS } from './rooms';

// Mock API functions for demo mode
export const mockAPI = {
  // Simulate API delay
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Get all users
  getUsers: async () => {
    await mockAPI.delay(300);
    return DEMO_USERS;
  },

  // Get messages for a specific user/chat
  getMessages: async (userId, limit = 50) => {
    await mockAPI.delay(200);
    const userMessages = DEMO_MESSAGES[userId] || [];
    return userMessages.slice(-limit);
  },

  // Send a message
  sendMessage: async (message) => {
    await mockAPI.delay(100);
    const newMessage = {
      id: `msg_${Date.now()}`,
      roomId: message.roomId,
      userId: CURRENT_USER.id,
      content: message.content,
      timestamp: new Date(),
      type: message.type || 'text'
    };

    // Add to the appropriate user's message array
    if (!DEMO_MESSAGES[message.roomId]) {
      DEMO_MESSAGES[message.roomId] = [];
    }
    DEMO_MESSAGES[message.roomId].push(newMessage);

    return newMessage;
  },

  // Get rooms
  getRooms: async () => {
    await mockAPI.delay(200);
    return DEMO_ROOMS;
  },

  // Join a room
  joinRoom: async (roomId) => {
    await mockAPI.delay(150);
    return { success: true, roomId };
  },

  // Leave a room
  leaveRoom: async (roomId) => {
    await mockAPI.delay(150);
    return { success: true, roomId };
  }
};
