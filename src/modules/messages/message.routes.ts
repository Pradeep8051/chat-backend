import { Router } from "express";
import { messageController } from "./message.controller";
import { receiptController } from "../receipts/receipt.controller";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware/validation.middleware";
import {
  chatIdAndMessageIdParamSchema,
  chatIdParamSchema,
  getMessagesQuerySchema,
  lastSeenSchema,
  markReadSchema,
  sendMessageSchema,
} from "../chats/chat.schemas";

const router = Router();

router.post(
  "/:chatId/message/send",
  validateParams(chatIdParamSchema),
  validateBody(sendMessageSchema),
  messageController.send,
);

router.get(
  "/:chatId/messages",
  validateParams(chatIdParamSchema),
  validateQuery(getMessagesQuerySchema),
  messageController.list,
);

router.post(
  "/:chatId/message/:messageId/read",
  validateParams(chatIdAndMessageIdParamSchema),
  validateBody(markReadSchema),
  receiptController.markRead,
);

router.post(
  "/:chatId/lastseen",
  validateParams(chatIdParamSchema),
  validateBody(lastSeenSchema),
  receiptController.updateLastSeen,
);

export default router;