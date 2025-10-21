// Demo users data for chat application
export const DEMO_USERS = [
    {
        id: "user1",
        name: "Alice Johnson",
        picture: "https://i.pravatar.cc/150?u=alice",
        status: "online",
        lastSeen: new Date(Date.now() - 30000), // 30 seconds ago - recently active
        lastMessage:
            "Awesome! The demo mode will be really helpful for showcasing the app.",
    },
    {
        id: "user2",
        name: "Bob Smith",
        picture: "https://i.pravatar.cc/150?u=bob",
        status: "online",
        lastSeen: new Date(Date.now() - 60000), // 1 minute ago - recently active
        lastMessage:
            "Great! I think we're on track for the deadline. Want to schedule a quick sync?",
    },
    {
        id: "user3",
        name: "Carol Williams",
        picture: "https://i.pravatar.cc/150?u=carol",
        status: "offline",
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        lastMessage: "Hi Carol! Sure, what would you like to know?",
    },
    {
        id: "user4",
        name: "David Brown",
        picture: "https://i.pravatar.cc/150?u=david",
        status: "offline",
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
        lastMessage:
            "You're welcome David! Happy to help. Let me know if you need anything else.",
    },
    {
        id: "user5",
        name: "Emma Davis",
        picture: "https://i.pravatar.cc/150?u=emma",
        status: "online",
        lastSeen: new Date(Date.now() - 120000), // 2 minutes ago - recently active
        lastMessage:
            "Thank you Emma! I'm excited too. I have some ideas for the messaging features.",
    },
    {
        id: "user6",
        name: "Frank Wilson",
        picture: "https://i.pravatar.cc/150?u=frank",
        status: "offline",
        lastSeen: null, // Invited but never logged in
        lastMessage: null,
    },
];

export const CURRENT_USER = {
    id: "current_user",
    name: "You",
    picture: "https://i.pravatar.cc/150?u=current",
    status: "online",
    lastSeen: new Date(),
};
