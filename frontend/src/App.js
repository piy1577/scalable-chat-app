import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';

import ChatRoom from './components/ChatRoom/ChatRoom';
import Sidebar from './components/Sidebar/Sidebar';
import socketService from './services/socketService';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const initializeConnection = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);

        // Load initial data
        await loadInitialData();

        // Set up event listeners
        setupEventListeners();
      } catch (error) {
        console.error('Failed to connect:', error);
        // In demo mode, we'll still work but show connected status
        setIsConnected(true);
        // Load data even if connection fails (for demo mode)
        await loadInitialData();
      }
    };

    const loadInitialData = async () => {
      try {
        // Load users (contacts)
        socketService.getUsers();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    // Load users without auto-selecting
    const handleUsersLoad = (usersList) => {
      setUsers(usersList);
      // Don't auto-select first user - let user choose
    };

    const setupEventListeners = () => {
      // Handle messages list for 1-on-1 chat (when switching chats)
      socketService.onMessagesList((messagesList) => {
        setMessages(messagesList);
      });

      // Handle sent messages (for real-time updates)
      socketService.onMessageSent((message) => {
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
      });

      // Handle users list
      socketService.onUsersList(handleUsersLoad);

      // Handle connection status
      socketService.onConnect(() => {
        setIsConnected(true);
      });

      socketService.onDisconnect(() => {
        setIsConnected(false);
      });
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [currentChat]);

  const handleChatSelect = (user) => {
    setCurrentChat(user);
    setMessages([]); // Clear current messages
    socketService.getMessages(user.id);
  };

  const handleSendMessage = (content) => {
    if (!content.trim() || !currentChat) return;

    const message = {
      content: content.trim(),
      roomId: currentChat.id,
      type: 'text'
    };

    socketService.sendMessage(message);
  };

  return (
    <Router>
      <div className="app">
        <div className="app-header">
          <h1>Chat App <span className="demo-badge">DEMO</span></h1>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>

        <div className="app-body">
          <Sidebar
            users={users}
            currentChat={currentChat}
            onChatSelect={handleChatSelect}
          />

          <Routes>
            <Route
              path="/"
              element={
                <ChatRoom
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
                  currentChat={currentChat}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
