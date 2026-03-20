/**
 * socket/chat.socket.js
 *
 * Gắn vào server.js:
 *   import { initChatSocket } from "./socket/chat.socket.js";
 *   const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } });
 *   initChatSocket(io);
 */
import jwt from "jsonwebtoken";
import Message from "../src/models/Message.model.js";
import Conversation from "../src/models/Conversation.model.js";

export const initChatSocket = (io) => {
  /* ── 1. MIDDLEWARE XÁC THỰC TOKEN ── */
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized: no token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId || decoded.id; // khớp với cách bạn sign token
      socket.role = decoded.role;
      next();
    } catch {
      next(new Error("Unauthorized: invalid token"));
    }
  });

  /* ── 2. KẾT NỐI ── */
  io.on("connection", (socket) => {
    const uid = socket.userId;

    // Mỗi user join vào room có ID là chính userId của họ
    // → cho phép server emit("to specific user") dễ dàng
    socket.join(uid);
    console.log(`[Socket] User ${uid} connected — socket ${socket.id}`);

    /* ── 3. GỬI TIN NHẮN ── */
    socket.on("send_message", async ({ conversationId, text }, ack) => {
      if (!conversationId || !text?.trim()) return;

      try {
        // 3a. Lưu vào DB
        const msg = await Message.create({
          conversationId,
          sender: uid,
          text: text.trim(),
        });

        // 3b. Populate sender để FE hiển thị ngay
        const populated = await msg.populate("sender", "name avatarUrl");

        // 3c. Cập nhật lastMessage + updatedAt trên Conversation
        const conv = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            "lastMessage.text": text.trim(),
            "lastMessage.senderId": uid,
            "lastMessage.seenByAdmin": false, // reset unread
          },
          { new: true },
        ).populate("participants", "name avatarUrl email");

        // 3d. Emit đến TẤT CẢ participants của conversation này
        //     (cả người gửi để đồng bộ multi-tab)
        if (conv?.participants) {
          conv.participants.forEach((p) => {
            io.to(p._id.toString()).emit("new_message", {
              message: populated,
              conversation: conv,
            });
          });
        }

        // 3e. Xác nhận gửi thành công về cho người gửi (optional callback)
        if (typeof ack === "function")
          ack({ success: true, messageId: msg._id });
      } catch (err) {
        console.error("[Socket] send_message error:", err);
        if (typeof ack === "function")
          ack({ success: false, error: err.message });
      }
    });

    /* ── 4. TYPING INDICATOR ── */
    socket.on("typing", ({ conversationId, toUserId }) => {
      // Chỉ emit sang người kia, không emit lại chính mình
      socket
        .to(toUserId)
        .emit("user_typing", { conversationId, fromUserId: uid });
    });

    socket.on("stop_typing", ({ conversationId, toUserId }) => {
      socket
        .to(toUserId)
        .emit("user_stop_typing", { conversationId, fromUserId: uid });
    });

    /* ── 5. NGẮT KẾT NỐI ── */
    socket.on("disconnect", () => {
      console.log(`[Socket] User ${uid} disconnected`);
    });
  });
};
