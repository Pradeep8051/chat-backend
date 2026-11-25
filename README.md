# Real-Time Chat Backend

A real-time chat backend built with Node.js, TypeScript, Express, PostgreSQL (Prisma), Firebase Firestore, and Socket.IO.

---

## 1. What This Project Is

This is the backend of a chat app (like WhatsApp/Slack). It has no UI. It:

- Stores users, chats, and chat membership in PostgreSQL.
- Stores messages, read receipts, and last-seen data in Firebase Firestore.
- Exposes 6 REST APIs.
- Runs a Socket.IO server for real-time messaging.

---

## 2. How It Works

- **Create a chat** → PostgreSQL only.
- **Send a message** → check membership in PostgreSQL → save to Firestore → broadcast over Socket.IO.
- **Load history** → check membership in PostgreSQL → read from Firestore.
- **Mark read / update last seen** → check membership → write to Firestore → broadcast.

**Two databases on purpose:**
- PostgreSQL = relational data (users, chats, members).
- Firestore = event/stream data (messages, receipts, last-seen).


## . Script

Script	Description
npm run dev	Dev server with hot reload
npm run build	Compile TypeScript
npm start	Run compiled build
npm test	Run all tests
npm run prisma:generate	Generate Prisma client
npm run prisma:migrate	Apply migrations
npm run prisma:studio	Open Prisma Studio
npm run prisma:reset	Reset database
npm run seed	Seed demo users

---

## 3. Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 18+ |
| Language | TypeScript (strict) |
| HTTP | Express.js |
| Relational DB | PostgreSQL + Prisma |
| Document DB | Firebase Firestore (Admin SDK) |
| Realtime | Socket.IO |
| Validation | Zod |
| Testing | Jest + Supertest + socket.io-client |

---

## 4. Project Structure


Layers:

config/ — one-time setup (DB connections, Socket.IO server).
modules/ — business logic split into service (logic), repository (DB), controller (HTTP), routes (URLs).
sockets/ — real-time handlers that call the same services as REST.
middleware/ — validation + centralized error handling.
utils/ — response builders and custom error classes.
types/ — shared TypeScript types.


## 5. REST APIs

Base URL: `http://localhost:4000`

Success: `{ "success": true, "message": "optional", "data": {} }`
Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`

| # | Method | Endpoint | Purpose |
|---|---|---|---|
| 1 | POST | `/chat/create` | Create or get a 1:1 chat |
| 2 | POST | `/chat/:chatId/message/send` | Send a message |
| 3 | GET | `/chat/:chatId/messages?limit=50&userId=` | Get messages (chronological) |
| 4 | POST | `/chat/:chatId/message/:messageId/read` | Mark message read |
| 5 | POST | `/chat/:chatId/lastseen` | Update last seen |
| 6 | GET | `/user/:userId/chats` | List user's chats |

**API 1** — Body: `{ userAId, userBId }` → `{ success, chatId }`

**API 2** — Body: `{ senderId, text }` → `{ success, message, data: { id, chatId, senderId, text, createdAt } }`

**API 3** — Returns messages in chronological order, supports `limit` and pagination.

**API 4** — Body: `{ userId }` → `{ success, message }`. Idempotent.

**API 5** — Body: `{ userId, messageId }` → `{ success, message }`.

**API 6** — Returns `{ chatId, members[], createdAt }[]`. PostgreSQL only, no Firestore.


## 6. Socket.IO Events

Each `chatId` is a Socket.IO room. Only members join their chat's room.

**Client → Server:**

| Event | Payload | Server emits |
|---|---|---|
| `join_chat` | `{ chatId, userId }` | `joined_chat` |
| `send_message` | `{ chatId, senderId, text }` | `receive_message` (room broadcast) |
| `mark_message_read` | `{ chatId, messageId, userId }` | `message_read` (room broadcast) |
| `update_last_seen` | `{ chatId, userId, messageId }` | `last_seen_updated` (room broadcast) |
| `disconnect` | — | cleanup |

**Server → Client:**

| Event | Payload |
|---|---|
| `joined_chat` | `{ success, chatId }` |
| `receive_message` | `{ id, chatId, senderId, text, createdAt }` |
| `message_read` | `{ chatId, messageId, userId, readAt }` |
| `last_seen_updated` | `{ chatId, userId, messageId, lastSeenAt }` |
| `error` | `{ code, message }` |

**Rules:**
- `send_message` saves to Firestore **before** broadcasting. If the save fails, nothing is broadcast.
- The sender also receives their own message (room broadcast).
- On disconnect, the socket leaves all rooms.

---

