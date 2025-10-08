import React from 'react';
import { Avatar } from 'primereact/avatar';
import './Sidebar.css';

const Sidebar = ({ users, currentChat, onChatSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (user) => {
    // Show last message for all users (online and offline)
    return user.lastMessage ? truncateMessage(user.lastMessage) : 'No messages yet';
  };

  const truncateMessage = (message) => {
    if (message.length <= 25) return message;
    return message.substring(0, 25) + '...';
  };

  const formatLastSeen = (lastSeen) => {
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

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Messages</h3>
      </div>

      <div className="sidebar-content">
        {users.length > 0 ? (
          <div className="contacts-list">
            {users.map(user => (
              <div
                key={user.id}
                className={`contact-item ${currentChat?.id === user.id ? 'active' : ''}`}
                onClick={() => onChatSelect(user)}
              >
                <div className="contact-avatar">
                  <Avatar
                    image={user.avatar}
                    size="normal"
                    shape="circle"
                  />
                  <div
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  />
                </div>
                <div className="contact-info">
                  <div className="contact-name">{user.name}</div>
                  <div className="contact-status">
                    <small>{getStatusText(user)}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-contacts">
            <p>Loading contacts...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
