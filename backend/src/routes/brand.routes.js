import express from "express";
import { body } from "express-validator";
import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand
} from "../controllers/brand.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get("/", getBrands);

// --- PROTECTED ROUTES (Admin & Manager) ---

// 1. Tạo mới
router.post(
    "/",
    authMiddleware,
    requireRole(["admin", "manager"]), // Cho phép cả Manager
    [
        body("name").notEmpty().withMessage("Tên thương hiệu là bắt buộc")
    ],
    validateRequest,
    createBrand
);

// 2. Cập nhật
router.put(
    "/:id",
    authMiddleware,
    requireRole(["admin", "manager"]),
    updateBrand
);

// 3. Xóa
router.delete(
    "/:id",
    authMiddleware,
    requireRole(["admin", "manager"]),
    deleteBrand
);

// Route lấy danh sách cho trang admin (thực ra dùng chung getBrands cũng được)
router.get(
  "/admin",
  authMiddleware,
  requireRole(["admin", "manager"]),
  getBrands
);

export default router;