import express from "express";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
  createProduct,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get("/", getAllProducts);
router.get("/related", getRelatedProducts);
router.get("/:slug", getProductBySlug);

// --- PROTECTED ROUTES (Admin & Manager) ---
// Yêu cầu: Chỉ Admin và Manager được phép thao tác

// 1. Xem danh sách dạng bảng (cho trang Admin)
router.get(
  "/admin/all",
  authMiddleware,
  requireRole(["admin", "manager"]),
  getAllProducts,
);

// 2. Tạo sản phẩm
// Lưu ý: KHÔNG còn validate "price_cents" ở body gốc, vì giá hiển thị
// (price_cents) giờ được backend tự tính từ variant đầu tiên (xem product.service.js).
// Thay vào đó, bắt buộc phải có ít nhất 1 biến thể với giá hợp lệ.
router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "manager"]),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("categoryId").notEmpty().withMessage("Category ID is required"),
    body("variants")
      .isArray({ min: 1 })
      .withMessage("Sản phẩm cần ít nhất 1 biến thể"),
    body("variants.*.price_cents")
      .isNumeric()
      .withMessage("Mỗi biến thể cần có giá bán hợp lệ"),
  ],
  validateRequest,
  createProduct,
);

// 3. Sửa sản phẩm
router.put(
  "/:id",
  authMiddleware,
  requireRole(["admin", "manager"]),
  [
    body("variants")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Sản phẩm cần ít nhất 1 biến thể"),
  ],
  validateRequest,
  updateProduct,
);

// 4. Xóa sản phẩm
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["admin", "manager"]),
  deleteProduct,
);

export default router;
