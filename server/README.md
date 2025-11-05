# Chat Application Server

A scalable real-time chat application server built with Express.js, Socket.IO, and MongoDB. Features Google OAuth authentication, persistent messaging, user invitations, and comprehensive real-time communication capabilities.

## Features

- **Google OAuth Authentication** - Secure login with Google accounts
- **Real-time messaging** with Socket.IO
- **Persistent message storage** with MongoDB
- **User invitation system** with email notifications
- **Private chat rooms** between users
- **Message read receipts** and status tracking
- **Typing indicators** for better user experience
- **Online/offline user status**
- **Redis caching** for performance optimization
- **Email service** for user invitations
- **Comprehensive error handling** and validation
- **CORS support** for cross-origin requests

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/auth/login` | Initiate Google OAuth login | - |
| GET | `/api/auth/callback` | OAuth callback handler | - |
| GET | `/api/auth/` | Get current user status | Bearer Token |
| GET | `/api/auth/logout` | Logout user | Bearer Token |

### User Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/user/` | Get all chat users with message summaries | Bearer Token |
| POST | `/api/user/` | Invite a user to chat | Bearer Token |
| GET | `/api/user/:id` | Get messages for a specific chat room | Bearer Token |

### Health Check

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/health` | Server health check | - |

### Socket.IO Events

#### Client to Server Events

| Event | Description | Data |
|-------|-------------|------|
| `register` | Register user socket connection | `{ userId: string }` |
| `send_message` | Send a message | `{ content: string, roomId: string }` |
| `seen_message` | Mark messages as seen | `{ roomId: string }` |
| `start_typing` | Indicate user started typing | `{ roomId: string }` |
| `stop_typing` | Indicate user stopped typing | `{ roomId: string }` |
| `update_users` | Update users in room | `{ roomId: string, participants: string[] }` |
| `add_room` | Add user to room | `{ roomId: string }` |

#### Server to Client Events

| Event | Description | Data |
|-------|-------------|------|
| `new_message` | New message received | Message object |
| `message_seen` | Messages marked as seen | `{ roomId: string }` |
| `typing` | User started typing | `{ roomId: string }` |
| `stopped_typing` | User stopped typing | `{ roomId: string }` |
| `get_users` | Request to refresh users list | - |
| `add_room` | Room added notification | `{ roomId: string }` |
| `error` | Error occurred | `{ message: string }` |

## Data Models

### User
```javascript
{
  id: string,           // Google user ID (required, unique)
  email: string,        // User email (required, unique, lowercase)
  name: string,         // User display name (required)
  picture: string,      // Profile picture URL
  isActive: boolean,    // Online status (default: false)
  createdAt: Date,      // Account creation timestamp
  updatedAt: Date,      // Last update timestamp
  lastLogin: Date       // Last login timestamp
}
```

### Room
```javascript
{
  participants: string[], // Array of user IDs (exactly 2 participants required)
  createdAt: Date,        // Room creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

### Message
```javascript
{
  roomId: ObjectId,    // Reference to Room document (required)
  senderId: string,    // ID of message sender (required)
  content: string,     // Message content (required)
  seen: boolean,       // Read status (default: false)
  createdAt: Date,     // Message creation timestamp
  updatedAt: Date      // Last update timestamp
}
```

### Invite
```javascript
{
  email: string,       // Invited user's email (required, lowercase)
  senderId: string,    // ID of user who sent invitation (required)
  createdAt: Date,     // Invitation creation timestamp
  updatedAt: Date      // Last update timestamp
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `CLIENT_URL` | `http://localhost:3000` | Frontend URL for CORS |
| `SERVER_URL` | - | Server URL for OAuth callbacks |
| `GOOGLE_CLIENT_ID` | - | Google OAuth client ID (required) |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth client secret (required) |
| `MONGODB_URI` | - | MongoDB connection string (required) |
| `EMAIL_HOST` | - | SMTP email host for notifications |
| `EMAIL_PORT` | `587` | SMTP email port |
| `EMAIL_USER` | - | SMTP email username |
| `EMAIL_PASS` | - | SMTP email password |

## Usage Examples

### Authentication Flow

```javascript
// 1. Initiate Google OAuth login
window.location.href = 'http://localhost:3001/api/auth/login';

// 2. After OAuth callback, you'll be redirected with a token
// Extract token from URL and store it
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// 3. Use token for authenticated requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// 4. Get current user status
const userStatus = await fetch('http://localhost:3001/api/auth/', { headers });

// 5. Logout
await fetch('http://localhost:3001/api/auth/logout', { headers });
```

### User Management

```javascript
const token = localStorage.getItem('authToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Get all chat users with message summaries
const users = await fetch('http://localhost:3001/api/user/', { headers });
const userData = await users.json();

// Invite a user
const inviteResponse = await fetch('http://localhost:3001/api/user/', {
  method: 'POST',
  headers,
  body: JSON.stringify({ email: 'friend@example.com' })
});

// Get messages for a specific chat room
const messages = await fetch('http://localhost:3001/api/user/room123', { headers });
const messageData = await messages.json();
```

### Socket.IO Real-time Communication

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Register user connection
socket.emit('register', { userId: 'user123' });

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Listen for typing indicators
socket.on('typing', (data) => {
  console.log('User is typing in room:', data.roomId);
});

// Send a message
socket.emit('send_message', {
  content: 'Hello everyone!',
  roomId: 'room123'
});

// Mark messages as seen
socket.emit('seen_message', { roomId: 'room123' });

// Typing indicators
socket.emit('start_typing', { roomId: 'room123' });
socket.emit('stop_typing', { roomId: 'room123' });
```

## Error Handling

The server includes comprehensive error handling:

- **400 Bad Request**: Missing required fields
- **404 Not Found**: Room not found
- **500 Internal Server Error**: Server errors

Error responses follow this format:
```javascript
{
  error: 'Error message'
}
```

## Production Deployment

The server is production-ready with the following implemented features:

- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **Google OAuth Authentication**: Secure user authentication and authorization
- **Message Persistence**: All messages stored in MongoDB with read receipts
- **User Session Management**: JWT-based authentication with Redis caching
- **Email Notifications**: SMTP-based invitation system
- **Input Validation**: Comprehensive validation and sanitization
- **Error Handling**: Structured error responses and logging
- **CORS Support**: Configurable cross-origin resource sharing

### Additional Production Considerations

- **Rate Limiting**: Implement rate limiting middleware for API endpoints
- **SSL/TLS**: Configure HTTPS for secure communication
- **Monitoring**: Add application monitoring and logging
- **Backup**: Set up database backup strategies
- **Scaling**: Consider horizontal scaling with multiple server instances

## License

MIT
