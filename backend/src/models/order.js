import mongoose from "mongoose";

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    // --- SNAPSHOT: Lưu cứng thông tin tại thời điểm mua ---
    name: { type: String, required: true },
    price_cents: { type: Number, required: true },
    image: String,
    // -----------------------------------------------------
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true }, // Mã đơn hàng (ví dụ: ORD-12345)

    items: [OrderItemSchema],

    // Thông tin giao hàng (Bắt buộc phải có)
    shippingAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    customerName: { type: String },
    note: String, // Ghi chú của khách hàng

    totalAmount_cents: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },

    // Lịch sử trạng thái (Giữ lại ý tưởng của bạn - rất hay!)
    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],

    paymentMethod: { type: String, default: "COD" },
    paymentStatus: { type: String, default: "unpaid" },

    // Thêm trường này vào schema hiện tại của bạn
    payOSOrderCode: {
      type: Number,
      unique: true,
      sparse: true, // Chỉ tồn tại khi thanh toán qua PayOS
    },
    // Coupons
    coupons: [
      {
        couponId: Schema.Types.ObjectId,
        appliedAmountCents: Number,
      },
    ],
  },
  { timestamps: true },
); // Tự động có createdAt, updatedAt

export default mongoose.model("Order", OrderSchema);
