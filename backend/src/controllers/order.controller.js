import {
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  getAllOrdersService,
  updateOrderStatusService,
} from "../services/order.service.js";

// ✅ Import hàm từ payment.controller.js - KHÔNG định nghĩa lại!
import { sendOrderToTelegram } from "../controllers/payment.controller.js";

import payos from "../config/payos.js";
import Order from "../models/order.js";
import axios from "axios";

// ────────────────────────────────────────────────────────────
// CREATE ORDER - Tạo đơn hàng
// ────────────────────────────────────────────────────────────
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { paymentMethod = "COD", totalAmount_cents } = req.body;

    // Tạo đơn hàng qua service
    const order = await createOrderService(userId, req.body);

    // ✅ Gửi thông báo Telegram ngay sau khi tạo đơn
    await sendOrderToTelegram(order, paymentMethod);

    // Nếu là COD hoặc SePay thì trả kết quả ngay
    if (paymentMethod !== "payos") {
      const message =
        paymentMethod === "sepay"
          ? "Đặt hàng SePay thành công. Vui lòng quét mã QR để thanh toán."
          : "Đặt hàng thành công (COD)";

      return res.status(201).json({
        success: true,
        message,
        data: order,
      });
    }

    // Xử lý PayOS
    const payOSCode = Number(
      String(Date.now()).slice(-6) + Math.floor(100 + Math.random() * 900),
    );

    const paymentData = {
      orderCode: payOSCode,
      amount: totalAmount_cents,
      description: `Thanh toan don ${order.orderNumber}`.substring(0, 25),
      cancelUrl: `${process.env.CLIENT_URL}/payment-cancel`,
      returnUrl: `${process.env.CLIENT_URL}/payment-success`,
    };

    const paymentLinkData = await payos.createPaymentLink(paymentData);

    // Cập nhật payOSOrderCode
    await Order.findByIdAndUpdate(order._id, {
      payOSOrderCode: payOSCode,
      paymentMethod: "payos",
    });

    res.status(201).json({
      success: true,
      message: "Khởi tạo thanh toán PayOS thành công",
      checkoutUrl: paymentLinkData.checkoutUrl,
      orderCode: payOSCode,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────
// GET MY ORDERS - Lấy đơn hàng của user
// ────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orders = await getMyOrdersService(userId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────
// GET ORDER BY ID - Lấy chi tiết 1 đơn hàng
// ────────────────────────────────────────────────────────────
export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const order = await getOrderByIdService(userId, id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────
// GET ALL ORDERS - Admin: Lấy tất cả đơn hàng
// ────────────────────────────────────────────────────────────
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await getAllOrdersService(req.query);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS - Admin: Cập nhật trạng thái đơn hàng
// ────────────────────────────────────────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatusService(id, status);

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
