import React from 'react';
import { Avatar } from 'primereact/avatar';
import { DEMO_USERS, CURRENT_USER } from '../../constants/demoData';
import './MessageList.css';

const MessageList = ({ messages }) => {
  const getUserById = (userId) => {
    if (userId === CURRENT_USER.id) {
      return CURRENT_USER;
    }
    return DEMO_USERS.find(user => user.id === userId) || {
      id: userId,
      name: 'Unknown User',
      avatar: 'https://i.pravatar.cc/150?u=unknown'
    };
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // If message is from today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If message is from yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // If message is older, show date and time
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentUser = (userId) => {
    return userId === CURRENT_USER.id;
  };

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <div className="empty-state">
          <i className="pi pi-comments" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
          <h3>No messages yet</h3>
          <p>Start the conversation by sending the first message!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => {
        const user = getUserById(message.userId);
        const isOwn = isCurrentUser(message.userId);

        return (
          <div
            key={message.id}
            className={`message ${isOwn ? 'own' : 'other'}`}
          >
            <div className="message-avatar">
              <Avatar
                image={user.avatar}
                size="normal"
                shape="circle"
              />
            </div>

            <div className="message-content">
              <div className="message-header">
                <span className="message-author">
                  {isOwn ? 'You' : user.name}
                </span>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>

              <div className="message-bubble">
                <p>{message.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
