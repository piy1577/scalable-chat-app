// Demo messages data for chat application

export const DEMO_MESSAGES = {
  // Messages with Alice (user1)
  user1: [
    {
      id: 'msg1',
      roomId: 'user1',
      userId: 'user1',
      content: 'Hey! How are you doing today?',
      timestamp: new Date(Date.now() - 600000),
      type: 'text',
      seen: true
    },
    {
      id: 'msg2',
      roomId: 'user1',
      userId: 'current_user',
      content: 'Hi Alice! I\'m doing great, thanks for asking. Just working on some new features for our chat app.',
      timestamp: new Date(Date.now() - 540000),
      type: 'text',
      seen: true
    },
    {
      id: 'msg3',
      roomId: 'user1',
      userId: 'user1',
      content: 'That sounds exciting! What kind of features are you adding?',
      timestamp: new Date(Date.now() - 480000),
      type: 'text',
      seen: true
    },
    {
      id: 'msg4',
      roomId: 'user1',
      userId: 'current_user',
      content: 'We\'re implementing file sharing and better emoji support. Also working on the demo mode.',
      timestamp: new Date(Date.now() - 420000),
      type: 'text',
      seen: true
    },
    {
      id: 'msg5',
      roomId: 'user1',
      userId: 'user1',
      content: 'Awesome! The demo mode will be really helpful for showcasing the app.',
      timestamp: new Date(Date.now() - 360000),
      type: 'text',
      seen: true
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
      type: 'text',
      seen: false
    },
    {
      id: 'msg7',
      roomId: 'user2',
      userId: 'current_user',
      content: 'Good morning Bob! Yes, I reviewed them. The authentication module looks solid.',
      timestamp: new Date(Date.now() - 840000),
      type: 'text',
      seen: true
    },
    {
      id: 'msg8',
      roomId: 'user2',
      userId: 'user2',
      content: 'Great! I think we\'re on track for the deadline. Want to schedule a quick sync?',
      timestamp: new Date(Date.now() - 780000),
      type: 'text',
      seen: false
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
      type: 'text',
      seen: false
    },
    {
      id: 'msg10',
      roomId: 'user3',
      userId: 'current_user',
      content: 'Hi Carol! Sure, what would you like to know?',
      timestamp: new Date(Date.now() - 1140000),
      type: 'text',
      seen: true
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
      type: 'text',
      seen: true
    },
    {
      id: 'msg12',
      roomId: 'user4',
      userId: 'current_user',
      content: 'You\'re welcome David! Happy to help. Let me know if you need anything else.',
      timestamp: new Date(Date.now() - 3540000),
      type: 'text',
      seen: true
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
      type: 'text',
      seen: false
    },
    {
      id: 'msg14',
      roomId: 'user5',
      userId: 'current_user',
      content: 'Thank you Emma! I\'m excited too. I have some ideas for the messaging features.',
      timestamp: new Date(Date.now() - 1740000),
      type: 'text',
      seen: true
    }
  ]
};

// Helper function to get all messages as a flat array
export const getAllMessages = () => {
  return Object.values(DEMO_MESSAGES).flat();
};
