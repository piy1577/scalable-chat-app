export const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    }
    if (Math.abs(now - date) < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const groupMessagesBySender = (messages, currentUser) => {
    const groups = [];

    messages.forEach((message, index) => {
        const isOwn = message.senderId === currentUser;
        const currentGroup = groups[groups.length - 1];
        if (!currentGroup || currentGroup.isOwn !== isOwn) {
            groups.push({
                isOwn,
                messages: [message],
            });
        } else {
            currentGroup.messages.push(message);
        }
    });

    return groups;
};

export const groupMessagesByDate = (messages) => {
    const groups = [];

    messages.forEach((message) => {
        const messageDate = new Date(message.createdAt).toDateString();
        const currentGroup = groups[groups.length - 1];

        if (!currentGroup || currentGroup.date !== messageDate) {
            groups.push({
                date: messageDate,
                messages: [message],
            });
        } else {
            currentGroup.messages.push(message);
        }
    });

    return groups;
};

export const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
        return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

    return date.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const new_message = (
    content,
    currentChat,
    setMessages,
    socket,
    setUser
) => {
    setUser((t) => {
        return t.map((u) =>
            u.roomId === content.roomId
                ? u.roomId !== currentChat?.roomId
                    ? {
                          ...u,
                          unreadCount: u.unreadCount + 1,
                          lastMessage: content,
                      }
                    : { ...u, lastMessage: content }
                : u
        );
    });
    if (content.roomId === currentChat?.roomId) {
        setMessages((t) => [...t, content]);
        socket.emit("seen_message", {
            roomId: currentChat.roomId,
        });
    }
};

export const message_seen = ({ roomId }, currentChat, setMessages, user) => {
    if (currentChat) {
        if (roomId === currentChat?.roomId) {
            setMessages((t) =>
                t.map((l) => {
                    if (l.senderId === user?.id) {
                        return { ...l, seen: true };
                    }
                    return l;
                })
            );
        }
    }
};
