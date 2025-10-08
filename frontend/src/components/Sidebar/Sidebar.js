import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import './Sidebar.css';

const Sidebar = ({ rooms, users, currentRoom, onRoomChange }) => {
  const [activeTab, setActiveTab] = useState('rooms');

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'away': return '#ff9800';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          <i className="pi pi-comments"></i>
          Rooms
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="pi pi-users"></i>
          Users
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'rooms' && (
          <div className="rooms-section">
            <h3>Chat Rooms</h3>
            {rooms.map(room => (
              <Card
                key={room.id}
                className={`room-card ${currentRoom === room.id ? 'active' : ''}`}
                onClick={() => onRoomChange(room.id)}
              >
                <div className="room-info">
                  <div className="room-header">
                    <h4>{room.name}</h4>
                    <Badge value={room.userCount} severity="info" />
                  </div>
                  <p className="room-description">{room.description}</p>
                  <div className="room-meta">
                    <small>Last activity: {formatLastSeen(room.lastActivity)}</small>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h3>Online Users</h3>
            {users.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-avatar">
                  <Avatar
                    image={user.avatar}
                    size="normal"
                    shape="circle"
                  />
                  <div
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  />
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-status">
                    <small>{getStatusText(user.status)}</small>
                    {user.status === 'offline' && (
                      <small> • {formatLastSeen(user.lastSeen)}</small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
