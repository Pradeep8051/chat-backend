import { firestore } from "../../config/firebase";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { chatService } from "../chats/chat.service";
import { messageService } from "../messages/message.service";
import type { LastSeenBroadcast, MessageReadBroadcast } from "../../types/socket.types";

function readReceiptsCollection(chatId: string) {
  return firestore.collection("chats").doc(chatId).collection("readReceipts");
}

function lastSeenCollection(chatId: string) {
  return firestore.collection("chats").doc(chatId).collection("lastSeen");
}

export const receiptService = {
  async markMessageRead(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<MessageReadBroadcast> {
    await chatService.assertMembership(chatId, userId);
    await messageService.getMessageOrThrow(chatId, messageId);

    const docRef = readReceiptsCollection(chatId).doc(userId);
    await docRef.set(
      { userId, messageId, chatId, readAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

    const saved = await docRef.get();
    const readAt = saved.data()?.readAt as Timestamp | undefined;
    return {
      chatId,
      messageId,
      userId,
      readAt: readAt ? readAt.toDate().toISOString() : new Date().toISOString(),
    };
  },

  async updateLastSeen(
    chatId: string,
    userId: string,
    messageId: string,
  ): Promise<LastSeenBroadcast> {
    await chatService.assertMembership(chatId, userId);
    await messageService.getMessageOrThrow(chatId, messageId);

    const docRef = lastSeenCollection(chatId).doc(userId);
    await docRef.set(
      { userId, chatId, messageId, lastSeenAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

    const saved = await docRef.get();
    const lastSeenAt = saved.data()?.lastSeenAt as Timestamp | undefined;
    return {
      chatId,
      userId,
      messageId,
      lastSeenAt: lastSeenAt ? lastSeenAt.toDate().toISOString() : new Date().toISOString(),
    };
  },
};