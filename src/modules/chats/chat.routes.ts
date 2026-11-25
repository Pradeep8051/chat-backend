import { Router } from "express";
import { chatController } from "./chat.controller";
import { validateBody } from "../../middleware/validation.middleware";
import { createChatSchema } from "./chat.schemas";

const router = Router();
router.post("/create", validateBody(createChatSchema), chatController.createOrGet);
export default router;