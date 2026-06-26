import express from "express";
import {
  getAllVouchers,
  createVoucher,
  generateVouchers,
  updateVoucher,
  deleteVoucher,
  assignVoucher,
  revokeVoucher,
  getEligibleUsers,
  getMyVouchers,
  validateVoucher,
  getAnalytics,
  getVoucherUsageHistory,
  getCustomersBySegment,
  markVoucherUsedHandler,
} from "../controllers/voucher.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();
router.use(verifyToken);

/* ──────────────── CLIENT ──────────────── */
router.get("/my", getMyVouchers);
router.post("/validate", validateVoucher);

/* ──────────────── ADMIN ──────────────── */
const admin = requireRole(["admin", "manager"]);

// List + Search + Filter + Pagination
router.get("/admin", admin, getAllVouchers);

// Create + Generate
router.post("/admin", admin, createVoucher);
router.post("/admin/generate", admin, generateVouchers);

// Update + Delete
router.put("/admin/:id", admin, updateVoucher);
router.delete("/admin/:id", admin, deleteVoucher);

// Assign + Revoke
router.post("/admin/:id/assign", admin, assignVoucher);
router.delete("/admin/:id/assign/:userId", admin, revokeVoucher);
router.get("/admin/:id/eligible-users", admin, getEligibleUsers);

// 📊 ANALYTICS (NEW)
router.get("/admin/dashboard/analytics", admin, getAnalytics);
router.get("/admin/:id/usage-history", admin, getVoucherUsageHistory);
router.get("/admin/customers/:segment", admin, getCustomersBySegment);

// 📝 INTERNAL: Mark as used (gọi từ order service)
router.post("/admin/:id/mark-used", admin, markVoucherUsedHandler);

export default router;
// app.use("/api/vouchers", voucherRouter);
