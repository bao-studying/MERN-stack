import express from "express";
import {
  getOrCreateConversation,
  getMessages,
  getAllConversations,
  markSeen,
} from "../controllers/Chat.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();
router.use(verifyToken); // Tất cả route chat đều cần đăng nhập

/* ── CLIENT routes ── */
// Khách tạo/lấy conversation của mình
router.post("/conversation", getOrCreateConversation);
// Lấy lịch sử (cả khách lẫn admin đều dùng)
router.get("/messages/:conversationId", getMessages);

/* ── ADMIN routes ── */
router.get(
  "/admin/conversations",
  requireRole(["admin", "manager", "staff"]),
  getAllConversations,
);
router.put(
  "/admin/conversations/:id/seen",
  requireRole(["admin", "manager", "staff"]),
  markSeen,
);

export default router;

/* ─────────────────────────────────────────────
   Thêm vào app.js / server.js của bạn:
   import chatRouter from "./routes/chat.route.js";
   app.use("/api/chat", chatRouter);
───────────────────────────────────────────── */
