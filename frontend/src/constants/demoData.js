// Demo data for chat application
// Multiple contacts for 1-on-1 chats
export const DEMO_USERS = [
  {
    id: 'user1',
    name: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    status: 'online',
    lastSeen: new Date(),
    lastMessage: 'Awesome! The demo mode will be really helpful for showcasing the app.'
  },
  {
    id: 'user2',
    name: 'Bob Smith',
    avatar: 'https://i.pravatar.cc/150?u=bob',
    status: 'online',
    lastSeen: new Date(),
    lastMessage: 'Great! I think we\'re on track for the deadline. Want to schedule a quick sync?'
  },
  {
    id: 'user3',
    name: 'Carol Williams',
    avatar: 'https://i.pravatar.cc/150?u=carol',
    status: 'offline',
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    lastMessage: 'Hi Carol! Sure, what would you like to know?'
  },
  {
    id: 'user4',
    name: 'David Brown',
    avatar: 'https://i.pravatar.cc/150?u=david',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    lastMessage: 'You\'re welcome David! Happy to help. Let me know if you need anything else.'
  },
  {
    id: 'user5',
    name: 'Emma Davis',
    avatar: 'https://i.pravatar.cc/150?u=emma',
    status: 'online',
    lastSeen: new Date(),
    lastMessage: 'Thank you Emma! I\'m excited too. I have some ideas for the messaging features.'
  }
];

// Messages for different 1-on-1 conversations
export const DEMO_MESSAGES = {
  // Messages with Alice (user1)
  user1: [
    {
      id: 'msg1',
      roomId: 'user1',
      userId: 'user1',
      content: 'Hey! How are you doing today?',
      timestamp: new Date(Date.now() - 600000),
      type: 'text'
    },
    {
      id: 'msg2',
      roomId: 'user1',
      userId: 'current_user',
      content: 'Hi Alice! I\'m doing great, thanks for asking. Just working on some new features for our chat app.',
      timestamp: new Date(Date.now() - 540000),
      type: 'text'
    },
    {
      id: 'msg3',
      roomId: 'user1',
      userId: 'user1',
      content: 'That sounds exciting! What kind of features are you adding?',
      timestamp: new Date(Date.now() - 480000),
      type: 'text'
    },
    {
      id: 'msg4',
      roomId: 'user1',
      userId: 'current_user',
      content: 'We\'re implementing file sharing and better emoji support. Also working on the demo mode.',
      timestamp: new Date(Date.now() - 420000),
      type: 'text'
    },
    {
      id: 'msg5',
      roomId: 'user1',
      userId: 'user1',
      content: 'Awesome! The demo mode will be really helpful for showcasing the app.',
      timestamp: new Date(Date.now() - 360000),
      type: 'text'
    }
  ],

  // Messages with Bob (user2)
  user2: [
    {
      id: 'msg6',
      roomId: 'user2',
      userId: 'user2',
      content: 'Good morning! Did you see the latest project updates?',
      timestamp: new Date(Date.now() - 900000),
      type: 'text'
    },
    {
      id: 'msg7',
      roomId: 'user2',
      userId: 'current_user',
      content: 'Good morning Bob! Yes, I reviewed them. The authentication module looks solid.',
      timestamp: new Date(Date.now() - 840000),
      type: 'text'
    },
    {
      id: 'msg8',
      roomId: 'user2',
      userId: 'user2',
      content: 'Great! I think we\'re on track for the deadline. Want to schedule a quick sync?',
      timestamp: new Date(Date.now() - 780000),
      type: 'text'
    }
  ],

  // Messages with Carol (user3)
  user3: [
    {
      id: 'msg9',
      roomId: 'user3',
      userId: 'user3',
      content: 'Hi! I had a question about the new design system we discussed.',
      timestamp: new Date(Date.now() - 1200000),
      type: 'text'
    },
    {
      id: 'msg10',
      roomId: 'user3',
      userId: 'current_user',
      content: 'Hi Carol! Sure, what would you like to know?',
      timestamp: new Date(Date.now() - 1140000),
      type: 'text'
    }
  ],

  // Messages with David (user4)
  user4: [
    {
      id: 'msg11',
      roomId: 'user4',
      userId: 'user4',
      content: 'Thanks for your help with the testing scenarios yesterday.',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text'
    },
    {
      id: 'msg12',
      roomId: 'user4',
      userId: 'current_user',
      content: 'You\'re welcome David! Happy to help. Let me know if you need anything else.',
      timestamp: new Date(Date.now() - 3540000),
      type: 'text'
    }
  ],

  // Messages with Emma (user5)
  user5: [
    {
      id: 'msg13',
      roomId: 'user5',
      userId: 'user5',
      content: 'Welcome to the team! I\'m excited to work with you on the new features.',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text'
    },
    {
      id: 'msg14',
      roomId: 'user5',
      userId: 'current_user',
      content: 'Thank you Emma! I\'m excited too. I have some ideas for the messaging features.',
      timestamp: new Date(Date.now() - 1740000),
      type: 'text'
    }
  ]
};

// Helper function to get all messages as a flat array
export const getAllMessages = () => {
  return Object.values(DEMO_MESSAGES).flat();
};

export const DEMO_ROOMS = [
  {
    id: 'room1',
    name: 'General',
    description: 'General discussion room',
    type: 'public',
    userCount: 8,
    lastActivity: new Date(Date.now() - 300000)
  },
  {
    id: 'room2',
    name: 'Development',
    description: 'Technical discussions and development updates',
    type: 'public',
    userCount: 5,
    lastActivity: new Date(Date.now() - 600000)
  },
  {
    id: 'room3',
    name: 'Random',
    description: 'Off-topic conversations and fun discussions',
    type: 'public',
    userCount: 3,
    lastActivity: new Date(Date.now() - 900000)
  },
  {
    id: 'room4',
    name: 'Design Team',
    description: 'UI/UX design discussions and feedback',
    type: 'public',
    userCount: 4,
    lastActivity: new Date(Date.now() - 1200000)
  },
  {
    id: 'room5',
    name: 'Project Alpha',
    description: 'Discussion about Project Alpha development',
    type: 'public',
    userCount: 6,
    lastActivity: new Date(Date.now() - 1800000)
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
