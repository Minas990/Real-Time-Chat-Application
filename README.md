# 💬 Real-Time Chat Application - Full Documentation

A **real-time chat platform** built with **NestJS**, **PostgreSQL**, and **Socket.IO**

---

## 🚀 Overview

This project implements a modern chat backend that supports **real-time communication** between users with a clean, modular architecture. The application provides a complete social chat experience with user authentication, friend management, real-time messaging, and notifications.

### ✨ Key Features

- 🔐 **JWT-based Authentication** - Secure login/signup with token-based auth
- 🔑 **Google OAuth 2.0** - Sign in with Google integration
- 💬 **Real-time Messaging** - Instant message delivery via Socket.IO
- 👥 **Friend System** - Send/accept/reject friend requests
- 🔔 **Real-time Notifications** - Get notified for messages, friend requests, etc.
- 📧 **Email Verification** - OTP-based email confirmation
- 🔄 **Password Recovery** - Secure password reset via email
- 📤 **File Uploads** - Profile photo uploads with AWS S3
- 🐳 **Docker Support** - Production-ready containerization
- 📊 **Message Status Tracking** - Sent, Delivered, Read status

---

## 📁 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── app.gateway.ts          # WebSocket gateway (Socket.IO)
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── decorators/         # Custom decorators (@currentUser, @ROLES)
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Auth guards (JWT, Email confirmation)
│   ├── stratigies/         # Passport strategies (JWT, Google)
│   └── types/              # Type definitions
├── user/                   # User management module
│   ├── user.controller.ts  # User endpoints
│   ├── user.service.ts     # User business logic
│   ├── entites/            # User entity
│   ├── dto/                # User DTOs
│   ├── guards/             # User guards (IsAdmin)
│   └── pipes/              # Validation pipes
├── chat/                   # Chat module
│   ├── chat.controller.ts  # Chat REST endpoints
│   ├── chat.service.ts     # Chat business logic
│   ├── entities/           # Message entity
│   ├── dto/                # Chat DTOs
│   ├── guards/             # Chat guards
│   └── pipes/              # Message pipes
├── friend/                 # Friend management module
│   ├── friend.controller.ts
│   ├── friend.service.ts
│   └── entities/           # Friend entity
├── friend-request/         # Friend request module
│   ├── friend-request.controller.ts
│   ├── friend-request.service.ts
│   ├── dto/                # Friend request DTOs
│   └── entities/           # Friend request entity
├── notifications/          # Notifications module
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   ├── entities/           # Notification entity
│   └── types/              # Notification types
├── email/                  # Email service module
│   ├── email.service.ts    # Nodemailer integration
│   └── dto/
├── file-upload/            # File upload module
│   ├── file-upload.service.ts
│   └── s3/                 # AWS S3 integration
├── common/                 # Shared utilities
│   └── status.ts           # Status enums
├── filter/                 # Exception filters
│   └── web-socket.filter.ts
└── interceptors/           # Response interceptors
    └── delete-password.interceptor.ts
```

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS v11** | Backend framework |
| **PostgreSQL** | Database |
| **TypeORM** | ORM |
| **Socket.IO** | Real-time communication |
| **Passport.js** | Authentication |
| **JWT** | Token-based auth |
| **Nodemailer** | Email service |
| **AWS S3** | Image storage |
| **Sharp** | Image processing |
| **Docker** | Containerization |
| **class-validator** | DTO validation |

---

## ☁️ AWS Services

| Service | Purpose |
|---------|---------|
| **EC2** | Application hosting |
| **RDS (PostgreSQL)** | Managed database |
| **S3** | File storage (profile photos) |

> For detailed AWS deployment instructions, see [AWS Deployment Guide](./aws/README.md)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DB_NAME=your_database_name
DB_USERNAME=postgres
DB_PASS=your_password
DB_PORT=5432
DB_HOST=localhost

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (SMTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_ADMIN=admin@example.com

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=your_bucket_name

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/oauth/google
```

---

## 🧑‍💻 Running the App Locally

### Prerequisites
- Node.js v18+
- PostgreSQL 15+

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL**
   - Create a database matching your `DB_NAME` env variable
   - Or use Docker (see below)

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Fill in your configuration values

4. **Start the development server**
   ```bash
   npm run start:dev
   ```

5. **Access the API**
   ```
   http://localhost:8000
   ```

---

## 🐳 Running with Docker

### Using Make commands

```bash
# Build Docker images
make build

# Start all containers (API + PostgreSQL)
make up

# Stop all containers
make down

# View logs
make logs
```

### Using Docker Compose directly

```bash
# Build and start
docker compose up --build

# Run in detached mode
docker compose up -d

# Stop
docker compose down
```

### Docker Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| `api` | nest-api | 8000 | NestJS application |
| `db` | postgres-db | 5432 | PostgreSQL database |

---

## 📚 API Documentation

### 🔐 Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/signup` | Register a new user | ❌ |
| `POST` | `/auth/login` | Login with username/email + password | ❌ |
| `POST` | `/auth/confirm` | Request email confirmation OTP | ✅ (not confirmed) |
| `POST` | `/auth/confirm/email` | Confirm email with OTP | ✅ (not confirmed) |
| `POST` | `/auth/updatePassword` | Update password (authenticated) | ✅ (confirmed) |
| `POST` | `/auth/forgetPassword` | Request password reset email | ❌ |
| `POST` | `/auth/resetPassword/:token` | Reset password with token | ❌ |
| `GET` | `/auth/google` | Initiate Google OAuth | ❌ |
| `GET` | `/auth/oauth/google` | Google OAuth callback | ❌ |

#### Request/Response Examples

**Signup**
```json
// POST /auth/signup
// Request Body:
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

// Response: User object (password excluded)
{
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "confirmEmail": false,
  "role": "user",
  "state": "OFFLINE",
  "profileImage": "default",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
// + JWT cookie set
```

**Login**
```json
// POST /auth/login
// Request Body (with email):
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

// OR with username:
{
  "username": "johndoe",
  "password": "SecurePassword123"
}

// Response: User object + JWT cookie
```

**Confirm Email**
```json
// POST /auth/confirm
// Sends OTP to user's email

// POST /auth/confirm/email
// Request Body:
{
  "otp": "123456"
}
```

**Password Reset Flow**
```json
// Step 1: Request reset email
// POST /auth/forgetPassword
{
  "email": "john@example.com"
}

// Step 2: Reset with token from email
// POST /auth/resetPassword/:token
{
  "password": "NewSecurePassword123"
}
```

---

### 👤 Users (`/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/user` | Get all users (Admin only) | ✅ Admin |
| `GET` | `/user/:id` | Get user by ID | ✅ |
| `PATCH` | `/user` | Update current user profile | ✅ |
| `DELETE` | `/user/:id` | Delete user (Admin only) | ✅ Admin |
| `PATCH` | `/user/photo/upload` | Upload profile photo | ✅ |

#### Request/Response Examples

**Update User**
```json
// PATCH /user
// Request Body (all fields optional):
{
  "name": "John Updated",
  "username": "johnupdated",
  "email": "johnupdated@example.com"
}
```

**Upload Photo**
```
// PATCH /user/photo/upload
// Content-Type: multipart/form-data
// Field name: "photo"
// Accepts: image files (will be resized to 512x512)
```

---

### 💬 Messages (`/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/messages/:id` | Get message by ID | ✅ |
| `GET` | `/messages/conversation/:receiverId` | Get conversation with user | ✅ |
| `GET` | `/messages/unread/count` | Get unread message count | ✅ |

#### Query Parameters for Conversation
- `page` (default: 1) - Page number
- `limit` (default: 50) - Messages per page

#### Response Example
```json
// GET /messages/conversation/2?page=1&limit=20
[
  {
    "id": 1,
    "content": "Hello!",
    "senderId": 1,
    "receiverId": 2,
    "status": "read",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "senderName": "John Doe",
    "senderUsername": "johndoe",
    "receiverName": "Jane Doe",
    "receiverUsername": "janedoe"
  }
]
```

---

### 👥 Friends (`/friends`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/friends` | Get all friends (returns list of friend IDs) | ✅ |
| `DELETE` | `/friends/delete/:id` | Remove a friend | ✅ |

---

### 📨 Friend Requests (`/friend-request`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/friend-request/sent` | Get sent friend requests (pending) | ✅ |
| `GET` | `/friend-request/received` | Get received friend requests (pending) | ✅ |

---

### 🔔 Notifications (`/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/notifications` | Get all notifications (paginated) | ✅ |

#### Query Parameters
- `page` (default: 1)
- `limit` (default: 5)

#### Response Example
```json
[
  {
    "id": 1,
    "type": "message",
    "contentId": 15,
    "emitter": 2,
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "type": "friend_request",
    "contentId": 3,
    "emitter": 5,
    "createdAt": "2024-01-01T11:00:00.000Z"
  }
]
```

---

## 🔌 WebSocket Events

### Connection

Connect to the WebSocket server at namespace `/real-time`:

```javascript
const socket = io('http://localhost:8000/real-time', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Authentication Options

Include JWT token in one of these ways:
- `socket.handshake.auth.token` (recommended)
- `socket.handshake.query.token`
- `socket.handshake.headers.authorization` (Bearer token)

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `chat-send-message` | `{ receiverId: number, content: string }` | Send a message to a user (must be friends) |
| `chat-enterChat` | `{ senderId: number }` | Enter a chat (marks messages as read) |
| `notification-read` | - | Mark all notifications as read |
| `send-friend-request` | `{ userId: number }` | Send a friend request |
| `answer-friend-request` | `{ friendRequestId: number, newStatus: 'ACCEPTED' \| 'REJECTED' }` | Accept/reject friend request |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `notification` | `NotificationObject[]` | Notifications on connect + new notifications |
| `user-online` | `{ id, username, Image, email }` | User came online |
| `user-offline` | `{ userId, username }` | User went offline |
| `chat-new-message` | `MessageObject` | New message received |
| `chat-message-sent` | `MessageObject, senderId, receiverId` | Message sent confirmation |
| `chat-message-seen` | `{ id, name, username }` | Your messages were seen by receiver |

### WebSocket Usage Examples

```javascript
// Connect with authentication
const socket = io('http://localhost:8000/real-time', {
  auth: { token: jwtToken }
});

// Listen for connection events
socket.on('connect', () => {
  console.log('Connected!');
});

// Receive notifications on connect
socket.on('notification', (notifications) => {
  console.log('Unread notifications:', notifications);
});

// Listen for new messages
socket.on('chat-new-message', (message) => {
  console.log('New message:', message);
});

// Listen for user online status
socket.on('user-online', (user) => {
  console.log(`${user.username} is now online`);
});

socket.on('user-offline', (user) => {
  console.log(`${user.username} went offline`);
});

// Send a message
socket.emit('chat-send-message', {
  receiverId: 2,
  content: 'Hello there!'
});

// Enter a chat (marks messages as read)
socket.emit('chat-enterChat', { senderId: 2 });

// Listen for message seen confirmation
socket.on('chat-message-seen', (user) => {
  console.log(`${user.username} has seen your messages`);
});

// Send friend request
socket.emit('send-friend-request', { userId: 5 });

// Answer friend request
socket.emit('answer-friend-request', {
  friendRequestId: 3,
  newStatus: 'ACCEPTED' // or 'REJECTED'
});

// Mark all notifications as read
socket.emit('notification-read');
```

---

## 🗃️ Database Schema

### User Entity
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Primary key (auto-increment) |
| `name` | string | User's display name |
| `email` | string | Unique email address |
| `username` | string | Unique username |
| `password` | string | Bcrypt hashed password |
| `confirmEmail` | boolean | Email verified status (default: false) |
| `role` | enum | `admin` or `user` (default: user) |
| `state` | enum | `ONLINE` or `OFFLINE` (default: OFFLINE) |
| `profileImage` | string | Profile photo URL (default: 'default') |
| `OTP` | string | Email verification OTP (nullable) |
| `OTPExpiresAt` | Date | OTP expiration timestamp (nullable) |
| `passwordResetToken` | string | Hashed password reset token (nullable) |
| `passwordResetTokenExpiresAt` | Date | Reset token expiration (nullable) |
| `passwordChangedAt` | Date | Last password change (nullable) |
| `createdAt` | Date | Account creation timestamp |

### Message Entity
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Primary key |
| `content` | text | Message content |
| `senderId` | number | Sender user ID (FK → User) |
| `receiverId` | number | Receiver user ID (FK → User) |
| `status` | enum | `sent`, `delivered`, `read` |
| `createdAt` | Date | Message timestamp |
| `deliveredAt` | Date | Delivery timestamp (nullable) |
| `readAt` | Date | Read timestamp (nullable) |

**Indexes:** `(senderId, receiverId)`

### Friend Entity
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Primary key |
| `user1Id` | number | First user ID (FK → User) - always smaller |
| `user2Id` | number | Second user ID (FK → User) - always larger |
| `createdAt` | Date | Friendship creation date |

**Constraints:**
- Unique: `(user1Id, user2Id)`
- BeforeInsert hook ensures `user1Id < user2Id`

### Friend Request Entity
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Primary key |
| `senderId` | number | Request sender ID (FK → User) |
| `receiverId` | number | Request receiver ID (FK → User) |
| `status` | enum | `PENDING`, `ACCEPTED`, `REJECTED` |
| `createdAt` | Date | Request timestamp |

**Constraints:**
- Unique: `(senderId, receiverId)`
- Index: `receiverId`

### Notification Entity
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Primary key |
| `senderId` | number | Notification emitter ID (FK → User) |
| `receiverId` | number | Notification receiver ID (FK → User) |
| `type` | enum | `message`, `friend_request`, `friend` |
| `contentId` | number | Related entity ID (message/request/friend) |
| `status` | enum | `sent`, `delivered`, `read` |
| `createdAt` | Date | Notification timestamp |

**Indexes:** `(senderId, receiverId)`

---

## 🔄 Application Flows

### Message Status Flow
```
1. SENT     → Message created, receiver is OFFLINE
2. DELIVERED → Receiver came ONLINE (or was already online)
3. READ     → Receiver entered the chat (chat-enterChat event)
```

### Friend Request Flow
```
1. User A sends friend request to User B (send-friend-request event)
2. User B receives notification
3. User B accepts/rejects (answer-friend-request event)
4. If accepted:
   - Friend relationship created
   - User A receives NEW_FRIEND notification
   - Both can now send messages to each other
```

### Authentication Flow
```
1. User signs up → Receives JWT cookie
2. User must confirm email (OTP sent via email)
3. Once confirmed, can access protected routes
4. JWT valid for 1 hour
```

### Password Reset Flow
```
1. User requests reset (forgetPassword endpoint)
2. Email sent with reset link containing token
3. Token valid for 30 minutes
4. User submits new password with token
5. Password updated, email auto-confirmed
```

---

## 🔒 Security Features

### Password Security
- **Bcrypt hashing** with 12 salt rounds
- Password not returned in API responses (serialization interceptor)

### JWT Authentication
- 1-hour token expiration
- HTTP-only cookies for web clients
- Secure flag in production
- Token verification on WebSocket connection

### Email Verification
- 6-digit OTP
- 1-hour OTP expiration
- Required for sensitive operations

### Password Reset
- Cryptographically secure random token
- SHA-256 hashed storage
- 30-minute token expiration
- Token invalidated after use

### Input Validation
- class-validator decorators on all DTOs
- Whitelist mode (strips unknown properties)
- Transform mode for type coercion

### Role-based Access Control
- `@ROLES()` decorator for role requirements
- `IsAdminGuard` for admin-only routes
- Users cannot delete other admins

### WebSocket Security
- JWT verification middleware
- Single connection per user enforced
- Exception filters for proper error handling

---

## 🏗️ Architecture Notes

### Real-time Architecture
- Single WebSocket gateway handles all real-time events
- User connection map tracks online users by user ID → socket ID
- On connect: deliver pending messages/notifications
- On disconnect: mark user offline, notify others

### Database Design
- TypeORM with PostgreSQL
- `synchronize: true` for development (creates tables automatically)
- Eager loading on relations for messages and notifications
- Cascade delete on user relations

---

## 🚧 Known Limitations & TODOs

1. **Single Server**: WebSocket connections are not distributed (consider Redis adapter for scaling)
2. **No Pagination on Friends**: Friends endpoint returns all friend IDs
3. **Notification Content**: Only stores `contentId`, client must fetch full content
4. **No Message Editing/Deletion**: Messages are permanent once sent
5. **No Group Chats**: Only 1-to-1 messaging supported
6. **No Typing Indicators**: Could be added via WebSocket events
7. **No Message Attachments**: Only text messages supported

---

## 📧 Support

For questions or issues, please open a GitHub issue.
