// Utility functions for user status management

export const getStatusColor = (status) => {
  switch (status) {
    case 'online': return '#4caf50';
    case 'offline': return '#9e9e9e';
    default: return '#9e9e9e';
  }
};

export const formatLastSeen = (lastSeen) => {
  const now = new Date();
  const diff = now - lastSeen;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const getStatusText = (user) => {
  if (user.status === 'online') {
    return 'Online';
  }

  if (user.status === 'offline') {
    // Check if user has ever logged in (has lastSeen timestamp)
    if (user.lastSeen) {
      return `Last seen ${formatLastSeen(user.lastSeen)}`;
    } else {
      // User was invited but never logged in
      return 'Invited - Not joined yet';
    }
  }

  // Fallback for other statuses
  return user.lastMessage ? truncateMessage(user.lastMessage) : 'No messages yet';
};

export const truncateMessage = (message) => {
  if (message.length <= 25) return message;
  return message.substring(0, 25) + '...';
};
