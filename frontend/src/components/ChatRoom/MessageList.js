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
    if (Math.abs(now - date) < 7 * 24 * 60 * 60 * 1000) {
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

  // Group consecutive messages from the same sender
  const groupMessagesBySender = (messages) => {
    const groups = [];

    messages.forEach((message, index) => {
      const isOwn = isCurrentUser(message.userId);

      // Check if we need to start a new group
      const currentGroup = groups[groups.length - 1];
      if (!currentGroup || currentGroup.isOwn !== isOwn) {
        // Start new group
        groups.push({
          isOwn,
          messages: [message]
        });
      } else {
        // Add to existing group
        currentGroup.messages.push(message);
      }
    });

    return groups;
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

  const messageGroups = groupMessagesBySender(messages);

  return (
    <div className="message-list">
      {messageGroups.map((group, groupIndex) => (
        <div key={group.messages[0].id} className={`message-group ${group.isOwn ? 'own' : 'other'}`}>
          {group.messages.map((message, messageIndex) => {
            const user = getUserById(message.userId);
            const isLastInGroup = messageIndex === group.messages.length - 1;

            return (
              <div
                key={message.id}
                className={`message ${group.isOwn ? 'own' : 'other'}`}
              >
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.content}</p>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                      {group.isOwn && (
                        <span className={`seen-status ${message.seen ? 'seen' : 'sent'}`}>
                          {message.seen ? (
                            <span className="double-tick">✓✓</span>
                          ) : (
                            <span className="single-tick">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {isLastInGroup && (
                    <div className="message-header">
                      <div className="message-avatar-small">
                        <Avatar
                          image={user.avatar}
                          size="normal"
                          shape="circle"
                          style={{ width: '24px', height: '24px' }}
                        />
                      </div>
                      <span className="message-author">
                        {group.isOwn ? 'You' : user.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
