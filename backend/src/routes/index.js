import express from "express";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import brandRoutes from "./brand.routes.js";
import authRoutes from "./auth.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import userRoutes from './user.routes.js';
import contactRoutes from "./contact.routes.js";

const router = express.Router();

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use('/users', userRoutes);
router.use("/contact", contactRoutes);
export default router;
