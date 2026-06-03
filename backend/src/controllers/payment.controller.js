import Order from "../models/order.js";

// Webhook SePay chuẩn cấu trúc API thực tế
export const handleSepayWebhook = async (req, res) => {
  try {
    console.log("🔴 [SePay Webhook] Nhận request:", {
      method: req.method,
      body: req.body,
    });

    // 1. Cấu trúc chuẩn của SePay truyền về
    const { content, transferAmount, id } = req.body || {};

    // === TEST ENDPOINT (Dùng khi SePay bấm nút "Kiểm tra endpoint") ===
    if (!content && !id) {
      return res.status(200).json({
        success: true,
        message: "SePay Webhook endpoint is working successfully!",
      });
    }

    console.log(
      `[SePay] Phát hiện biến động: ${content} - Số tiền: ${transferAmount}đ`,
    );

    // 2. Dùng Regex bóc tách mã đơn hàng nằm trong nội dung chuyển khoản
    // Ví dụ khách chuyển khoản ghi: "Thanh toan don hang ORD-177872555" -> tìm ra "ORD-177872555"
    // Regex này tìm chữ ORD kèm theo các số và ký tự gạch sau nó
    const match = content.match(/ORD[-_]?\d+/i);

    if (!match) {
      return res.status(200).json({
        success: false,
        message: "Nội dung chuyển khoản không chứa mã đơn hàng hợp lệ",
      });
    }

    const orderCodeRaw = match[0].toUpperCase(); // VD: "ORD177872555" hoặc "ORD-177872555"

    // 3. Tìm đơn hàng trong Database
    // Dùng $regex để tìm kiếm tương đối đề phòng chuỗi lưu trong DB lệch dấu gạch ngang (-)
    const order = await Order.findOne({
      orderNumber: {
        $regex: orderCodeRaw.replace("ORD", "ORD-?"),
        $options: "i",
      },
    });

    if (!order) {
      return res.status(200).json({
        // Trả về 200 để SePay không bắn lại liên tục nữa
        success: false,
        message: `Không tìm thấy đơn hàng ${orderCodeRaw} trong hệ thống`,
      });
    }

    // Nếu đơn hàng đã trả tiền từ trước rồi thì bỏ qua
    if (order.paymentStatus === "paid") {
      return res
        .status(200)
        .json({ success: true, message: "Order already paid" });
    }

    // 4. Xử lý cập nhật khi tiền về tài khoản ngân hàng thành công
    // Thường khi webhook này gọi nghĩa là tiền đã vào tài khoản, trạng thái mặc định là thành công
    order.paymentStatus = "paid";
    order.status = "confirmed";

    // Đẩy lịch sử thay đổi trạng thái nếu Model Order của bạn có trường này
    if (order.statusHistory) {
      order.statusHistory.push({
        status: "confirmed",
        note: `Thanh toán tự động qua SePay thành công - Nhận ${transferAmount || 0}đ`,
        changedAt: new Date(),
      });
    }

    await order.save();
    console.log(
      `✅ Đơn hàng ${order.orderNumber} đã được hệ thống cập nhật ĐÃ THANH TOÁN!`,
    );

    // Trả về response đúng chuẩn để SePay xác nhận hoàn tất log giao dịch
    res.status(200).json({ success: true, message: "Processed successfully" });
  } catch (error) {
    console.error("❌ SePay Webhook Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
