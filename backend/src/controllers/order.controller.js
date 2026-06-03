import {
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  getAllOrdersService,
  updateOrderStatusService,
} from "../services/order.service.js";

import payos from "../config/payos.js";
import Order from "../models/order.js";

// 1. Client: Tạo đơn & Tích hợp PayOS (Hàm bạn vừa viết)
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { paymentMethod = "COD", totalAmount_cents } = req.body;

    // Tạo đơn hàng trước thông qua service của bạn
    const order = await createOrderService(userId, req.body);

    // Nếu là COD hoặc SePay thì trả kết quả ngay.
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

    // Xử lý cổng PayOS
    const payOSCode = Number(
      String(Date.now()).slice(-6) + Math.floor(100 + Math.random() * 900),
    );

    const paymentData = {
      orderCode: payOSCode,
      amount: totalAmount_cents, // Đảm bảo đơn vị là VND
      description: `Thanh toan don ${order.orderNumber}`.substring(0, 25),
      cancelUrl: `${process.env.CLIENT_URL}/payment-cancel`,
      returnUrl: `${process.env.CLIENT_URL}/payment-success`,
    };

    const paymentLinkData = await payos.createPaymentLink(paymentData);

    // Cập nhật trường payOSOrderCode vào Database đơn hàng
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

// 2. Client: Xem lịch sử (BỔ SUNG LẠI HÀM CŨ CỦA BẠN ĐỂ HẾT LỖI)
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orders = await getMyOrdersService(userId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const order = await getOrderByIdService(userId, id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// 3. Admin: Lấy tất cả (HÀM GÂY RA LỖI SYNTAX TRÊN DO BỊ THIẾU)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await getAllOrdersService(req.query);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// 4. Admin: Cập nhật trạng thái đơn hàng (BỔ SUNG LẠI)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatusService(id, status);
    res.json({ success: true, message: "Update status success", data: order });
  } catch (error) {
    next(error);
  }
};
