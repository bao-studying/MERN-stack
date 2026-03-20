import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import User from "../models/user.js";

/* ─────────────────────────────────────────────────────────────────
   HELPER: lấy userId an toàn từ token đã decode
───────────────────────────────────────────────────────────────── */
const getUid = (req) => req.user?.userId || req.user?.id;

/* ─────────────────────────────────────────────────────────────────
   CLIENT: Tạo hoặc lấy conversation của chính mình
   POST /api/chat/conversation
   Body: không cần gì (lấy userId từ token)
───────────────────────────────────────────────────────────────── */
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const customerId = getUid(req);

    // Tìm admin đầu tiên để gán làm người nhận mặc định
    const adminRole = await (
      await import("../models/role.js")
    ).default.findOne({ name: "admin" });
    const admin = await User.findOne({ role: adminRole?._id, status: 1 }).sort({
      createdAt: 1,
    });

    if (!admin) {
      return res.status(503).json({ message: "Không có admin trực tuyến." });
    }

    // Tìm conversation đã tồn tại giữa 2 người
    let conv = await Conversation.findOne({
      participants: { $all: [customerId, admin._id] },
    }).populate("participants", "name avatarUrl role");

    // Nếu chưa có thì tạo mới
    if (!conv) {
      conv = await Conversation.create({
        participants: [customerId, admin._id],
        lastMessage: { text: "", seenByAdmin: true },
      });
      conv = await conv.populate("participants", "name avatarUrl role");
    }

    res.json({ success: true, conversation: conv });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────
   CLIENT: Lấy lịch sử tin nhắn (10 tin mới nhất)
   GET /api/chat/messages/:conversationId?before=<messageId>
   (before dùng cho infinite scroll — load thêm khi cuộn lên)
───────────────────────────────────────────────────────────────── */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { before } = req.query;
    const LIMIT = 20;

    const filter = { conversationId };
    if (before) {
      const refMsg = await Message.findById(before).select("createdAt");
      if (refMsg) filter.createdAt = { $lt: refMsg.createdAt };
    }

    const messages = await Message.find(filter)
      .populate("sender", "name avatarUrl")
      .sort({ createdAt: -1 })
      .limit(LIMIT);

    // Trả về theo thứ tự tăng dần để FE render đúng hướng
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN: Lấy tất cả conversations (danh sách bên trái)
   GET /api/chat/admin/conversations
───────────────────────────────────────────────────────────────── */
export const getAllConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find()
      .populate("participants", "name avatarUrl email")
      .sort({ updatedAt: -1 }); // Mới nhất lên đầu

    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN: Đánh dấu đã đọc
   PUT /api/chat/admin/conversations/:id/seen
───────────────────────────────────────────────────────────────── */
export const markSeen = async (req, res, next) => {
  try {
    await Conversation.findByIdAndUpdate(req.params.id, {
      "lastMessage.seenByAdmin": true,
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};