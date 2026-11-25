export interface JoinChatPayload {
  chatId: string;
  userId: string;
}

export interface SendMessagePayload {
  chatId: string;
  senderId: string;
  text: string;
}

export interface MarkMessageReadPayload {
  chatId: string;
  messageId: string;
  userId: string;
}

export interface UpdateLastSeenPayload {
  chatId: string;
  userId: string;
  messageId: string;
}

export interface ChatMessageDTO {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface JoinedChatResponse {
  success: boolean;
  chatId?: string;
  message?: string;
  code?: string;
}

export interface MessageReadBroadcast {
  chatId: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface LastSeenBroadcast {
  chatId: string;
  userId: string;
  messageId: string;
  lastSeenAt: string;
}

export interface ServerToClientEvents {
  joined_chat: (payload: JoinedChatResponse) => void;
  receive_message: (payload: ChatMessageDTO) => void;
  message_read: (payload: MessageReadBroadcast) => void;
  last_seen_updated: (payload: LastSeenBroadcast) => void;
  socket_error: (payload: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  join_chat: (payload: JoinChatPayload) => void;
  send_message: (payload: SendMessagePayload) => void;
  mark_message_read: (payload: MarkMessageReadPayload) => void;
  update_last_seen: (payload: UpdateLastSeenPayload) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
}