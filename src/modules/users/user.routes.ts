// import { Router } from "express";
// import { userController } from "./user.controller";
// import { validateParams } from "../../middleware/validation.middleware";
// import { userIdParamSchema } from "../chats/chat.schemas";

// const router = Router();
// router.get("/", userController.list);
// router.get("/:userId", validateParams(userIdParamSchema), userController.getById);
// export default router;



// === FILE: src/modules/users/user.routes.ts ===
import { Router } from "express";
import { userController } from "./user.controller";
import { validateParams } from "../../middleware/validation.middleware";
import { userIdParamSchema } from "../chats/chat.schemas";

const router = Router();

// GET /user -> list all users
router.get("/", userController.list);

// GET /user/:userId/chats -> list all chats for a user
// Declared BEFORE "/:userId" so it is matched first.
router.get("/:userId/chats", userController.listChats);

// GET /user/:userId -> get a single user
router.get("/:userId", validateParams(userIdParamSchema), userController.getById);

export default router;
