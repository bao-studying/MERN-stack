/**
 * EMAIL TEMPLATES SERVICE
 * Định nghĩa tất cả email templates
 * Không lưu DB - hardcode trong code
 */

// ============================================
// 1. ORDER CONFIRMATION TEMPLATE
// ============================================
export const orderConfirmationTemplate = (order, userName) => {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #e2ded6;">
            <td style="padding: 12px 0; font-size: 14px;">
                <strong>${item.name}</strong><br/>
                <span style="font-size: 12px; color: #78716c;">Số lượng: ${item.quantity}</span>
            </td>
            <td style="padding: 12px 0; text-align: right; font-family: 'DM Mono', monospace; font-weight: 500; color: #15803d;">
                ${((item.price_cents || 0) * item.quantity).toLocaleString()} đ
            </td>
        </tr>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f3ef; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 0.5px solid #e2ded6; }
            .header { background: linear-gradient(135deg, #c8490c 0%, #b45309 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; }
            .content { padding: 32px 24px; }
            .greeting { font-size: 16px; color: #1c1917; margin: 0 0 16px; }
            .order-number { background: #fef3c7; border-left: 4px solid #b45309; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; }
            .order-number strong { color: #b45309; }
            .section-title { font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: #78716c; margin: 24px 0 16px; border-bottom: 2px solid #e2ded6; padding-bottom: 8px; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table td { padding: 12px 0; border-bottom: 1px solid #e2ded6; }
            .total-row { font-weight: 600; font-size: 18px; color: #15803d; font-family: 'DM Mono', monospace; }
            .info-box { background: #f9f9f7; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #c8490c; }
            .info-box p { margin: 8px 0; font-size: 14px; color: #1c1917; }
            .info-box strong { color: #78716c; }
            .footer { background: #f5f3ef; padding: 20px 24px; text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #e2ded6; }
            .cta-button { display: inline-block; background: #c8490c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ Đơn hàng đã xác nhận</h1>
            </div>
            <div class="content">
                <p class="greeting">Xin chào <strong>${userName}</strong>,</p>
                <p style="color: #78716c; font-size: 15px; line-height: 1.6;">
                    Cảm ơn bạn đã đặt hàng! Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý ngay lập tức.
                </p>
                
                <div class="order-number">
                    Mã đơn hàng: <strong>#${order.orderNumber}</strong>
                </div>

                <div class="section-title">Chi tiết đơn hàng</div>
                <table class="items-table">
                    ${itemsHtml}
                    <tr style="border: none;">
                        <td style="padding-top: 16px; border: none;"><strong>Tổng cộng</strong></td>
                        <td style="padding-top: 16px; border: none; text-align: right;" class="total-row">${order.totalAmount_cents.toLocaleString()} đ</td>
                    </tr>
                </table>

                <div class="info-box">
                    <p><strong>🏠 Địa chỉ giao hàng:</strong><br/>${order.shippingAddress}</p>
                    <p style="margin-top: 12px;"><strong>📞 SĐT:</strong> ${order.phoneNumber}</p>
                    <p style="margin-top: 12px;"><strong>💳 Thanh toán:</strong> ${order.paymentMethod === "cod" ? "Tiền mặt khi nhận hàng (COD)" : order.paymentMethod}</p>
                </div>

                <p style="color: #78716c; font-size: 14px; text-align: center; margin-top: 24px;">
                    Đơn hàng sẽ được xử lý trong 24 giờ.<br/>
                    <a href="https://ecostore.com/track" class="cta-button">Theo dõi đơn hàng</a>
                </p>
            </div>
            <div class="footer">
                <p style="margin: 0;">📧 Nếu có thắc mắc, vui lòng liên hệ: support@ecostore.com</p>
                <p style="margin: 8px 0 0;">© 2024 BAO Po_Box - Pokémon TCG Store</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// 2. SHIPPING CONFIRMATION TEMPLATE
// ============================================
export const shippingTemplate = (order, userName, trackingCode) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f3ef; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 0.5px solid #e2ded6; }
            .header { background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .tracking-box { background: #dbeafe; border-left: 4px solid #1d4ed8; padding: 16px; border-radius: 8px; margin: 20px 0; }
            .tracking-code { font-family: 'DM Mono', monospace; font-size: 20px; font-weight: 600; color: #1d4ed8; }
            .footer { background: #f5f3ef; padding: 20px 24px; text-align: center; font-size: 12px; color: #a8a29e; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📦 Đơn hàng đang trên đường</h1>
            </div>
            <div class="content">
                <p>Chào ${userName},</p>
                <p style="color: #78716c; font-size: 15px;">Đơn hàng <strong>#${order.orderNumber}</strong> của bạn đã được gửi đi!</p>
                
                <div class="tracking-box">
                    <p style="margin: 0 0 8px; color: #78716c; font-size: 12px;">Mã vận chuyển:</p>
                    <div class="tracking-code">${trackingCode || "N/A"}</div>
                    <p style="margin: 8px 0 0; font-size: 13px;"><a href="https://ecostore.com/track/${trackingCode}" style="color: #1d4ed8; text-decoration: none; font-weight: 500;">Theo dõi gói hàng →</a></p>
                </div>

                <p style="color: #78716c; font-size: 14px; line-height: 1.6;">
                    Gói hàng sẽ đến tay bạn trong <strong>3-5 ngày làm việc</strong>. Vui lòng chuẩn bị để nhận hàng.
                </p>
            </div>
            <div class="footer">
                <p style="margin: 0;">support@ecostore.com | 1900 xxxx</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// 3. REVIEW REQUEST TEMPLATE
// ============================================
export const reviewTemplate = (order, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f3ef; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 0.5px solid #e2ded6; }
            .header { background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .stars { font-size: 32px; text-align: center; margin: 20px 0; letter-spacing: 8px; }
            .cta-button { display: block; background: #15803d; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; margin: 24px 0; }
            .footer { background: #f5f3ef; padding: 20px 24px; text-align: center; font-size: 12px; color: #a8a29e; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⭐ Bạn đã thích sản phẩm không?</h1>
            </div>
            <div class="content">
                <p>Chào ${userName},</p>
                <p style="color: #78716c; font-size: 15px;">Cảm ơn bạn đã mua hàng từ BAO Po_Box! Chúng tôi rất muốn biết bạn nghĩ gì về đơn hàng <strong>#${order.orderNumber}</strong>.</p>
                
                <div class="stars">☆ ☆ ☆ ☆ ☆</div>
                
                <p style="color: #78716c; font-size: 14px; text-align: center; line-height: 1.6;">
                    Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ<br/>và giúp những khách hàng khác lựa chọn sản phẩm tốt nhất.
                </p>

                <a href="https://ecostore.com/review/${order.orderNumber}" class="cta-button">Viết đánh giá</a>
            </div>
            <div class="footer">
                <p style="margin: 0;">Cảm ơn vì sự ủng hộ! 💚</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// 4. CONTACT REPLY TEMPLATE (Auto-reply)
// ============================================
export const contactReplyTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f3ef; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 0.5px solid #e2ded6; }
            .header { background: linear-gradient(135deg, #c8490c 0%, #b45309 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .footer { background: #f5f3ef; padding: 20px 24px; text-align: center; font-size: 12px; color: #a8a29e; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📨 Chúng tôi đã nhận được tin nhắn của bạn</h1>
            </div>
            <div class="content">
                <p>Chào ${userName},</p>
                <p style="color: #78716c; font-size: 15px; line-height: 1.6;">
                    Cảm ơn bạn đã liên hệ với BAO Po_Box! Chúng tôi đã nhận được tin nhắn của bạn và sẽ trả lời sớm nhất có thể (thường trong vòng 24 giờ).
                </p>
                <p style="color: #78716c; font-size: 15px; line-height: 1.6;">
                    Nếu bạn có vấn đề gấp, vui lòng gọi hotline <strong>1900 xxxx</strong>.
                </p>
            </div>
            <div class="footer">
                <p style="margin: 0;">📧 support@ecostore.com | 1900 xxxx</p>
                <p style="margin: 8px 0 0;">© 2024 BAO Po_Box</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// 5. WELCOME EMAIL TEMPLATE
// ============================================
export const welcomeTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f3ef; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 0.5px solid #e2ded6; }
            .header { background: linear-gradient(135deg, #c8490c 0%, #b45309 100%); padding: 48px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px; }
            .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 32px 24px; }
            .features { display: grid; gap: 16px; margin: 24px 0; }
            .feature { background: #f9f9f7; padding: 16px; border-radius: 8px; border-left: 4px solid #c8490c; }
            .feature strong { color: #1c1917; }
            .cta-button { display: block; background: #c8490c; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; margin: 24px 0; }
            .footer { background: #f5f3ef; padding: 20px 24px; text-align: center; font-size: 12px; color: #a8a29e; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Chào mừng đến BAO Po_Box!</h1>
                <p>Nơi tập hợp những bộ thẻ Pokémon tuyệt vời nhất</p>
            </div>
            <div class="content">
                <p>Chào ${userName},</p>
                <p style="color: #78716c; font-size: 15px; line-height: 1.6;">
                    Cảm ơn bạn đã tham gia cộng đồng BAO Po_Box! Bạn vừa mở khóa một thế giới đầy những bộ sưu tập Pokemon hiếm và quý giá.
                </p>

                <div class="features">
                    <div class="feature">
                        <strong>⚡ Ưu đãi độc quyền</strong><br/>
                        <span style="color: #78716c; font-size: 13px;">Thành viên mới nhận giảm 10% cho đơn hàng đầu tiên</span>
                    </div>
                    <div class="feature">
                        <strong>📦 Giao hàng nhanh</strong><br/>
                        <span style="color: #78716c; font-size: 13px;">Vận chuyển miễn phí cho đơn trên 500k</span>
                    </div>
                    <div class="feature">
                        <strong>🏆 Chương trình loyalty</strong><br/>
                        <span style="color: #78716c; font-size: 13px;">Tích điểm mỗi lần mua, đổi quà lý tưởng</span>
                    </div>
                </div>

                <a href="https://ecostore.com/shop" class="cta-button">Khám phá bộ sưu tập</a>
            </div>
            <div class="footer">
                <p style="margin: 0;">support@ecostore.com | 1900 xxxx</p>
                <p style="margin: 8px 0 0;">© 2024 BAO Po_Box - Pokémon TCG Store</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// TEMPLATE REGISTRY
// ============================================
export const emailTemplateRegistry = {
  order_confirmation: {
    id: "order_confirmation",
    name: "Xác nhận đơn hàng",
    description: "Gửi khi khách đặt hàng thành công",
    category: "Order",
    template: orderConfirmationTemplate,
    variables: ["order", "userName"],
  },
  shipping: {
    id: "shipping",
    name: "Thông báo giao hàng",
    description: "Gửi khi đơn hàng được ship",
    category: "Shipping",
    template: shippingTemplate,
    variables: ["order", "userName", "trackingCode"],
  },
  review: {
    id: "review",
    name: "Yêu cầu đánh giá",
    description: "Gửi sau 5 ngày để yêu cầu review",
    category: "Review",
    template: reviewTemplate,
    variables: ["order", "userName"],
  },
  contact_reply: {
    id: "contact_reply",
    name: "Xác nhận tiếp nhận liên hệ",
    description: "Auto-reply cho form liên hệ",
    category: "Contact",
    template: contactReplyTemplate,
    variables: ["userName"],
  },
  welcome: {
    id: "welcome",
    name: "Email chào mừng",
    description: "Gửi khi khách đăng ký tài khoản",
    category: "Welcome",
    template: welcomeTemplate,
    variables: ["userName"],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const getTemplateById = (id) => emailTemplateRegistry[id];

export const getAllTemplates = () =>
  Object.values(emailTemplateRegistry).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    variables: t.variables,
  }));

export const getTemplateHTML = (templateId, variables = {}) => {
  const templateConfig = emailTemplateRegistry[templateId];
  if (!templateConfig) {
    throw new Error(`Template ${templateId} not found`);
  }
  return templateConfig.template(
    variables.data1,
    variables.data2,
    variables.data3,
  );
};
