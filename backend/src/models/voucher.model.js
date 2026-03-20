import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },

    // "percent" | "fixed" | "freeship"
    type: {
      type: String,
      enum: ["percent", "fixed", "freeship"],
      required: true,
    },

    // percent → value = 10 (%)  |  fixed → value = 50000 (VNĐ)  |  freeship → 0
    value: { type: Number, default: 0, min: 0 },
    // Giảm tối đa áp cho loại percent
    maxDiscount: { type: Number, default: 0, min: 0 },

    // Đơn tối thiểu — range do admin chọn khi tạo (1,000,000 – 20,000,000)
    minOrder: {
      type: Number,
      default: 1_000_000,
      min: 1_000_000,
      max: 20_000_000,
    },

    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },

    // Admin chọn tay ai được dùng
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Ai đã dùng (1 người chỉ dùng 1 lần)
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

voucherSchema.index({ code: 1 });
voucherSchema.index({ assignedTo: 1 });

export default mongoose.model("Voucher", voucherSchema);
