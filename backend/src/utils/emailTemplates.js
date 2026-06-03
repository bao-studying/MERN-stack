export const orderConfirmationTemplate = (order, userName) => {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                ${item.name} <br/>
                <span style="font-size: 12px; color: #777;">x${item.quantity}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                ${(item.price_cents * item.quantity).toLocaleString()} đ
            </td>
        </tr>
    `,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #18eb14; text-align: center;">Cảm ơn bạn đã đặt hàng!</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Đơn hàng <strong>#${order.orderNumber}</strong> của bạn đã được tiếp nhận và đang xử lý.</p>
        
        <h3 style="border-bottom: 2px solid #ee0d0d; padding-bottom: 5px;">Chi tiết đơn hàng</h3>
        <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
                <td style="padding: 10px; font-weight: bold;">Tổng cộng</td>
                <td style="padding: 10px; font-weight: bold; text-align: right; color: #2e7d32; font-size: 18px;">
                    ${order.totalAmount_cents.toLocaleString()} đ
                </td>
            </tr>
        </table>

        <div style="margin-top: 20px; background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="margin: 0;"><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress}</p>
            <p style="margin: 5px 0 0;"><strong>SĐT:</strong> ${order.phoneNumber}</p>
            <p style="margin: 5px 0 0;"><strong>Thanh toán:</strong> ${order.paymentMethod === "cod" ? "Tiền mặt khi nhận hàng (COD)" : order.paymentMethod}</p>
        </div>

        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
            Nếu có thắc mắc, vui lòng liên hệ hotline: 1900 xxxx.<br/>
            
        </p>
    </div>
    `;
};
    export const confirmedStatusTemplate = (order, userName) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
  <h2 style="color:#7c3aed;text-align:center;">✅ Đơn hàng đã được xác nhận!</h2>
  <p>Xin chào <strong>${userName}</strong>,</p>
  <p>Đơn hàng <strong>#${order.orderNumber}</strong> đã được xác nhận và đang được chuẩn bị.</p>
  <p><strong>Địa chỉ:</strong> ${order.shippingAddress}</p>
</div>`;

    export const shippingStatusTemplate = (order, userName) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
  <h2 style="color:#1d4ed8;text-align:center;">🚚 Đơn hàng đang trên đường giao!</h2>
  <p>Xin chào <strong>${userName}</strong>,</p>
  <p>Đơn hàng <strong>#${order.orderNumber}</strong> đã được bàn giao cho đơn vị vận chuyển.</p>
  <p><strong>Địa chỉ:</strong> ${order.shippingAddress}</p>
</div>`;

    export const completedStatusTemplate = (order, userName) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
  <h2 style="color:#15803d;text-align:center;">🎉 Đơn hàng đã giao thành công!</h2>
  <p>Xin chào <strong>${userName}</strong>,</p>
  <p>Đơn hàng <strong>#${order.orderNumber}</strong> đã được giao. Cảm ơn bạn đã mua sắm!</p>
</div>`;

    export const cancelledStatusTemplate = (order, userName) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
  <h2 style="color:#dc2626;text-align:center;">❌ Đơn hàng đã bị hủy</h2>
  <p>Xin chào <strong>${userName}</strong>,</p>
  <p>Đơn hàng <strong>#${order.orderNumber}</strong> đã bị hủy. Nếu đã thanh toán, tiền hoàn lại trong 3-5 ngày.</p>
</div>`;

