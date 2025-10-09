import React, { useState, useEffect } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';

import ChatRoom from './components/ChatRoom/ChatRoom';
import Sidebar from './components/Sidebar/Sidebar';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { useSocketConnection } from './hooks';

function App() {
  const [currentChat, setCurrentChat] = useState(null);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { isConnected } = useSocketConnection();

  const handleChatSelect = (user) => {
    // If clicking on the currently selected chat, deselect it
    if (currentChat?.id === user.id) {
      setCurrentChat(null);
    } else {
      setCurrentChat(user);
    }
  };

  // Global ESC key handler with priority system
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Priority 1: Close options menu first
        if (isOptionsMenuOpen) {
          setIsOptionsMenuOpen(false);
        }
        // Priority 2: Close invite modal second
        else if (isInviteModalOpen) {
          setIsInviteModalOpen(false);
        }
        // Priority 3: Deselect current chat last
        else if (currentChat) {
          setCurrentChat(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOptionsMenuOpen, isInviteModalOpen, currentChat]);

  return (
    <ThemeProvider>
      <div className="app">
        <div className="app-header">
          <h1>Chat App <span className="demo-badge">DEMO</span></h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
        </div>

        <div className="app-body">
          <Sidebar
            currentChat={currentChat}
            onChatSelect={handleChatSelect}
            isOptionsMenuOpen={isOptionsMenuOpen}
            setIsOptionsMenuOpen={setIsOptionsMenuOpen}
            isInviteModalOpen={isInviteModalOpen}
            setIsInviteModalOpen={setIsInviteModalOpen}
          />

          <ChatRoom
            isConnected={isConnected}
            currentChat={currentChat}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
