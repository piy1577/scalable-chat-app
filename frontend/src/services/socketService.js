import { io } from 'socket.io-client';
import { mockAPI } from '../constants/demoData';

class SocketService {
  constructor() {
    this.socket = null;
    this.isDemoMode = process.env.REACT_APP_MODE === 'demo';
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize connection
  connect() {
    if (this.isDemoMode) {
      this.isConnected = true;
      this.emitDirect('connect');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.socket = io(process.env.REACT_APP_SOCKET_URL);

      this.socket.on('connect', () => {
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });
    });
  }

  // Disconnect
  disconnect() {
    if (this.isDemoMode) {
      this.isConnected = false;
      this.emitDirect('disconnect');
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Generic emit function
  emit(event, data) {
    if (this.isDemoMode) {
      this.handleDemoEmit(event, data);
      return;
    }

    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Direct emit for internal demo events (bypasses handleDemoEmit)
  emitDirect(event, data) {
    if (this.isDemoMode) {
      // Directly call listeners without going through handleDemoEmit
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in event listener for', event, error);
          }
        });
      }
      return;
    }

    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Generic on function
  on(event, callback) {
    if (this.isDemoMode) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
      return;
    }

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove listener
  off(event, callback) {
    if (this.isDemoMode) {
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      return;
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Demo mode handlers
  handleDemoEmit(event, data) {
    switch (event) {
      case 'join_room':
        this.handleDemoJoinRoom(data);
        break;
      case 'leave_room':
        this.handleDemoLeaveRoom(data);
        break;
      case 'send_message':
        this.handleDemoSendMessage(data);
        break;
      case 'get_users':
        this.handleDemoGetUsers();
        break;
      case 'get_rooms':
        this.handleDemoGetRooms();
        break;
      case 'get_messages':
        this.handleDemoGetMessages(data);
        break;
      case 'users_list':
        // This is emitted by handleDemoGetUsers, no need to handle again
        break;
      case 'rooms_list':
        // This is emitted by handleDemoGetRooms, no need to handle again
        break;
      case 'messages_list':
        // This is emitted by handleDemoGetMessages, no need to handle again
        break;
      default:
        console.log('Demo mode - unhandled event:', event, data);
    }
  }

  async handleDemoJoinRoom(data) {
    const result = await mockAPI.joinRoom(data.roomId);
    this.emitDirect('room_joined', result);
  }

  async handleDemoLeaveRoom(data) {
    const result = await mockAPI.leaveRoom(data.roomId);
    this.emitDirect('room_left', result);
  }

  async handleDemoSendMessage(data) {
    const message = await mockAPI.sendMessage(data);
    this.emitDirect('message_sent', message);
    // Don't emit 'new_message' here to avoid duplication
    // The message is already added to DEMO_MESSAGES by mockAPI.sendMessage
  }

  async handleDemoGetUsers() {
    const users = await mockAPI.getUsers();
    // Emit directly to listeners without going through handleDemoEmit
    this.emitDirect('users_list', users);
  }

  async handleDemoGetRooms() {
    const rooms = await mockAPI.getRooms();
    // Emit directly to listeners without going through handleDemoEmit
    this.emitDirect('rooms_list', rooms);
  }

  async handleDemoGetMessages(data) {
    const messages = await mockAPI.getMessages(data.roomId, data.limit);
    // Emit directly to listeners without going through handleDemoEmit
    this.emitDirect('messages_list', messages);
  }

  // Chat-specific methods
  joinRoom(roomId) {
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId) {
    this.emit('leave_room', { roomId });
  }

  sendMessage(message) {
    this.emit('send_message', message);
  }

  getUsers() {
    this.emit('get_users');
  }

  getRooms() {
    this.emit('get_rooms');
  }

  getMessages(roomId, limit = 50) {
    this.emit('get_messages', { roomId, limit });
  }

  // Event listeners for chat
  onMessage(callback) {
    this.on('new_message', callback);
  }

  onMessageSent(callback) {
    this.on('message_sent', callback);
  }

  onRoomJoined(callback) {
    this.on('room_joined', callback);
  }

  onRoomLeft(callback) {
    this.on('room_left', callback);
  }

  onUsersList(callback) {
    this.on('users_list', callback);
  }

  onRoomsList(callback) {
    this.on('rooms_list', callback);
  }

  onMessagesList(callback) {
    this.on('messages_list', callback);
  }

  onUserJoined(callback) {
    this.on('user_joined', callback);
  }

  onUserLeft(callback) {
    this.on('user_left', callback);
  }

  onConnect(callback) {
    this.on('connect', callback);
  }

  onDisconnect(callback) {
    this.on('disconnect', callback);
  }

  onError(callback) {
    this.on('error', callback);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
