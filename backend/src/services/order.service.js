import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../utils/emailTemplates.js";
import { markVoucherUsed } from "../controllers/voucher.controller.js";

// --- CLIENT: TẠO ĐƠN HÀNG ---
export const createOrderService = async (userId, orderData) => {
  // 1. Lấy giỏ hàng
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  // ── Lấy voucherId từ orderData TRƯỚC khi dùng ──────────────
  const { voucherId, discountAmount = 0 } = orderData;
  // ────────────────────────────────────────────────────────────

  let totalAmount_cents = 0;
  const orderItems = [];

  // 2. Duyệt qua từng sản phẩm để check tồn kho và tính tiền
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);

    const variant = product.variants?.[0];
    if (!variant)
      throw new Error(
        `Sản phẩm ${product.name} lỗi dữ liệu (không có variant)`,
      );

    if (variant.stock < item.quantity) {
      throw new Error(`Sản phẩm ${product.name} đã hết hàng`);
    }

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

  // 3. Tính phí ship
  const SHIPPING_FEE = 30000;
  const FREESHIP_THRESHOLD = 300000;
  let finalTotal = totalAmount_cents;
  if (totalAmount_cents < FREESHIP_THRESHOLD) {
    finalTotal += SHIPPING_FEE;
  }

  // ── Áp discount voucher (trừ SAU khi đã cộng ship) ─────────
  if (discountAmount > 0) {
    finalTotal = Math.max(0, finalTotal - Number(discountAmount));
  }
  // ────────────────────────────────────────────────────────────

  // 4. Tạo Order
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
    // ── Lưu lại thông tin voucher đã dùng (tuỳ chọn) ──────
    ...(voucherId && {
      voucherId,
      voucherCode: orderData.voucherCode || "",
      discountAmount: Number(discountAmount),
    }),
  });

  // 5. Xóa giỏ hàng
  cart.items = [];
  await cart.save();

  // ── Đánh dấu voucher đã dùng SAU KHI lưu order thành công ──
  if (voucherId) {
    await markVoucherUsed(voucherId, userId).catch((err) =>
      console.error(
        "⚠️ markVoucherUsed lỗi (không ảnh hưởng đơn):",
        err.message,
      ),
    );
  }
  // ────────────────────────────────────────────────────────────

  // 6. Gửi email xác nhận (non-blocking)
  const user = await User.findById(userId);
  if (user && user.email) {
    sendEmail({
      email: user.email,
      subject: `Xác nhận đơn hàng #${newOrder.orderNumber} - EcoStore`,
      html: orderConfirmationTemplate(newOrder, user.name || "Khách hàng"),
    }).catch((err) =>
      console.error(
        "⚠️ Lỗi gửi mail ngầm (Không ảnh hưởng đơn hàng):",
        err.message,
      ),
    );
  }

  return newOrder;
};

// --- CLIENT: LẤY ĐƠN HÀNG CỦA TÔI ---
export const getMyOrdersService = async (userId) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

// --- ADMIN: LẤY TẤT CẢ ĐƠN HÀNG ---
export const getAllOrdersService = async (query) => {
  const filter = {};
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  return await Order.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};

// --- ADMIN: CẬP NHẬT TRẠNG THÁI ---
export const updateOrderStatusService = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true },
  );
  if (!order) throw new Error("Order not found");
  return order;
};
