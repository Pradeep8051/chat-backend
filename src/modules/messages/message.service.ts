import { firestore } from "../../config/firebase";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { chatService } from "../chats/chat.service";
import { NotFoundError, ValidationError } from "../../utils/errors";
import type { ChatMessageDTO } from "../../types/socket.types";

export type StoredMessage = ChatMessageDTO;

function messagesCollection(chatId: string) {
  return firestore.collection("chats").doc(chatId).collection("messages");
}

function toDTO(id: string, data: FirebaseFirestore.DocumentData): StoredMessage {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    chatId: data.chatId as string,
    senderId: data.senderId as string,
    text: data.text as string,
    createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

export const messageService = {
  async sendMessage(chatId: string, senderId: string, text: string): Promise<StoredMessage> {
    const trimmed = text.trim();
    if (!trimmed) throw new ValidationError("Message text must not be empty");
    await chatService.assertMembership(chatId, senderId);

    const docRef = messagesCollection(chatId).doc();
    const payload = {
      id: docRef.id,
      chatId,
      senderId,
      text: trimmed,
      createdAt: FieldValue.serverTimestamp(),
    };
    await docRef.set(payload);

    const saved = await docRef.get();
    return toDTO(docRef.id, saved.data() ?? payload);
  },

  async getMessageOrThrow(chatId: string, messageId: string): Promise<StoredMessage> {
    const doc = await messagesCollection(chatId).doc(messageId).get();
    if (!doc.exists) throw new NotFoundError(`Message ${messageId} not found in chat ${chatId}`);
    return toDTO(doc.id, doc.data() ?? {});
  },

  async listMessages(chatId: string, limit: number, before?: string): Promise<StoredMessage[]> {
    let query: FirebaseFirestore.Query = messagesCollection(chatId)
      .orderBy("createdAt", "asc")
      .limit(limit);

    if (before) {
      const cursorDoc = await messagesCollection(chatId).doc(before).get();
      if (!cursorDoc.exists) throw new NotFoundError(`Cursor message ${before} not found`);
      query = messagesCollection(chatId)
        .orderBy("createdAt", "asc")
        .startAfter(cursorDoc)
        .limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => toDTO(doc.id, doc.data()));
  },
};