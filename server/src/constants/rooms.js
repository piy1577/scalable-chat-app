// Demo rooms data for chat application

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
