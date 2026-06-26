/**
 * ORDER SERVICE — cập nhật
 * Thêm email trigger cho từng trạng thái đơn hàng:
 *   createOrder      → gửi "order_confirmation"
 *   updateStatus     → gửi email tương ứng status mới
 *
 * Ưu tiên: template lưu trong DB (từ Email Builder) → fallback hardcoded
 */

import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import EmailTemplate from "../models/EmailTemplate.js";
import sendEmail from "../utils/sendEmail.js";
import {
  orderConfirmationTemplate,
  shippingStatusTemplate,
  completedStatusTemplate,
  cancelledStatusTemplate,
  confirmedStatusTemplate,
} from "../utils/emailTemplates.js";
import { markVoucherAsUsed } from "../services/voucher.service.js"; /* ─────────────────────────────────────────────────────────────────────────────
   HELPER: Render blocks từ DB + thay thế {{biến}} bằng dữ liệu thật
───────────────────────────────────────────────────────────────────────────── */
const renderBlocksToHtml = (blocks = []) => {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "header": {
          const sz = b.level === 1 ? 30 : b.level === 3 ? 20 : 26;
          return `<h${b.level || 2} style="color:${b.color || "#c8490c"};font-family:Georgia,serif;font-size:${sz}px;margin:20px 0 10px;">${b.content || ""}</h${b.level || 2}>`;
        }
        case "text":
          return `<p style="font-size:14px;line-height:1.75;margin:10px 0;color:#1c1917;">${b.content || ""}</p>`;
        case "image":
          return `<img src="${b.url || ""}" alt="${b.alt || ""}" style="width:100%;border-radius:8px;display:block;margin:14px 0;" />`;
        case "button":
          return `<div style="margin:16px 0;"><a href="${b.url || "#"}" style="display:inline-block;background:${b.bgColor || "#c8490c"};color:white;padding:11px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${b.text || "Xem"}</a></div>`;
        case "divider":
          return `<hr style="border:none;border-top:1px solid #e2ded6;margin:22px 0;" />`;
        case "spacer":
          return `<div style="height:${b.height || 20}px;"></div>`;
        case "product-table":
          return `{{product_table_html}}`;
        case "order-info":
          return `{{order_info_html}}`;
        case "customer-name":
          return `<p style="font-size:14px;margin:10px 0;">Xin chào <strong>{{customer_name}}</strong>,</p>`;
        case "timestamp":
          return `<p style="font-size:12px;color:#78716c;margin:8px 0;">Ngày đặt: <strong>{{order_date}}</strong></p>`;
        default:
          return "";
      }
    })
    .join("\n");
};

/**
 * Điền dữ liệu thật vào HTML từ blocks
 */
const fillTemplate = (rawHtml, order, userName) => {
  // Tạo product table HTML
  const productTableHtml = `
    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
      <thead><tr style="border-bottom:2px solid #c8490c;">
        <th style="padding:10px 8px;text-align:left;">Sản phẩm</th>
        <th style="padding:10px 8px;text-align:center;">SL</th>
        <th style="padding:10px 8px;text-align:right;">Giá</th>
      </tr></thead>
      <tbody>
        ${(order.items || [])
          .map(
            (item) => `
          <tr style="border-bottom:1px solid #e2ded6;">
            <td style="padding:10px 8px;">${item.name}</td>
            <td style="padding:10px 8px;text-align:center;">${item.quantity}</td>
            <td style="padding:10px 8px;text-align:right;">${(item.price_cents * item.quantity).toLocaleString()} đ</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
      <tfoot><tr>
        <td colspan="2" style="padding:10px 8px;text-align:right;font-weight:600;">Tổng cộng:</td>
        <td style="padding:10px 8px;text-align:right;font-weight:600;color:#c8490c;">${order.totalAmount_cents.toLocaleString()} đ</td>
      </tr></tfoot>
    </table>`;

  // Tạo order info HTML
  const orderInfoHtml = `
    <div style="background:#f9f9f7;padding:14px 16px;border-radius:8px;border-left:4px solid #c8490c;margin:12px 0;font-size:14px;line-height:1.8;">
      <p style="margin:0 0 4px;"><strong>Mã đơn:</strong> #${order.orderNumber}</p>
      <p style="margin:0 0 4px;"><strong>Địa chỉ:</strong> ${order.shippingAddress || "—"}</p>
      <p style="margin:0 0 4px;"><strong>SĐT:</strong> ${order.phoneNumber || "—"}</p>
      <p style="margin:0;"><strong>Thanh toán:</strong> ${order.paymentMethod?.toUpperCase() || "COD"}</p>
    </div>`;

  return rawHtml
    .replace(/{{customer_name}}/g, userName)
    .replace(/{{order_number}}/g, order.orderNumber)
    .replace(
      /{{order_date}}/g,
      new Date(order.createdAt).toLocaleDateString("vi-VN"),
    )
    .replace(/{{shipping_address}}/g, order.shippingAddress || "—")
    .replace(/{{phone_number}}/g, order.phoneNumber || "—")
    .replace(/{{payment_method}}/g, order.paymentMethod?.toUpperCase() || "COD")
    .replace(
      /{{total_amount}}/g,
      order.totalAmount_cents.toLocaleString() + " đ",
    )
    .replace(/{{product_table_html}}/g, productTableHtml)
    .replace(/{{order_info_html}}/g, orderInfoHtml);
};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER: Lấy HTML email theo status
   Ưu tiên DB template → fallback hardcoded
───────────────────────────────────────────────────────────────────────────── */

// Map: order status → email template type
const STATUS_TO_TEMPLATE_TYPE = {
  confirmed: "order_confirmation",
  shipping: "shipping",
  delivered: "delivered",
  completed: "delivered",
  cancelled: "cancelled",
};

// Subject theo status
const STATUS_SUBJECTS = {
  confirmed: (num) => `✅ Đơn hàng #${num} đã được xác nhận`,
  shipping: (num) => `🚚 Đơn hàng #${num} đang trên đường giao`,
  delivered: (num) => `🎉 Đơn hàng #${num} đã giao thành công`,
  completed: (num) => `🎉 Đơn hàng #${num} đã hoàn thành`,
  cancelled: (num) => `❌ Đơn hàng #${num} đã bị hủy`,
};

// Hardcoded fallback functions (import từ emailTemplates.js)
const HARDCODED_FALLBACKS = {
  confirmed: (order, name) => confirmedStatusTemplate(order, name),
  shipping: (order, name) => shippingStatusTemplate(order, name),
  delivered: (order, name) => completedStatusTemplate(order, name),
  completed: (order, name) => completedStatusTemplate(order, name),
  cancelled: (order, name) => cancelledStatusTemplate(order, name),
};

/**
 * Lấy HTML email cho 1 status cụ thể
 * 1. Tìm template trong DB (từ Email Builder)
 * 2. Nếu không có hoặc không active → dùng hardcoded
 */
const getEmailHtml = async (status, order, userName) => {
  const templateType = STATUS_TO_TEMPLATE_TYPE[status];
  console.log(`🔍 status="${status}" → templateType="${templateType}"`);
  if (!templateType) return null;

  try {
    const dbTemplate = await EmailTemplate.findOne({
      type: templateType,
      isActive: true,
    });
    console.log(
      `📦 DB template:`,
      dbTemplate
        ? `"${dbTemplate.name}" (${dbTemplate.blocks?.length} blocks)`
        : "KHÔNG TÌM THẤY",
    );

    if (dbTemplate?.blocks?.length > 0) {
      console.log(`📧 Dùng DB template: ${templateType}`);
      const rawHtml = renderBlocksToHtml(dbTemplate.blocks);
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>body{font-family:'DM Sans',Arial,sans-serif;margin:0;padding:16px;background:#f4f2ee;}
        .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:0.5px solid #e2ded6;padding:24px 28px;}</style>
        </head><body><div class="wrap">${rawHtml}</div></body></html>`;
      return fillTemplate(fullHtml, order, userName);
    }
  } catch (err) {
    console.warn(
      `⚠️ Không lấy được DB template (${templateType}):`,
      err.message,
    );
  }

  // Fallback hardcoded
  console.log(`📧 Dùng hardcoded template: ${templateType}`);
  const fallbackFn = HARDCODED_FALLBACKS[status];
  return fallbackFn ? fallbackFn(order, userName) : null;
};

/* ─────────────────────────────────────────────────────────────────────────────
   CLIENT: TẠO ĐƠN HÀNG
──────*/ export const createOrderService = async (userId, orderData) => {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) throw new Error("Giỏ hàng trống");

  const {
    voucherId,
    discountAmount = 0,
    selectedProductIds = [],
    orderItems: orderItemsPayload = [],
  } = orderData;
  const user = await User.findById(userId);
  const customerName =
    orderData.customerName || user?.name || user?.email || "Khách hàng";

  // ── NEW: ưu tiên khớp theo cặp (productId + variantId) từ orderItemsPayload ──
  // nếu frontend gửi orderItems (đã có variantId từng dòng) thì dùng nó để xác định
  // chính xác dòng cart nào được chọn (tránh nhầm khi 1 product có nhiều biến thể trong cart)
  const usePayloadKeys =
    Array.isArray(orderItemsPayload) && orderItemsPayload.length > 0;
  const payloadKeySet = new Set(
    usePayloadKeys
      ? orderItemsPayload.map(
          (i) => `${i.productId}__${i.variantId || "default"}`,
        )
      : [],
  );

  const selectedIdSet = new Set(
    Array.isArray(selectedProductIds)
      ? selectedProductIds.map((id) => id.toString())
      : [],
  );

  const checkoutItems = usePayloadKeys
    ? cart.items.filter((item) => {
        const vid = item.variantId ? item.variantId.toString() : "default";
        return payloadKeySet.has(`${item.productId}__${vid}`);
      })
    : selectedIdSet.size > 0
      ? cart.items.filter((item) =>
          selectedIdSet.has(item.productId.toString()),
        )
      : cart.items;

  if (checkoutItems.length === 0)
    throw new Error("Không có sản phẩm hợp lệ để thanh toán");

  let totalAmount_cents = 0;
  const orderItems = [];
  // Theo dõi key đã xử lý để xóa đúng dòng cart (productId+variantId), không xóa nhầm dòng khác variant
  const processedKeys = [];

  for (const item of checkoutItems) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);

    // ── NEW: tìm đúng biến thể theo variantId của dòng cart, fallback variant đầu tiên ──
    const cartVariantId = item.variantId ? item.variantId.toString() : null;
    const variant = cartVariantId
      ? product.variants?.find((v) => v._id.toString() === cartVariantId)
      : product.variants?.[0];

    if (!variant) throw new Error(`Sản phẩm ${product.name} lỗi dữ liệu`);
    if (variant.stock < item.quantity)
      throw new Error(`Sản phẩm ${product.name} đã hết hàng`);

    variant.stock -= item.quantity;
    await product.save();

    orderItems.push({
      productId: product._id,
      name: product.name,
      price_cents: variant.price_cents,
      image: product.images?.[0]?.imageUrl || "",
      // NEW: snapshot biến thể
      variantId: variant._id || null,
      variantName: variant.name || "",
      sku: variant.sku || "",
      attributes: variant.attributes || {},
      quantity: item.quantity,
    });
    totalAmount_cents += variant.price_cents * item.quantity;

    processedKeys.push(`${item.productId}__${cartVariantId || "default"}`);
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
    customerName,
    note: orderData.note,
    paymentMethod: orderData.paymentMethod || "COD",
    status: "pending",
    ...(voucherId && {
      voucherId,
      voucherCode: orderData.voucherCode || "",
      discountAmount: Number(discountAmount),
    }),
  });

  // ── Dọn giỏ hàng — NEW: xóa đúng theo (productId+variantId), không xóa nhầm variant khác cùng product ──
  const processedKeySet = new Set(processedKeys);
  cart.items = cart.items.filter((item) => {
    const vid = item.variantId ? item.variantId.toString() : "default";
    return !processedKeySet.has(`${item.productId}__${vid}`);
  });
  await cart.save();

  if (voucherId) {
    await markVoucherAsUsed(voucherId, userId).catch((err) =>
      console.error("⚠️ markVoucherUsed lỗi:", err.message),
    );
  }

  // ── Gửi email xác nhận đặt hàng ── (GIỮ NGUYÊN, không đổi)
  if (user?.email) {
    (async () => {
      try {
        const dbTemplate = await EmailTemplate.findOne({
          type: "order_confirmation",
          isActive: true,
        });

        let html;
        if (dbTemplate?.blocks?.length > 0) {
          const rawHtml = renderBlocksToHtml(dbTemplate.blocks);
          const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
            <style>body{font-family:Arial,sans-serif;margin:0;padding:16px;background:#f4f2ee;}
            .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:24px 28px;border:0.5px solid #e2ded6;}</style>
            </head><body><div class="wrap">${rawHtml}</div></body></html>`;
          html = fillTemplate(fullHtml, newOrder, user.name || "Khách hàng");
        } else {
          html = orderConfirmationTemplate(newOrder, user.name || "Khách hàng");
        }

        await sendEmail({
          email: user.email,
          subject: `🛒 Xác nhận đơn hàng #${newOrder.orderNumber} - BAO Po_Box`,
          html,
        });
        console.log(`✅ Email đặt hàng gửi đến: ${user.email}`);
      } catch (err) {
        console.error("⚠️ Lỗi gửi mail đặt hàng:", err.message);
      }
    })();
  }

  return newOrder;
};
/* ─────────────────────────────────────────────────────────────────────────────
   CLIENT: XEM ĐƠN HÀNG
───────────────────────────────────────────────────────────────────────────── */
export const getOrderByIdService = async (userId, orderId) => {
  return Order.findOne({ _id: orderId, userId });
};

export const getMyOrdersService = async (userId) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

/* ─────────────────────────────────────────────────────────────────────────────
   ADMIN: LẤY TẤT CẢ ĐƠN HÀNG
───────────────────────────────────────────────────────────────────────────── */
export const getAllOrdersService = async (query) => {
  const filter = {};
  if (query.status && query.status !== "all") filter.status = query.status;
  if (query.userId) filter.userId = query.userId;

  return await Order.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};

/* ─────────────────────────────────────────────────────────────────────────────
   ADMIN: CẬP NHẬT TRẠNG THÁI → tự động gửi email
───────────────────────────────────────────────────────────────────────────── */
export const updateOrderStatusService = async (orderId, status) => {
  // Populate userId để có email + tên khách
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true },
  ).populate("userId", "name email");

  if (!order) throw new Error("Order not found");

  // Gửi email tương ứng status (non-blocking)
  const userEmail = order.userId?.email;
  const userName = order.userId?.name || "Khách hàng";

  if (userEmail && STATUS_TO_TEMPLATE_TYPE[status]) {
    (async () => {
      try {
        const html = await getEmailHtml(status, order, userName);
        if (!html) return;

        const subjectFn = STATUS_SUBJECTS[status];
        await sendEmail({
          email: userEmail,
          subject: subjectFn
            ? subjectFn(order.orderNumber)
            : `Cập nhật đơn hàng #${order.orderNumber}`,
          html,
        });
        console.log(`✅ Email [${status}] gửi đến: ${userEmail}`);
      } catch (err) {
        console.error(`⚠️ Lỗi gửi mail [${status}]:`, err.message);
      }
    })();
  }

  return order;
};

/* ─────────────────────────────────────────────────────────────────────────────
   UTIL: Tổng chi tiêu 1 user
───────────────────────────────────────────────────────────────────────────── */
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
