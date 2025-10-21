export const getStatusColor = (status) => {
    switch (status) {
        case true:
            return "#4caf50";
        case false:
            return "#9e9e9e";
        default:
            return "#9e9e9e";
    }
};

export const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const diff = now - new Date(lastSeen);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export const getStatusText = (user) => {
    if (user.isActive === true) {
        return "Online";
    }
    if (user.isActive === false) {
        if (user.updatedAt) {
            return `Last seen ${formatLastSeen(user.updatedAt)}`;
        } else {
            return "Invited - Not joined yet";
        }
    }

    return user.lastMessage
        ? truncateMessage(user.lastMessage)
        : "No messages yet";
};

export const truncateMessage = (message) => {
    if (message.length <= 25) return message;
    return message.substring(0, 25) + "...";
};
