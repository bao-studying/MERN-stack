import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Mảng 2 phần tử: [customerId, adminId/staffId]
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Cache tin nhắn cuối — dùng để hiển thị preview ở list admin
    lastMessage: {
      text: { type: String, default: "" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      seenByAdmin: { type: Boolean, default: false }, // badge unread
    },
  },
  { timestamps: true }, // createdAt + updatedAt tự động
);

// Index: sort by updatedAt để hội thoại mới nhất lên đầu
conversationSchema.index({ updatedAt: -1 });
// Index: tìm conversation theo participants nhanh
conversationSchema.index({ participants: 1 });

export default mongoose.model("conversation", conversationSchema);
