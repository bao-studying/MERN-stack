import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../utils/emailTemplates.js";
import { markVoucherUsed } from "../controllers/voucher.controller.js";

// --- CLIENT: TẠO ĐƠN HÀNG (GIỮ NGUYÊN) ---
export const createOrderService = async (userId, orderData) => {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) throw new Error("Giỏ hàng trống");

  const { voucherId, discountAmount = 0, selectedProductIds = [] } = orderData;

  const selectedIdSet = new Set(
    Array.isArray(selectedProductIds)
      ? selectedProductIds.map((id) => id.toString())
      : [],
  );
  const checkoutItems =
    selectedIdSet.size > 0
      ? cart.items.filter((item) =>
          selectedIdSet.has(item.productId.toString()),
        )
      : cart.items;
  if (checkoutItems.length === 0)
    throw new Error("Không có sản phẩm hợp lệ để thanh toán");

  let totalAmount_cents = 0;
  const orderItems = [];

  for (const item of checkoutItems) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);
    const variant = product.variants?.[0];
    if (!variant)
      throw new Error(
        `Sản phẩm ${product.name} lỗi dữ liệu (không có variant)`,
      );
    if (variant.stock < item.quantity)
      throw new Error(`Sản phẩm ${product.name} đã hết hàng`);
    variant.stock -= item.quantity;
    await product.save();
    orderItems.push({
      productId: product._id,
      name: product.name,
      price_cents: variant.price_cents,
      image: product.images?.[0]?.imageUrl || "",
      quantity: item.quantity,
    });
    totalAmount_cents += variant.price_cents * item.quantity;
  }

  const SHIPPING_FEE = 30000;
  const FREESHIP_THRESHOLD = 300000;
  let finalTotal = totalAmount_cents;
  if (totalAmount_cents < FREESHIP_THRESHOLD) finalTotal += SHIPPING_FEE;
  if (discountAmount > 0)
    finalTotal = Math.max(0, finalTotal - Number(discountAmount));

  const newOrder = await Order.create({
    userId,
    orderNumber: `ORD-${Date.now()}`,
    items: orderItems,
    totalAmount_cents: finalTotal,
    shippingAddress: orderData.shippingAddress,
    phoneNumber: orderData.phoneNumber,
    note: orderData.note,
    paymentMethod: orderData.paymentMethod || "COD",
    status: "pending",
    ...(voucherId && {
      voucherId,
      voucherCode: orderData.voucherCode || "",
      discountAmount: Number(discountAmount),
    }),
  });

  if (selectedIdSet.size > 0) {
    cart.items = cart.items.filter(
      (item) => !selectedIdSet.has(item.productId.toString()),
    );
  } else {
    cart.items = [];
  }
  await cart.save();

  if (voucherId) {
    await markVoucherUsed(voucherId, userId).catch((err) =>
      console.error("⚠️ markVoucherUsed lỗi:", err.message),
    );
  }

  const user = await User.findById(userId);
  if (user?.email) {
    sendEmail({
      email: user.email,
      subject: `Xác nhận đơn hàng #${newOrder.orderNumber} - EcoStore`,
      html: orderConfirmationTemplate(newOrder, user.name || "Khách hàng"),
    }).catch((err) => console.error("⚠️ Lỗi gửi mail:", err.message));
  }

  return newOrder;
};

// --- CLIENT: LẤY ĐƠN HÀNG CỦA TÔI (GIỮ NGUYÊN) ---
export const getMyOrdersService = async (userId) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

// ─────────────────────────────────────────────────────────────
// --- ADMIN: LẤY TẤT CẢ ĐƠN HÀNG
// THÊM MỚI: nhận query.userId để lọc đơn của 1 khách hàng cụ thể
// ─────────────────────────────────────────────────────────────
export const getAllOrdersService = async (query) => {
  const filter = {};

  // Filter theo trạng thái (giữ nguyên)
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  // ── THÊM MỚI: filter theo userId ──
  // Dùng khi admin xem hồ sơ 1 khách hàng cụ thể
  if (query.userId) {
    filter.userId = query.userId;
  }

  return await Order.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};

// --- ADMIN: CẬP NHẬT TRẠNG THÁI (GIỮ NGUYÊN) ---
export const updateOrderStatusService = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true },
  );
  if (!order) throw new Error("Order not found");
  return order;
};

// ─────────────────────────────────────────────────────────────
// THÊM MỚI: Tổng chi tiêu 1 user — dùng cho sort "spending"
// Chỉ tính đơn status = "delivered"
// ─────────────────────────────────────────────────────────────
export const getUserSpendingService = async (userId) => {
  const result = await Order.aggregate([
    { $match: { userId: userId, status: "delivered" } },
    {
      $group: {
        _id: "$userId",
        totalSpend: { $sum: "$totalAmount_cents" },
        orderCount: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { totalSpend: 0, orderCount: 0 };
};
