// Demo data for chat application
export const DEMO_USERS = [
  {
    id: 'user1',
    name: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    status: 'online',
    lastSeen: new Date()
  },
  {
    id: 'user2',
    name: 'Bob Smith',
    avatar: 'https://i.pravatar.cc/150?u=bob',
    status: 'online',
    lastSeen: new Date()
  },
  {
    id: 'user3',
    name: 'Carol Williams',
    avatar: 'https://i.pravatar.cc/150?u=carol',
    status: 'away',
    lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: 'user4',
    name: 'David Brown',
    avatar: 'https://i.pravatar.cc/150?u=david',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
  }
];

export const DEMO_MESSAGES = [
  {
    id: 'msg1',
    userId: 'user2',
    content: 'Hey everyone! How is everyone doing today?',
    timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    type: 'text'
  },
  {
    id: 'msg2',
    userId: 'user1',
    content: 'Hi Bob! I\'m doing great, just working on some new features for our chat app.',
    timestamp: new Date(Date.now() - 540000), // 9 minutes ago
    type: 'text'
  },
  {
    id: 'msg3',
    userId: 'user3',
    content: 'That sounds exciting! What kind of features are you adding?',
    timestamp: new Date(Date.now() - 480000), // 8 minutes ago
    type: 'text'
  },
  {
    id: 'msg4',
    userId: 'user1',
    content: 'We\'re implementing file sharing and better emoji support. Also working on the demo mode so users can try it without a backend.',
    timestamp: new Date(Date.now() - 420000), // 7 minutes ago
    type: 'text'
  },
  {
    id: 'msg5',
    userId: 'user2',
    content: 'Awesome! The demo mode will be really helpful for showcasing the app.',
    timestamp: new Date(Date.now() - 360000), // 6 minutes ago
    type: 'text'
  },
  {
    id: 'msg6',
    userId: 'user4',
    content: 'I agree! Looking forward to seeing the new features.',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    type: 'text'
  }
];

export const DEMO_ROOMS = [
  {
    id: 'room1',
    name: 'General',
    description: 'General discussion room',
    type: 'public',
    userCount: 4,
    lastActivity: new Date(Date.now() - 300000)
  },
  {
    id: 'room2',
    name: 'Development',
    description: 'Technical discussions and development updates',
    type: 'public',
    userCount: 3,
    lastActivity: new Date(Date.now() - 600000)
  },
  {
    id: 'room3',
    name: 'Random',
    description: 'Off-topic conversations and fun discussions',
    type: 'public',
    userCount: 2,
    lastActivity: new Date(Date.now() - 900000)
  }
];

export const CURRENT_USER = {
  id: 'current_user',
  name: 'You',
  avatar: 'https://i.pravatar.cc/150?u=current',
  status: 'online',
  lastSeen: new Date()
};

// Mock API functions for demo mode
export const mockAPI = {
  // Simulate API delay
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Get all users
  getUsers: async () => {
    await mockAPI.delay(300);
    return DEMO_USERS;
  },

  // Get messages for a room
  getMessages: async (roomId, limit = 50) => {
    await mockAPI.delay(200);
    return DEMO_MESSAGES.slice(-limit);
  },

  // Send a message
  sendMessage: async (message) => {
    await mockAPI.delay(100);
    const newMessage = {
      id: `msg_${Date.now()}`,
      userId: CURRENT_USER.id,
      content: message.content,
      timestamp: new Date(),
      type: message.type || 'text'
    };
    DEMO_MESSAGES.push(newMessage);
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
