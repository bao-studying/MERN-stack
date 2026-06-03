import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

// ==================== IMPORT WEBHOOK ====================
import { handleSepayWebhook } from "../controllers/payment.controller.js";

// Nếu bạn còn dùng PayOS thì giữ, còn không thì comment hoặc xóa
// import { handlePayOSWebhook } from "../controllers/payment.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

// ====================== PUBLIC / WEBHOOK ======================
router.post("/sepay-webhook", handleSepayWebhook);

// Giữ lại nếu bạn vẫn dùng PayOS
// router.post("/payos-webhook", handlePayOSWebhook);

// ====================== CLIENT ROUTES ======================
router.use(verifyToken);

// Lấy đơn hàng của chính user
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

// Tạo đơn hàng
router.post(
  "/",
  [
    body("shippingAddress")
      .notEmpty()
      .withMessage("Vui lòng nhập địa chỉ giao hàng"),
    body("phoneNumber").notEmpty().withMessage("Vui lòng nhập số điện thoại"),
    body("paymentMethod")
      .optional()
      .isIn(["COD", "cod", "payos", "sepay"])
      .withMessage("Phương thức thanh toán không hợp lệ"),
  ],
  validateRequest,
  createOrder,
);

// ====================== ADMIN ROUTES ======================
router.get(
  "/admin/all",
  requireRole(["admin", "manager", "staff"]),
  getAllOrders,
);

router.put(
  "/admin/:id/status",
  requireRole(["admin", "manager", "staff"]),
  updateOrderStatus,
);

export default router;
