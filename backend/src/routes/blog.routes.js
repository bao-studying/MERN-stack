import express from "express";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", verifyToken, requireRole(["admin", "manager"]), createBlog);
router.put("/:id", verifyToken, requireRole(["admin", "manager"]), updateBlog);
router.delete("/:id", verifyToken, requireRole(["admin", "manager"]), deleteBlog);

export default router;
