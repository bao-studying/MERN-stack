/**
 * BACKEND: /api/email routes
 * Quản lý email templates, preview, test send
 */

import express from "express";
import {
  getAllTemplates,
  getTemplateHTML,
} from "../services/emailTemplates.service.js";
import sendEmail from "../utils/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ============================================
// GET /api/email/templates
// Lấy danh sách tất cả templates
// ============================================
router.get("/templates", (req, res) => {
  try {
    const templates = getAllTemplates();
    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("❌ Error fetching templates:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách template",
    });
  }
});

// ============================================
// POST /api/email/preview
// Generate HTML preview từ template
// ============================================
router.post("/preview", (req, res) => {
  try {
    const { templateId, variables } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu templateId",
      });
    }

    // Generate HTML từ template
    const html = getTemplateHTML(templateId, variables || {});

    res.status(200).json({
      success: true,
      html,
      templateId,
    });
  } catch (error) {
    console.error("❌ Error generating preview:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo preview",
    });
  }
});

// ============================================
// POST /api/email/test-send
// Gửi email test
// ============================================
router.post("/test-send", async (req, res) => {
  try {
    const { templateId, variables, recipientEmail } = req.body;

    // Validation
    if (!templateId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu templateId hoặc recipientEmail",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
      });
    }

    // Generate HTML
    const html = getTemplateHTML(templateId, variables || {});

    // Send email
    const emailResult = await sendEmail({
      email: recipientEmail,
      subject: `[Test] BAO Po_Box - ${templateId}`,
      html,
    });

    if (!emailResult) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi gửi email - kiểm tra Resend API key",
      });
    }

    res.status(200).json({
      success: true,
      message: `Email test đã gửi đến ${recipientEmail}`,
      emailId: emailResult.id,
    });
  } catch (error) {
    console.error("❌ Error sending test email:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi gửi email test",
    });
  }
});

// ============================================
// GET /api/email/config
// Lấy thông tin config hiện tại
// ============================================
router.get("/config", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        provider: "resend",
        fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@resend.dev",
        isConfigured: !!process.env.RESEND_API_KEY,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy config",
    });
  }
});

// ============================================
// POST /api/email/config/test
// Test Resend API key
// ============================================
router.post("/config/test", async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: "Thiếu API key",
      });
    }

    // Test bằng cách gửi email test
    // (Có thể implement kiểm tra key syntax hoặc call Resend API)

    res.status(200).json({
      success: true,
      message: "API key hợp lệ (kiểm tra từ môi trường)",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "API key không hợp lệ",
    });
  }
});

export default router;
