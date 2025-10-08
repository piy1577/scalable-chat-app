import React, { useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatRoom.css';

const ChatRoom = ({ roomId, messages, onSendMessage, isConnected }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content) => {
    if (!isConnected) {
      console.warn('Cannot send message: not connected');
      return;
    }
    onSendMessage(content);
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <Card className="room-info-card">
          <div className="room-info">
            <h2>General Chat Room</h2>
            <p>Start a conversation with your team members</p>
          </div>
        </Card>
      </div>

      <div className="chat-messages">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isConnected}
          placeholder={
            !isConnected
              ? 'Connecting...'
              : 'Type your message...'
          }
        />
      </div>
    </div>
  );
};

export default ChatRoom;
