import React, { useEffect, useRef } from 'react';
import { Avatar } from 'primereact/avatar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { getStatusColor, formatLastSeen } from '../../utils/statusUtils';
import { useChatState } from '../../hooks';
import './ChatRoom.css';

const ChatRoom = ({ isConnected, currentChat }) => {
  const { messages, sendMessage } = useChatState(currentChat);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus message input when a chat is selected
  useEffect(() => {
    if (currentChat && messageInputRef.current) {
      // Small delay to ensure the input is rendered before focusing
      setTimeout(() => {
        messageInputRef.current.focus();
      }, 100);
    }
  }, [currentChat]);

  const handleSendMessage = (content) => {
    if (!isConnected || !currentChat) {
      console.warn('Cannot send message: not connected or no contact selected');
      return;
    }
    sendMessage(content);
  };

  // If no contact is selected, show select contact screen
  if (!currentChat) {
    return (
      <div className="chat-room">
        <div className="no-contact-selected">
          <div className="empty-state">
            <i className="pi pi-comments" style={{ fontSize: '4rem', color: '#ddd', marginBottom: '1.5rem' }}></i>
            <h2>Select a contact to start chatting</h2>
            <p>Choose someone from your contacts list to begin a conversation</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="chat-room">
      {/* Contact Profile Header */}
      <div className="contact-profile-header">
        <div className="contact-profile">
            <div className="contact-avatar-large">
              <Avatar
                image={currentChat.avatar}
                size="large"
                shape="circle"
              />
              <div
                className="status-indicator-large"
                style={{ backgroundColor: getStatusColor(currentChat.status) }}
              />
            </div>
          <div className="contact-details">
            <h3>{currentChat.name}</h3>
            <p className="contact-status-text">
              {currentChat.status === 'online' && 'Active now'}
              {currentChat.status === 'offline' && `Last seen ${formatLastSeen(currentChat.lastSeen)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.length > 0 ? (
          <MessageList messages={messages} />
        ) : (
          <div className="no-messages">
            <div className="empty-state">
              <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
              <h3>No messages yet</h3>
              <p>Start the conversation with {currentChat.name}!</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="chat-input">
        <MessageInput
          ref={messageInputRef}
          onSendMessage={handleSendMessage}
          disabled={!isConnected}
          placeholder={
            !isConnected
              ? 'Connecting...'
              : `Message ${currentChat.name}...`
          }
        />
      </div>
    </div>
  );
};

export default ChatRoom;
