import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export const useChatState = (currentChat) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!currentChat) {
      setMessages([]);
      return;
    }

    // Load messages for the current chat
    socketService.getMessages(currentChat.id);

    // Set up event listeners
    const handleMessagesList = (messagesList) => {
      setMessages(messagesList);
    };

    const handleMessageSent = (message) => {
      // Only add message if it belongs to the current chat
      if (currentChat && message.roomId === currentChat.id) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg.id === message.id);
          if (messageExists) {
            return prev; // Don't add duplicate
          }
          return [...prev, message];
        });
      }
    };

    socketService.onMessagesList(handleMessagesList);
    socketService.onMessageSent(handleMessageSent);

    // Cleanup function
    return () => {
      socketService.off('messages_list', handleMessagesList);
      socketService.off('message_sent', handleMessageSent);
    };
  }, [currentChat]);

  const sendMessage = (content) => {
    if (!content.trim() || !currentChat) return;

    const message = {
      content: content.trim(),
      roomId: currentChat.id,
      type: 'text'
    };

    socketService.sendMessage(message);
  };

  return { messages, sendMessage };
};
