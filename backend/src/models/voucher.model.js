import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
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

    expiryDate: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true },

    // Admin chọn tay ai được dùng
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Ai đã dùng (1 người chỉ dùng 1 lần)
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 💰 FINANCIAL TRACKING (NEW)
    costToProduce: {
      type: Number,
      default: 0,
      min: 0,
      description: "Chi phí tạo voucher (VNĐ) - estimate hoặc actual",
    },

    maxBudget: {
      type: Number,
      default: 0,
      min: 0,
      description: "Tối đa được giảm bao nhiêu (0 = không giới hạn)",
    },

    // STATS (auto-update khi có VoucherUsageLog mới)
    stats: {
      timesGiven: { type: Number, default: 0, min: 0 },
      timesUsed: { type: Number, default: 0, min: 0 },
      usageRate: { type: Number, default: 0, min: 0, max: 1 }, // % (timesUsed / timesGiven)

      totalRevenueImpact: { type: Number, default: 0, min: 0 }, // Tổng tiền giảm
      totalOrdersGenerated: { type: Number, default: 0, min: 0 }, // Tổng doanh thu có voucher

      // Breakdown theo segment
      bySegment: {
        new: {
          count: { type: Number, default: 0 },
          discount: { type: Number, default: 0 },
        },
        loyal: {
          count: { type: Number, default: 0 },
          discount: { type: Number, default: 0 },
        },
        oneTime: {
          count: { type: Number, default: 0 },
          discount: { type: Number, default: 0 },
        },
        atRisk: {
          count: { type: Number, default: 0 },
          discount: { type: Number, default: 0 },
        },
        highValue: {
          count: { type: Number, default: 0 },
          discount: { type: Number, default: 0 },
        },
      },

      lastUsedAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

// Indexes
voucherSchema.index({ code: 1 });
voucherSchema.index({ assignedTo: 1 });
voucherSchema.index({ createdAt: -1 });
voucherSchema.index({ expiryDate: 1 });
voucherSchema.index({ isActive: 1, expiryDate: 1 });

// Virtual: ROI = totalRevenueImpact / costToProduce
voucherSchema.virtual("roi").get(function () {
  if (this.costToProduce === 0) return this.stats.timesUsed > 0 ? 999 : 0;
  return (
    Math.round((this.stats.totalRevenueImpact / this.costToProduce) * 100) / 100
  );
});

export default mongoose.model("Voucher", voucherSchema);
