import mongoose from "mongoose";
import Order from "../models/order.js";
import axios from "axios";

// ─────────────────────────────────────────────
// Helper: Gửi tin nhắn Telegram
// ─────────────────────────────────────────────
const escapeTelegramHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const sendTelegramMessage = async (chatId, text, options = {}) => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    console.log(
      `📤 Gửi Telegram tới chat ${chatId}:`,
      text.substring(0, 50) + "...",
    );
    console.log(`   Độ dài text: ${text.length} ký tự`);
    console.log(`   Options:`, options);

    const payload = { chat_id: chatId, text, ...options };
    console.log(`   Full payload:`, JSON.stringify(payload).substring(0, 200));

    const response = await axios.post(url, payload);
    console.log(`✅ Gửi thành công!`, response.status);
    return true;
  } catch (err) {
    console.error("❌ Lỗi gửi tin nhắn Bot:");
    console.error("   Status:", err.response?.status);
    console.error("   Message:", err.message);
    console.error("   Response:", err.response?.data);
    console.error("   URL:", err.config?.url);
    return false;
  }
};

// ─────────────────────────────────────────────
// ✅ EXPORT: Gửi thông báo đơn hàng mới
// ─────────────────────────────────────────────
export const sendOrderToTelegram = async (order, paymentMethod = "COD") => {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn(
        "⚠️ Telegram config chưa đầy đủ (TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID)",
      );
      return;
    }

    // Định dạng tiền tệ
    const formatPrice = (price) =>
      new Intl.NumberFormat("vi-VN").format(price || 0);

    const actualPaymentMethod = (
      paymentMethod ||
      order.paymentMethod ||
      "COD"
    ).toString();
    const normalizedPaymentMethod = actualPaymentMethod.toUpperCase();

    const paymentText =
      normalizedPaymentMethod === "COD"
        ? "💵 Thanh toán khi nhận hàng (COD)"
        : normalizedPaymentMethod === "SEPAY"
          ? "💳 Thanh toán SePay"
          : normalizedPaymentMethod === "PAYOS"
            ? "💳 Thanh toán PayOS"
            : `💳 Thanh toán Online (${normalizedPaymentMethod})`;

    const orderAmount =
      order.totalAmount || order.totalAmount_cents || order.amount || 0;

    const safeOrderNumber = order.orderNumber || String(order._id);
    const safeCustomerName = order.customerName || order.fullName || "Chưa xác định";
    const safePhone = order.phoneNumber || "N/A";
    const safeAddress = order.shippingAddress || "Chưa có";

    // Tính thời gian
    const createdAt = new Date(order.createdAt);
    const timeStr = createdAt.toLocaleString("vi-VN");

    // Soạn tin nhắn chi tiết
    const text =
      `📦 🎉 CÓ ĐƠN HÀNG MỚI!\n\n` +
      `🔖 Mã đơn: ${safeOrderNumber}\n` +
      `👤 Khách hàng: ${safeCustomerName}\n` +
      `📱 Số điện thoại: ${safePhone}\n` +
      `📍 Địa chỉ: ${safeAddress}\n` +
      `💰 Tổng tiền: ${formatPrice(orderAmount)}đ\n` +
      `💳 Phương thức: ${paymentText}\n` +
      `📅 Thời gian: ${timeStr}\n` +
      `⏳ Trạng thái: Chờ duyệt`;

    // Nút bấm inline
    const clientUrl = process.env.CLIENT_URL?.trim();
    const dashboardUrl =
      clientUrl && clientUrl.startsWith("https://")
        ? `${clientUrl.replace(/\/$/, "")}/admin/orders/${order._id}`
        : null;

    const actionRow = [
      { text: "📋 Chi tiết", callback_data: `detail_${order._id}` },
    ];

    if (dashboardUrl) {
      actionRow.push({ text: "📊 Dashboard", url: dashboardUrl });
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Duyệt đơn hàng", callback_data: `approve_${order._id}` },
          { text: "❌ Từ chối", callback_data: `reject_${order._id}` },
        ],
        actionRow,
      ],
    };

    const sent = await sendTelegramMessage(CHAT_ID, text, {
      reply_markup: JSON.stringify(keyboard),
    });

    if (!sent) {
      console.warn(
        `⚠️ Telegram notification failed for order ${order.orderNumber}`,
      );
      return;
    }

    console.log(`✅ Gửi thông báo đơn ${order.orderNumber} tới Telegram`);
  } catch (error) {
    console.error("❌ Lỗi gửi tin nhắn Telegram:", error.message);
  }
};

// ─────────────────────────────────────────────
// ✅ EXPORT: Thông báo thanh toán thành công
// ─────────────────────────────────────────────
export const notifyPaymentSuccess = async (order) => {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) return;

    const formatPrice = (price) =>
      new Intl.NumberFormat("vi-VN").format(price || 0);

    const orderAmount =
      order.totalAmount || order.totalAmount_cents || order.amount || 0;

    const safeOrderNumber = order.orderNumber || String(order._id);
    const safePhone = order.phoneNumber || "N/A";
    const safeAddress = order.shippingAddress || "Chưa có";

    const text =
      `✅ THANH TOÁN THÀNH CÔNG!\n\n` +
      `🔖 Mã đơn: ${safeOrderNumber}\n` +
      `💰 Số tiền: ${formatPrice(orderAmount)}đ\n` +
      `📱 ${safePhone}\n` +
      `📍 ${safeAddress}\n\n` +
      `⏳ Trạng thái: Đã xác nhận - Chuẩn bị giao hàng`;

    await sendTelegramMessage(CHAT_ID, text);

    console.log(
      `✅ Thông báo thanh toán thành công cho đơn ${order.orderNumber}`,
    );
  } catch (error) {
    console.error("❌ Lỗi thông báo thanh toán:", error.message);
  }
};

// ─────────────────────────────────────────────
// WEBHOOK: Telegram
// ─────────────────────────────────────────────
export const handleTelegramWebhook = async (req, res) => {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    // 1️⃣ XỬ LÝ NÚT BẤM (callback_query)
    if (req.body.callback_query) {
      const callbackQuery = req.body.callback_query;
      const { data, message, from } = callbackQuery;
      const chatId = message.chat.id;
      const messageId = message.message_id;
      const userId = from.id;

      console.log(`👆 Nút bấm: ${data} từ ${from.first_name}`);

      // ── FIX HIỆU NĂNG: ack ngay lập tức (không text/alert) để Telegram
      // tắt icon loading trên nút NGAY, không cần chờ xử lý DB xong.
      // Đây là nguyên nhân chính gây cảm giác "nút chậm".
      const ackPromise = axios
        .post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          callback_query_id: callbackQuery.id,
        })
        .catch((err) => console.error("⚠️ Lỗi ack callback:", err.message));

      // ✅ DUYỆT ĐƠN HÀNG
      if (data.startsWith("approve_")) {
        const orderId = data.split("_")[1];

        if (!mongoose.isValidObjectId(orderId)) {
          await ackPromise;
          await sendTelegramMessage(chatId, "⚠️ Mã đơn không hợp lệ.");
          return res.status(200).send("OK");
        }

        try {
          const order = await Order.findByIdAndUpdate(
            orderId,
            { status: "confirmed", approvedBy: userId, approvedAt: new Date() },
            { new: true },
          );

          if (order) {
            // ── FIX: chạy 2 lệnh độc lập SONG SONG thay vì tuần tự
            // → giảm gần một nửa thời gian phản hồi
            await Promise.all([
              ackPromise,
              axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
                {
                  chat_id: chatId,
                  message_id: messageId,
                  text:
                    message.text +
                    "\n\n✅ <b>ĐÃ DUYỆT!</b> (Duyệt bởi: " +
                    escapeTelegramHtml(from.first_name) +
                    ")",
                  parse_mode: "HTML",
                },
              ),
              sendTelegramMessage(
                chatId,
                `✔️ Đơn <code>${order.orderNumber}</code> đã được duyệt!\n` +
                  `Trạng thái: <b>Chuẩn bị giao hàng</b>`,
                { parse_mode: "HTML" },
              ),
            ]);

            console.log(`✅ Đơn hàng ${order.orderNumber} đã được duyệt`);
          } else {
            await ackPromise;
          }
        } catch (err) {
          console.error("❌ Lỗi duyệt đơn:", err.message);
          await ackPromise;
          await sendTelegramMessage(chatId, "❌ Lỗi duyệt đơn hàng");
        }
      }

      // ❌ TỪ CHỐI ĐƠN HÀNG
      else if (data.startsWith("reject_")) {
        const orderId = data.split("_")[1];

        if (!mongoose.isValidObjectId(orderId)) {
          await ackPromise;
          await sendTelegramMessage(chatId, "⚠️ Mã đơn không hợp lệ.");
          return res.status(200).send("OK");
        }

        try {
          const order = await Order.findByIdAndUpdate(
            orderId,
            {
              status: "cancelled",
              cancelReason: "Bị từ chối qua Telegram",
              cancelledBy: userId,
            },
            { new: true },
          );

          if (order) {
            await Promise.all([
              ackPromise,
              axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
                {
                  chat_id: chatId,
                  message_id: messageId,
                  text:
                    message.text +
                    "\n\n❌ <b>ĐÃ TỪ CHỐI!</b> (Từ chối bởi: " +
                    escapeTelegramHtml(from.first_name) +
                    ")",
                  parse_mode: "HTML",
                },
              ),
              sendTelegramMessage(
                chatId,
                `❌ Đơn <code>${order.orderNumber}</code> đã bị từ chối!`,
                { parse_mode: "HTML" },
              ),
            ]);

            console.log(`❌ Đơn hàng ${order.orderNumber} đã bị từ chối`);
          } else {
            await ackPromise;
          }
        } catch (err) {
          console.error("❌ Lỗi từ chối đơn:", err.message);
          await ackPromise;
        }
      }

      // 📋 XEM CHI TIẾT ĐƠN HÀNG
      // ── FIX GỐC: show_alert giới hạn ~200 ký tự → text dài bị Telegram từ chối
      // (lỗi 400, im lặng). Đổi sang gửi MESSAGE thường (không giới hạn ký tự
      // như alert), kèm thông tin biến thể sản phẩm đã mua.
      else if (data.startsWith("detail_")) {
        const orderId = data.split("_")[1];
        await ackPromise; // tắt loading ngay, không chờ query DB

        if (!mongoose.isValidObjectId(orderId)) {
          await sendTelegramMessage(chatId, "⚠️ Mã đơn không hợp lệ.");
          return res.status(200).send("OK");
        }

        try {
          const order = await Order.findById(orderId);

          if (!order) {
            await sendTelegramMessage(chatId, "⚠️ Không tìm thấy đơn hàng.");
            return res.status(200).send("OK");
          }

          const formatPrice = (price) =>
            new Intl.NumberFormat("vi-VN").format(price || 0);

          // NEW: hiển thị kèm biến thể (variantName/sku) đã snapshot trong order
          const itemsText = (order.items || [])
            .map((it) => {
              const variantPart = it.variantName
                ? ` (${escapeTelegramHtml(it.variantName)})`
                : "";
              return (
                `   • ${escapeTelegramHtml(it.name)}${variantPart} ` +
                `x${it.quantity} — ${formatPrice(it.price_cents * it.quantity)}đ`
              );
            })
            .join("\n");

          const detailText =
            `📦 <b>CHI TIẾT ĐƠN HÀNG</b>\n\n` +
            `🔖 Mã: <code>${escapeTelegramHtml(order.orderNumber)}</code>\n` +
            `👤 KH: ${escapeTelegramHtml(order.customerName || order.fullName || "Chưa xác định")}\n` +
            `📱 SĐT: <code>${escapeTelegramHtml(order.phoneNumber || "N/A")}</code>\n` +
            `📍 ĐC: ${escapeTelegramHtml(order.shippingAddress || "Chưa có")}\n` +
            (itemsText ? `\n🛍 <b>Sản phẩm:</b>\n${itemsText}\n` : "") +
            `\n💰 Tổng: <b>${formatPrice(order.totalAmount || order.totalAmount_cents || 0)}đ</b>\n` +
            `💳 TT: ${escapeTelegramHtml(order.paymentMethod || "COD")}\n` +
            `⏳ Trạng thái: ${escapeTelegramHtml(order.status || "Chờ xử lý")}\n` +
            `📅 ${new Date(order.createdAt).toLocaleString("vi-VN")}`;

          await sendTelegramMessage(chatId, detailText, { parse_mode: "HTML" });
        } catch (err) {
          console.error("❌ Lỗi lấy chi tiết:", err.message);
          await sendTelegramMessage(chatId, "❌ Lỗi lấy chi tiết đơn hàng");
        }
      } else {
        await ackPromise;
      }

      return res.status(200).send("OK");
    }

    // 2️⃣ XỬ LÝ TIN NHẮN TEXT — GIỮ NGUYÊN 100%, không đổi gì
    if (req.body.message?.text) {
      const chatId = req.body.message.chat.id;
      const userText = req.body.message.text.trim();
      const firstName = req.body.message.from?.first_name || "User";
      const userId = req.body.message.from?.id;

      console.log(`💬 Tin nhắn từ ${firstName}: ${userText}`);

      if (userText === "/start") {
        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
          {
            chat_id: chatId,
            text:
              `👋 <b>Chào ${firstName}!</b>\n\n` +
              `Tôi là bot quản lý đơn hàng của BaoPo Card Store 🎁\n\n` +
              `🔑 <b>Mã CHAT_ID của bạn:</b> <code>${chatId}</code>\n` +
              `🔑 <b>Mã USER_ID của bạn:</b> <code>${userId}</code>\n\n` +
              `Hãy copy và lưu vào file .env nhé!`,
            parse_mode: "HTML",
          },
        );
      } else if (userText === "/stats") {
        try {
          const totalOrders = await Order.countDocuments();
          const pendingOrders = await Order.countDocuments({
            status: "pending",
          });
          const confirmedOrders = await Order.countDocuments({
            status: "confirmed",
          });
          const paidOrders = await Order.countDocuments({
            paymentStatus: "paid",
          });

          const statsText =
            `📊 <b>THỐNG KÊ HỆ THỐNG</b>\n\n` +
            `📦 Tổng đơn hàng: <b>${totalOrders}</b>\n` +
            `⏳ Chờ duyệt: <b>${pendingOrders}</b>\n` +
            `✅ Đã xác nhận: <b>${confirmedOrders}</b>\n` +
            `💳 Đã thanh toán: <b>${paidOrders}</b>`;

          await sendTelegramMessage(chatId, statsText, { parse_mode: "HTML" });
        } catch (err) {
          console.error("❌ Lỗi lấy stats:", err.message);
          await sendTelegramMessage(chatId, "❌ Lỗi lấy thống kê");
        }
      } else if (userText === "/pending") {
        try {
          const pendingOrders = await Order.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .limit(10);

          if (pendingOrders.length === 0) {
            await sendTelegramMessage(chatId, "✅ Không có đơn nào chờ duyệt!");
            return res.status(200).send("OK");
          }

          let text = `⏳ <b>DANH SÁCH CHỜ DUYỆT</b> (${pendingOrders.length} đơn)\n\n`;

          pendingOrders.forEach((order, index) => {
            const price = new Intl.NumberFormat("vi-VN").format(
              order.totalAmount || 0,
            );
            text +=
              `${index + 1}. <b>${order.orderNumber}</b> - ${price}đ\n` +
              `   📱 ${order.phoneNumber}\n\n`;
          });

          if (text.length > 4000) {
            const chunks = text.match(/[\s\S]{1,4000}/g) || [];
            for (const chunk of chunks) {
              await sendTelegramMessage(chatId, chunk, { parse_mode: "HTML" });
            }
          } else {
            await sendTelegramMessage(chatId, text, { parse_mode: "HTML" });
          }
        } catch (err) {
          console.error("❌ Lỗi lấy danh sách:", err.message);
          await sendTelegramMessage(chatId, "❌ Lỗi lấy danh sách");
        }
      } else if (userText === "/help") {
        const helpText =
          `📖 <b>HƯỚNG DẪN LỆNH</b>\n\n` +
          `/start - Lấy mã Chat ID\n` +
          `/stats - Xem thống kê\n` +
          `/pending - Danh sách chờ duyệt\n` +
          `/help - Hiển thị trợ giúp\n\n` +
          `💡 Nhấn nút trên tin nhắn đơn hàng để duyệt hoặc xem chi tiết!`;

        await sendTelegramMessage(chatId, helpText, { parse_mode: "HTML" });
      } else {
        const responseText =
          `❓ Lệnh không hợp lệ!\n\n` + `Gõ /help để xem danh sách lệnh`;
        await sendTelegramMessage(chatId, responseText, { parse_mode: "HTML" });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Telegram Webhook Error:", error);
    res.status(500).send("Error");
  }
};

// ─────────────────────────────────────────────
// WEBHOOK: SePay
// ─────────────────────────────────────────────
export const handleSepayWebhook = async (req, res) => {
  try {
    console.log("🔴 [SePay Webhook] Nhận request:", {
      method: req.method,
      body: req.body,
    });

    const { content, transferAmount, id } = req.body || {};

    // Test endpoint — SePay bấm "Kiểm tra endpoint"
    if (!content && !id) {
      return res.status(200).json({
        success: true,
        message: "SePay Webhook endpoint is working successfully!",
      });
    }

    console.log(
      `[SePay] Phát hiện biến động: ${content} - Số tiền: ${transferAmount}đ`,
    );

    // Bóc tách mã đơn hàng từ nội dung chuyển khoản (VD: "ORD-177872555")
    const match = content.match(/ORD[-_]?\d+/i);

    if (!match) {
      return res.status(200).json({
        success: false,
        message: "Nội dung chuyển khoản không chứa mã đơn hàng hợp lệ",
      });
    }

    const orderCodeRaw = match[0].toUpperCase(); // VD: "ORD177872555" hoặc "ORD-177872555"

    // Tìm đơn hàng — dùng $regex phòng trường hợp lưu lệch dấu gạch ngang
    const order = await Order.findOne({
      orderNumber: {
        $regex: orderCodeRaw.replace("ORD", "ORD-?"),
        $options: "i",
      },
    });

    if (!order) {
      return res.status(200).json({
        // Trả 200 để SePay không retry liên tục
        success: false,
        message: `Không tìm thấy đơn hàng ${orderCodeRaw} trong hệ thống`,
      });
    }

    // Bỏ qua nếu đơn đã thanh toán trước đó
    if (order.paymentStatus === "paid") {
      return res
        .status(200)
        .json({ success: true, message: "Order already paid" });
    }

    // Cập nhật trạng thái thanh toán
    order.paymentStatus = "paid";
    order.status = "confirmed";

    if (order.statusHistory) {
      order.statusHistory.push({
        status: "confirmed",
        note: `Thanh toán tự động qua SePay thành công - Nhận ${transferAmount || 0}đ`,
        changedAt: new Date(),
      });
    }

    await order.save();
    console.log(
      `✅ Đơn hàng ${order.orderNumber} đã được cập nhật ĐÃ THANH TOÁN!`,
    );

    // 🔔 Gửi thông báo Telegram khi thanh toán thành công
    await notifyPaymentSuccess(order);

    res.status(200).json({ success: true, message: "Processed successfully" });
  } catch (error) {
    console.error("❌ SePay Webhook Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
