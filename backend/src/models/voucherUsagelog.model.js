import mongoose from "mongoose";

const voucherUsageLogSchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: String, // VD: "ORD-123456"
      required: true,
      index: true,
    },

    // Chi tiết giao dịch
    discountAmount: { type: Number, required: true, min: 0 }, // Số tiền giảm (VNĐ)
    orderTotal: { type: Number, required: true, min: 0 }, // Đơn hàng trước giảm
    orderTotalAfter: { type: Number, required: true, min: 0 }, // Đơn hàng sau giảm

    // Phân loại khách lúc dùng voucher
    // "new" | "loyal" | "one-time" | "at-risk" | "high-value"
    userSegment: {
      type: String,
      default: "new",
      enum: ["new", "loyal", "one-time", "at-risk", "high-value"],
    },

    usedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

// Index cho queries thường xuyên
voucherUsageLogSchema.index({ voucherId: 1, usedAt: -1 });
voucherUsageLogSchema.index({ userId: 1, usedAt: -1 });
voucherUsageLogSchema.index({ voucherId: 1, userSegment: 1 });

export default mongoose.model("VoucherUsageLog", voucherUsageLogSchema);
