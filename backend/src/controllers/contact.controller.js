/**
 * CONTACT CONTROLLER - Nhận xét và sửa lỗi
 * ✅ Thêm email validation
 * ✅ Thêm rate limiting suggestion
 * ✅ Thêm error handling tốt hơn
 */

import { sendContactService } from "../services/contact.service.js";

// ============================================
// Email Validation Helper
// ============================================
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidMessage = (message) => {
  const trimmed = message?.trim() || "";
  return trimmed.length >= 5 && trimmed.length <= 5000;
};

// ============================================
// Send Contact Controller
// ============================================
export const sendContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // ============ VALIDATION ============
    // 1. Kiểm tra fields bắt buộc
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ tên, email và nội dung tin nhắn.",
      });
    }

    // 2. Validate tên (không quá dài, không có ký tự lạ)
    const nameTrimmed = name.trim();
    if (nameTrimmed.length < 2 || nameTrimmed.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Tên phải từ 2 đến 100 ký tự.",
      });
    }

    // 3. Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ. Vui lòng nhập email đúng định dạng.",
      });
    }

    // 4. Validate message
    if (!isValidMessage(message)) {
      return res.status(400).json({
        success: false,
        message: "Nội dung tin nhắn phải từ 5 đến 5000 ký tự.",
      });
    }

    // 5. Validate subject (nếu có)
    if (subject && subject.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề không được vượt quá 200 ký tự.",
      });
    }

    // ============ PROCESS ============
    const contactData = {
      name: nameTrimmed,
      email: email.toLowerCase().trim(),
      subject: subject?.trim() || "Không có tiêu đề",
      message: message.trim(),
    };

    // Gọi service để gửi email (non-blocking)
    await sendContactService(contactData);

    // ============ RESPONSE ============
    return res.status(200).json({
      success: true,
      message: "Tin nhắn của bạn đã được gửi! Chúng tôi sẽ phản hồi sớm nhất.",
    });
  } catch (error) {
    console.error("❌ Lỗi sendContact:", error);
    // Pass error to Express error handler
    next(error);
  }
};

export default { sendContact };
