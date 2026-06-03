/**
 * EMAIL TEMPLATE MODEL - FIXED
 * ✅ type có unique index → đảm bảo mỗi type chỉ có 1 document trong DB
 * ✅ Upsert sẽ hoạt động đúng (không tạo duplicate)
 * ✅ Thêm các type mới: pending, delivered, cancelled
 */

import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // ── TYPE LÀ UNIQUE KEY ──
    // Mỗi type chỉ có 1 document trong DB
    // Khi upsert: findOneAndUpdate({ type }) sẽ update đúng document
    type: {
      type: String,
      required: true,
      unique: true, // ← KEY: đảm bảo không trùng type
      enum: [
        "pending", // Đặt hàng thành công
        "order_confirmation", // Xác nhận đơn
        "shipping", // Đang giao hàng
        "delivered", // Giao thành công
        "cancelled", // Đã hủy đơn
        "welcome", // Chào mừng thành viên
        "contact_reply", // Phản hồi liên hệ
        "custom",
      ],
      default: "custom",
    },

    // Visual builder blocks
    blocks: [
      {
        id: { type: String },
        type: { type: String },
        content: { type: String },
        level: { type: Number }, // header
        color: { type: String }, // header
        url: { type: String }, // image, button
        bgColor: { type: String }, // button
        text: { type: String }, // button label
        height: { type: Number }, // spacer
      },
    ],

    emailConfig: {
      fromEmail: { type: String },
      subject: { type: String },
      preheader: { type: String },
    },

    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  {
    timestamps: true, // tự động thêm createdAt + updatedAt
  },
);

// ── INDEX ──
// unique: true trên field type đã tạo index tự động
// Thêm index cho query phổ biến
emailTemplateSchema.index({ isActive: 1 });
emailTemplateSchema.index({ updatedAt: -1 });

export default mongoose.model("EmailTemplate", emailTemplateSchema);
