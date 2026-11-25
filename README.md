# 💬 Real-Time Chat Backend

<p align="center">
  A scalable, real-time chat backend built with modern backend technologies.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Express.js-Backend-black?logo=express" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-black?logo=socket.io" />
</p>

---

## 📌 Overview

**Real-Time Chat Backend** is a backend service for a messaging application similar to WhatsApp or Slack.

It provides REST APIs and real-time communication using Socket.IO, with PostgreSQL and Firebase Firestore working together to manage relational and messaging data.

This project focuses on clean architecture, modular design, database separation, and real-time event-driven communication.

### ✨ Key Features

- 💬 Real-time messaging using Socket.IO
- 👥 One-to-one chat creation
- 🔐 Chat membership validation
- 📩 Message storage using Firebase Firestore
- ✅ Message read receipts
- 🟢 Last-seen tracking
- 📜 Message history with pagination
- 🗄️ PostgreSQL for relational data
- ⚡ Centralized error handling

---

## 🏗️ Architecture

The application uses two databases, each responsible for a specific type of data.

| Database | Responsibility |
|---|---|
| PostgreSQL | Users, chats, and chat memberships |
| Firebase Firestore | Messages, read receipts, and last-seen information |

### System Workflow

```mermaid
flowchart TD
    A[Client Application] --> B[Express REST API]
    A <--> C[Socket.IO Server]

    B --> D[Chat Services]
    C --> D

    D --> E[PostgreSQL]
    D --> F[Firebase Firestore]

    E --> G[Users, Chats, Members]
    F --> H[Messages, Read Receipts, Last Seen]

    D --> C
    C --> I[Room Broadcast]
    I --> A
```

### 🔄 How It Works

| Operation | Workflow |
|---|---|
| Create Chat | Store chat and members in PostgreSQL |
| Send Message | Validate membership → Save to Firestore → Broadcast through Socket.IO |
| Load History | Validate membership → Fetch messages from Firestore |
| Mark as Read | Validate membership → Update Firestore → Broadcast event |
| Update Last Seen | Validate membership → Update Firestore → Broadcast event |
| List Chats | Fetch chat memberships from PostgreSQL |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Language | TypeScript (Strict Mode) |
| HTTP Framework | Express.js |
| Relational Database | PostgreSQL |
| ORM | Prisma |
| NoSQL Database | Firebase Firestore |
| Real-Time Communication | Socket.IO |
| Validation | Zod |
---

## 📁 Project Structure

```text
src/
├── config/
│   ├── database.ts
│   ├── firebase.ts
│   └── socket.ts
│
├── modules/
│   ├── chat/
│   │   ├── chat.controller.ts
│   │   ├── chat.service.ts
│   │   ├── chat.repository.ts
│   │   └── chat.routes.ts
│   │
│   ├── message/
│   │   ├── message.controller.ts
│   │   ├── message.service.ts
│   │   └── message.repository.ts
│   │
│   └── user/
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── user.routes.ts
│
├── sockets/
│   └── chat.socket.ts
│
├── middleware/
│   ├── validation.middleware.ts
│   └── error.middleware.ts
│
├── utils/
│   ├── response.ts
│   └── errors.ts
│
├── types/
│   └── index.ts
│
└── app.ts
```

### Architecture Responsibilities

| Directory | Responsibility |
|---|---|
| `config/` | Database connections, Firebase setup, Socket.IO initialization |
| `modules/` | Business logic organized into controllers, services, repositories, and routes |
| `sockets/` | Real-time event handlers |
| `middleware/` | Request validation and centralized error handling |
| `utils/` | Response builders and custom error classes |
| `types/` | Shared TypeScript interfaces and types |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 18+
- npm
- PostgreSQL
- Firebase project with Firestore enabled

### 1. Clone the Repository

```bash
git clone https://github.com/Pradeep8051/chat-backend.git
cd <chat-backend>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/chat_db"

# Firebase configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

Use your Firebase Admin SDK credentials and keep sensitive credentials out of version control.

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

### 6. Seed Demo Users

```bash
npm run seed
```

### 7. Start Development Server

```bash
npm run dev
```

Server will start at:

```text
http://localhost:4000
```

---

## 📡 REST API Documentation

**Base URL:** `http://localhost:4000`

### Standard Response Format

**Success Response**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Something went wrong"
  }
}
```

### API Endpoints

| # | Method | Endpoint | Description |
|---|---|---|---|
| 1 | POST | `/chat/create` | Create or retrieve a 1:1 chat |
| 2 | POST | `/chat/:chatId/message/send` | Send a message |
| 3 | GET | `/chat/:chatId/messages` | Retrieve chat history |
| 4 | POST | `/chat/:chatId/message/:messageId/read` | Mark a message as read |
| 5 | POST | `/chat/:chatId/lastseen` | Update last-seen information |
| 6 | GET | `/user/:userId/chats` | Retrieve user's chats |

### 1️⃣ Create or Get Chat

`POST /chat/create`

**Request Body**

```json
{
  "userAId": "user_123",
  "userBId": "user_456"
}
```

**Purpose:**
- Creates a new one-to-one chat if one doesn't exist.
- Returns the existing chat if it already exists.

**Response:** Returns the chat ID.

### 2️⃣ Send Message

`POST /chat/:chatId/message/send`

**Request Body**

```json
{
  "senderId": "user_123",
  "text": "Hello! How are you?"
}
```

**Purpose:**
- Validates chat membership.
- Saves the message to Firestore.
- Returns the created message.

### 3️⃣ Get Chat Messages

`GET /chat/:chatId/messages?limit=50&userId=user_123`

**Purpose:**
- Validates user membership.
- Retrieves messages from Firestore.
- Supports pagination using `limit`.
- Returns messages in chronological order.

### 4️⃣ Mark Message as Read

`POST /chat/:chatId/message/:messageId/read`

**Request Body**

```json
{
  "userId": "user_456"
}
```

**Purpose:**
- Validates chat membership.
- Updates the read receipt in Firestore.
- Broadcasts the read event.
- Idempotent operation.

### 5️⃣ Update Last Seen

`POST /chat/:chatId/lastseen`

**Request Body**

```json
{
  "userId": "user_123",
  "messageId": "message_789"
}
```

**Purpose:**
- Validates chat membership.
- Updates last-seen information in Firestore.
- Broadcasts the updated information.

### 6️⃣ Get User Chats

`GET /user/:userId/chats`

**Purpose:**
- Retrieves all chats associated with a user.
- Returns chat IDs, members, and creation timestamps.
- Uses PostgreSQL only.

---

## ⚡ Socket.IO Real-Time Events

Every chat has its own Socket.IO room.

Only authenticated chat members should be allowed to join their respective rooms.

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `join_chat` | `{ chatId, userId }` | Join a chat room |
| `send_message` | `{ chatId, senderId, text }` | Send a real-time message |
| `mark_message_read` | `{ chatId, messageId, userId }` | Mark a message as read |
| `update_last_seen` | `{ chatId, userId, messageId }` | Update last-seen status |
| `disconnect` | — | Handle socket disconnection |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `joined_chat` | `{ success, chatId }` | Confirmation of room joining |
| `receive_message` | `{ id, chatId, senderId, text, createdAt }` | New message notification |
| `message_read` | `{ chatId, messageId, userId, readAt }` | Read receipt notification |
| `last_seen_updated` | `{ chatId, userId, messageId, lastSeenAt }` | Last-seen update notification |
| `error` | `{ code, message }` | Error notification |

### 🔐 Socket Rules & Behavior

- Each `chatId` represents a separate Socket.IO room.
- Only chat members can join a room.
- Messages are saved to Firestore before broadcasting.
- If Firestore saving fails, the message is not broadcast.
- The sender also receives their own message through room broadcasting.
- Disconnected sockets leave their joined rooms.

---

## 📜 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled application |
| `npm test` | Run all tests |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Apply database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:reset` | Reset database |
| `npm run seed` | Seed demo users |

---

## 🧪 Testing

Run the complete test suite:

```bash
npm test
```

The project uses:

- **Jest** – Test runner
- **Supertest** – REST API testing
- **socket.io-client** – Real-time event testing

---

## 🔒 Important Design Principles

1. **Separation of Concerns:** Controllers, services, and repositories have separate responsibilities.
2. **Database Separation:** PostgreSQL handles relational data, while Firestore handles message and activity data.
3. **Membership Validation:** Chat access is validated before performing chat operations.
4. **Data Consistency:** Messages are persisted before Socket.IO broadcasting.
5. **Reusable Business Logic:** REST APIs and Socket.IO handlers use shared services.
6. **Centralized Error Handling:** Consistent error responses across the application.

---

## 👨‍💻 Author

**Pradeep Chauhan**

Backend Developer | Node.js | TypeScript | PostgreSQL | Firebase | Socket.IO

---

<p align="center">
  ⭐ If you find this project useful, consider giving it a star!
</p>

<p align="center">
  Built with ❤️ using Node.js and TypeScript
</p>