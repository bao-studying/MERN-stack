import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  toggleUserStatus,
  deleteUser,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getWishlist,
  toggleWishlist,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
// Import thêm requireRole
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Middleware xác thực áp dụng cho toàn bộ router này
router.use(verifyToken);

// --- CLIENT ROUTES (Cá nhân người dùng tự thao tác) ---
router.get("/wishlist", getWishlist);
router.post("/wishlist/toggle", toggleWishlist);
router.post("/address", addAddress);
router.put("/address/:addressId", updateAddress);
router.delete("/address/:addressId", deleteAddress);
router.put("/address/:addressId/default", setDefaultAddress);

// --- MANAGEMENT ROUTES (Phân quyền) ---
router.post('/', requireRole(['admin', 'manager']), createUser); // ĐÂY LÀ DÒNG FIX LỖI 404

// 1. Xem danh sách & Xem chi tiết: Admin & Manager đều được xem
router.get("/", requireRole(["admin", "manager"]), getAllUsers);
router.get("/:id", requireRole(["admin", "manager"]), getUserById);

// 2. Thao tác nhạy cảm (Khóa/Xóa): CHỈ ADMIN được làm
router.put("/:id/status", requireRole(["admin"]), toggleUserStatus);
router.delete("/:id", requireRole(["admin"]), deleteUser);

export default router;
