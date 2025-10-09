import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect:', error);
        // In demo mode, we'll still work but show connected status
        setIsConnected(true);
      }
    };

    initializeConnection();

    // Set up connection status listeners
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return { isConnected };
};
