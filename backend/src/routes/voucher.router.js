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
} from "../controllers/voucher.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();
router.use(verifyToken);

/* CLIENT */
router.get("/my", getMyVouchers);
router.post("/validate", validateVoucher);

/* ADMIN */
const admin = requireRole(["admin", "manager"]);
router.get("/admin", admin, getAllVouchers);
router.post("/admin", admin, createVoucher);
router.post("/admin/generate", admin, generateVouchers);
router.put("/admin/:id", admin, updateVoucher);
router.delete("/admin/:id", admin, deleteVoucher);
router.post("/admin/:id/assign", admin, assignVoucher);
router.delete("/admin/:id/assign/:userId", admin, revokeVoucher);
router.get("/admin/:id/eligible-users", admin, getEligibleUsers);

export default router;
// app.use("/api/vouchers", voucherRouter);
