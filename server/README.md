# Chat Application Server

Express.js server with Socket.IO for real-time chat functionality and REST API endpoints for demo purposes.

## Features

- **Real-time messaging** with Socket.IO
- **Room management** (join/leave rooms)
- **User management** with demo users
- **Message persistence** (in-memory storage)
- **REST API endpoints** for demo mode
- **CORS support** for cross-origin requests
- **Error handling** and validation

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

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/users` | Get all users |
| GET | `/api/rooms` | Get all rooms |
| GET | `/api/rooms/:roomId/messages` | Get messages for a room |
| POST | `/api/rooms/:roomId/join` | Join a room |
| POST | `/api/rooms/:roomId/leave` | Leave a room |
| POST | `/api/messages` | Send a message |

### Socket.IO Events

#### Client to Server Events

| Event | Description | Data |
|-------|-------------|------|
| `join_room` | Join a chat room | `{ roomId: string }` |
| `leave_room` | Leave a chat room | `{ roomId: string }` |
| `send_message` | Send a message | `{ content: string, roomId: string, type?: string }` |
| `get_users` | Get all users | - |
| `get_rooms` | Get all rooms | - |
| `get_messages` | Get messages for a room | `{ roomId: string, limit?: number }` |

#### Server to Client Events

| Event | Description | Data |
|-------|-------------|------|
| `room_joined` | Confirmation of joining room | `{ success: boolean, roomId: string }` |
| `room_left` | Confirmation of leaving room | `{ success: boolean, roomId: string }` |
| `message_sent` | Confirmation of sent message | Message object |
| `new_message` | New message received | Message object |
| `users_list` | List of users | Array of user objects |
| `rooms_list` | List of rooms | Array of room objects |
| `messages_list` | List of messages | Array of message objects |
| `user_joined` | User joined room | `{ userId: string, roomId: string, timestamp: Date }` |
| `user_left` | User left room | `{ userId: string, roomId: string, timestamp: Date }` |
| `error` | Error occurred | `{ message: string, code: string }` |

## Data Models

### User
```javascript
{
  id: string,
  name: string,
  email: string,
  avatar: string,
  status: 'online' | 'offline'
}
```

### Room
```javascript
{
  id: string,
  name: string,
  description: string
}
```

### Message
```javascript
{
  id: string,
  roomId: string,
  userId: string,
  content: string,
  timestamp: Date,
  type: string
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CLIENT_URL` | `http://localhost:3000` | Frontend URL for CORS |
| `NODE_ENV` | `development` | Environment mode |

## Demo Data

The server initializes with demo data:

- **Users**: Alice Johnson, Bob Smith, Carol Davis
- **Rooms**: General, Random, Tech Talk
- **Messages**: Sample conversation in General room

## Usage Example

### Using Socket.IO Client

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Join a room
socket.emit('join_room', { roomId: 'room1' });

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Send a message
socket.emit('send_message', {
  content: 'Hello everyone!',
  roomId: 'room1',
  type: 'text'
});
```

### Using REST API

```javascript
// Get all users
const users = await fetch('http://localhost:3001/api/users');

// Send a message
const response = await fetch('http://localhost:3001/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Hello from API!',
    roomId: 'room1',
    type: 'text'
  })
});
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

## Development

The server uses in-memory storage for demo purposes. For production use, consider implementing:

- Database integration (MongoDB, PostgreSQL, etc.)
- Authentication and authorization
- Message persistence
- User session management
- Rate limiting
- Input validation and sanitization

## License

MIT
