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
  const [currentRoom, setCurrentRoom] = useState('room1');
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const initializeConnection = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);

        // Load initial data
        loadInitialData();

        // Set up event listeners
        setupEventListeners();
      } catch (error) {
        console.error('Failed to connect:', error);
        // In demo mode, we'll still work but show offline status
        setIsConnected(socketService.isDemoMode);
      }
    };

    const loadInitialData = () => {
      // Load rooms
      socketService.getRooms();

      // Load users
      socketService.getUsers();

      // Load messages for current room
      socketService.getMessages(currentRoom);
    };

    const setupEventListeners = () => {
      // Handle new messages
      socketService.onMessage((message) => {
        setMessages(prev => [...prev, message]);
      });

      // Handle room joined
      socketService.onRoomJoined((data) => {
        console.log('Joined room:', data);
        loadInitialData();
      });

      // Handle users list
      socketService.onUsersList((usersList) => {
        setUsers(usersList);
      });

      // Handle rooms list
      socketService.onRoomsList((roomsList) => {
        setRooms(roomsList);
      });

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
  }, [currentRoom]);

  const handleRoomChange = (roomId) => {
    setCurrentRoom(roomId);
    setMessages([]); // Clear messages when switching rooms
    socketService.getMessages(roomId);
  };

  const handleSendMessage = (content) => {
    if (!content.trim()) return;

    const message = {
      content: content.trim(),
      roomId: currentRoom,
      timestamp: new Date()
    };

    socketService.sendMessage(message);
  };

  return (
    <Router>
      <div className="app">
        <div className="app-header">
          <h1>Chat App {socketService.isDemoMode && <span className="demo-badge">DEMO</span>}</h1>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>

        <div className="app-body">
          <Sidebar
            rooms={rooms}
            users={users}
            currentRoom={currentRoom}
            onRoomChange={handleRoomChange}
          />

          <Routes>
            <Route
              path="/"
              element={
                <ChatRoom
                  roomId={currentRoom}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
                />
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <ChatRoom
                  roomId={currentRoom}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
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
