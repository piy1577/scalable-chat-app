import React, { useRef, useEffect } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import InviteModal from './InviteModal';
import { getStatusColor, getStatusText } from '../../utils/statusUtils';
import { useUserManagement } from '../../hooks';
import './Sidebar.css';

const Sidebar = ({
  currentChat,
  onChatSelect,
  isOptionsMenuOpen,
  setIsOptionsMenuOpen,
  isInviteModalOpen,
  setIsInviteModalOpen
}) => {
  const { allUsers, inviteUser } = useUserManagement();
  const menuRef = useRef(null);

  // Get current user (for demo purposes, using the first user or a mock current user)
  const currentUser = allUsers.length > 0 ? allUsers[0] : {
    id: 'current-user',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=667eea&color=ffffff&size=128',
    status: 'online'
  };

  // Debug logging
  console.log('Sidebar received users:', allUsers.length, allUsers);

  const handleInvite = async (email) => {
    await inviteUser(email);
  };

  const handleLogout = () => {
    // Clear user session/data
    if (window.confirm('Are you sure you want to logout?')) {
      // In a real app, this would clear authentication tokens, user session, etc.
      alert('Logged out successfully!');
      // You could also redirect to login page or refresh the app
      window.location.reload();
    }
  };

  // Handle click outside to close options menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOptionsMenuOpen(false);
      }
    };

    if (isOptionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOptionsMenuOpen, setIsOptionsMenuOpen]);

  return (
    <div className="sidebar">
      {/* User Profile Section */}
      <div className="user-profile">
        <div className="profile-info">
          <div className="profile-avatar">
            <Avatar
              image={currentUser.avatar}
              size="large"
              shape="circle"
            />
            <div
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(currentUser.status) }}
            />
          </div>
          <div className="profile-details">
            <div className="profile-name">{currentUser.name}</div>
            <div className="profile-email">{currentUser.email}</div>
            <div className="profile-status">
              <small>{getStatusText(currentUser)}</small>
            </div>
          </div>
        </div>
        <div className="menu-container" ref={menuRef}>
          <Button
            icon="pi pi-ellipsis-v"
            className="p-button-rounded p-button-text p-button-sm menu-button"
            onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
            tooltip="Options"
            tooltipOptions={{ position: 'bottom' }}
          />
          {isOptionsMenuOpen && (
            <div className="menu-dropdown">
              <div className="menu-item" onClick={() => { setIsInviteModalOpen(true); setIsOptionsMenuOpen(false); }}>
                <i className="pi pi-plus"></i>
                <span>Invite User</span>
              </div>
              <div className="menu-item" onClick={() => { handleLogout(); setIsOptionsMenuOpen(false); }}>
                <i className="pi pi-sign-out"></i>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>



      <div className="sidebar-content">
        {allUsers.length > 0 ? (
          <div className="contacts-list">
            {allUsers.map(user => (
              <div
                key={user.id}
                className={`contact-item ${currentChat?.id === user.id ? 'active' : ''}`}
                onClick={() => onChatSelect(user)}
              >
                <div className="contact-avatar">
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
                <div className="contact-info">
                  <div className="contact-name">{user.name}</div>
                  <div className="contact-status">
                    <small>{getStatusText(user)}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-contacts">
            <div className="empty-state">
              <i className="pi pi-user-plus" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
              <h3>No contacts yet</h3>
              <p>Invite someone to start chatting!</p>
              <Button
                label="Invite User"
                icon="pi pi-plus"
                className="p-button-sm p-button-outlined"
                onClick={() => setIsInviteModalOpen(true)}
                style={{ marginTop: '1rem' }}
              />
            </div>
          </div>
        )}
      </div>

      <InviteModal
        visible={isInviteModalOpen}
        onHide={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
};

export default Sidebar;
