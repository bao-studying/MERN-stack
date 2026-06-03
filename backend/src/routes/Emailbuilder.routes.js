/**
 * EMAILBUILDER ROUTES - FIXED
 * ✅ POST /templates → upsert theo type (không tạo duplicate)
 * ✅ PUT /templates/:id → replace blocks hoàn toàn
 * ✅ GET /templates?type=xxx → filter theo type
 */

import express from "express";
import EmailTemplate from "../models/EmailTemplate.js";
import sendEmail from "../utils/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/* ─────────────────────────────────────────────────────────────────────────
   UTILITY: Render HTML from blocks
─────────────────────────────────────────────────────────────────────────── */
const renderEmailHtmlFromBlocks = (blocks) => {
  const blockHtml = blocks
    .map((block) => {
      switch (block.type) {
        case "header":
          return `<h${block.level || 2} style="color:${block.color || "#1c1917"};font-family:Georgia,serif;font-size:${26 - (block.level || 2) * 2}px;margin:16px 0;">${block.content || ""}</h${block.level || 2}>`;
        case "text":
          return `<p style="font-size:14px;line-height:1.7;margin:10px 0;color:#1c1917;">${block.content || ""}</p>`;
        case "image":
          return `<img src="${block.url || "https://via.placeholder.com/560x160"}" style="width:100%;border-radius:8px;margin:12px 0;" alt="email image"/>`;
        case "button":
          return `<a href="${block.url || "#"}" style="display:inline-block;background:${block.bgColor || "#c8490c"};color:white;padding:11px 22px;border-radius:7px;text-decoration:none;font-weight:600;margin:14px 0;">${block.text || "Click here"}</a>`;
        case "divider":
          return `<hr style="border:none;border-top:1px solid #e2ded6;margin:20px 0;"/>`;
        case "spacer":
          return `<div style="height:${block.height || 20}px;"></div>`;
        case "product-table":
          return `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
          <thead><tr style="border-bottom:2px solid #c8490c;">
            <th style="padding:10px;text-align:left;">Sản phẩm</th>
            <th style="padding:10px;text-align:right;">Giá</th>
          </tr></thead>
          <tbody>
            <tr style="border-bottom:1px solid #e2ded6;">
              <td style="padding:10px;">{{product_name}} x{{product_qty}}</td>
              <td style="padding:10px;text-align:right;font-weight:500;">{{product_price}}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:600;">Tổng cộng</td>
              <td style="padding:10px;text-align:right;font-weight:700;color:#15803d;font-size:15px;">{{total_amount}}</td>
            </tr>
          </tbody></table>`;
        case "order-info":
          return `<div style="background:#f9f9f7;padding:14px;border-radius:8px;border-left:4px solid #c8490c;margin:14px 0;font-size:13px;">
          <p style="margin:5px 0;"><strong>Mã đơn:</strong> {{order_number}}</p>
          <p style="margin:5px 0;"><strong>Địa chỉ:</strong> {{shipping_address}}</p>
          <p style="margin:5px 0;"><strong>SĐT:</strong> {{phone_number}}</p>
          <p style="margin:5px 0;"><strong>Thanh toán:</strong> {{payment_method}}</p>
        </div>`;
        case "customer-name":
          return `<p style="font-size:14px;margin:10px 0;">Xin chào <strong>{{customer_name}}</strong>,</p>`;
        case "timestamp":
          return `<p style="font-size:12px;color:#78716c;font-family:monospace;margin:8px 0;">Ngày đặt: {{order_date}}</p>`;
        default:
          return "";
      }
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f3ef;}
    .wrap{max-width:600px;margin:20px auto;background:white;border-radius:12px;border:0.5px solid #e2ded6;padding:24px 28px;}</style>
    </head><body><div class="wrap">${blockHtml}</div></body></html>`;
};

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/builder/templates
   ✅ UPSERT: nếu type đã tồn tại → UPDATE, chưa có → CREATE
─────────────────────────────────────────────────────────────────────────── */
router.post("/templates", async (req, res) => {
  try {
    const { name, description, type, blocks, emailConfig } = req.body;

    if (!name || !blocks || blocks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên hoặc blocks",
      });
    }

    // ── UPSERT: findOneAndUpdate với upsert: true ──
    // Nếu đã có document với type này → update toàn bộ blocks (replace)
    // Nếu chưa có → tạo mới
    const template = await EmailTemplate.findOneAndUpdate(
      { type: type || "custom" }, // filter by type
      {
        $set: {
          name,
          description: description || "",
          blocks, // replace toàn bộ blocks
          emailConfig: emailConfig || {},
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          isActive: true,
          isDefault: false,
        },
      },
      {
        new: true, // trả về document mới sau update
        upsert: true, // tạo mới nếu không tìm thấy
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Template đã lưu thành công (upsert)",
      template,
    });
  } catch (error) {
    console.error("❌ Error upserting template:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi lưu template",
    });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/builder/templates
   Lấy danh sách, hỗ trợ filter ?type=xxx
─────────────────────────────────────────────────────────────────────────── */
router.get("/templates", async (req, res) => {
  try {
    const { type, isActive } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const templates = await EmailTemplate.find(filter)
      .select(
        "_id name description type isActive isDefault createdAt updatedAt blocks",
      )
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("❌ Error fetching templates:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy templates",
    });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/builder/templates/:id
   Lấy chi tiết 1 template theo _id
─────────────────────────────────────────────────────────────────────────── */
router.get("/templates/:id", async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy template" });
    }
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy template" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   PUT /api/builder/templates/:id
   Update trực tiếp theo _id (xóa blocks cũ, thay mới)
─────────────────────────────────────────────────────────────────────────── */
router.put("/templates/:id", async (req, res) => {
  try {
    const { name, description, blocks, emailConfig, isActive } = req.body;

    if (!blocks || blocks.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Blocks không được rỗng" });
    }

    // findByIdAndUpdate với $set → xóa blocks cũ, thay bằng blocks mới
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          description,
          blocks, // replace toàn bộ
          emailConfig,
          isActive,
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy template" });
    }

    res.status(200).json({
      success: true,
      message: "Template cập nhật thành công",
      template,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Lỗi cập nhật" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   DELETE /api/builder/templates/:id
─────────────────────────────────────────────────────────────────────────── */
router.delete("/templates/:id", async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });
    }
    res.status(200).json({ success: true, message: "Đã xóa template" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/builder/render
   Render HTML từ blocks (không lưu)
─────────────────────────────────────────────────────────────────────────── */
router.post("/render", (req, res) => {
  try {
    const { blocks } = req.body;
    if (!blocks || !Array.isArray(blocks)) {
      return res
        .status(400)
        .json({ success: false, message: "Blocks phải là array" });
    }
    res
      .status(200)
      .json({ success: true, html: renderEmailHtmlFromBlocks(blocks) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/builder/send-test
   Gửi email test (dùng template đã lưu trong DB)
─────────────────────────────────────────────────────────────────────────── */
router.post("/send-test", async (req, res) => {
  try {
    const { templateId, recipientEmail, testData } = req.body;

    if (!templateId || !recipientEmail) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Thiếu templateId hoặc recipientEmail",
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Email không hợp lệ" });
    }

    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template không tìm thấy" });
    }

    // Render HTML + replace variables
    let html = renderEmailHtmlFromBlocks(template.blocks);
    if (testData) {
      Object.entries(testData).forEach(([key, value]) => {
        html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
      });
    }

    const emailResult = await sendEmail({
      email: recipientEmail,
      subject: `[Test] ${template.emailConfig?.subject || template.name}`,
      html,
    });

    if (!emailResult) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Lỗi gửi email – kiểm tra Resend API key",
        });
    }

    res.status(200).json({
      success: true,
      message: `Email test đã gửi đến ${recipientEmail}`,
      emailId: emailResult.id,
    });
  } catch (error) {
    console.error("❌ send-test error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
