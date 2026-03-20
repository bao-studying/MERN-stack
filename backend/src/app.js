import express from "express";
import { createServer } from "http"; // THÊM: Để tạo Server HTTP gốc
import { Server } from "socket.io"; // THÊM: Thư viện Socket
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import chatRoutes from "./routes/chat.route.js";
import { initChatSocket } from "../socket/chat.socket.js"; // THÊM: Import hàm khởi tạo chat của bạn
import voucherRouter from "./routes/voucher.router.js";

// 1. CONFIGURATION
dotenv.config();
const app = express();
const httpServer = createServer(app); // THÊM: Bao bọc app bằng httpServer

// Khởi tạo Socket.io
const io = new Server(httpServer, {
  // THÊM
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Kích hoạt logic chat từ file socket của bạn
initChatSocket(io); // THÊM

// Tin tưởng proxy đầu tiên (Render/Nginx) để lấy đúng IP và HTTPS
app.set("trust proxy", 1);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. CONNECT DATABASE
connectDB();

// 3. GLOBAL MIDDLEWARES (Giữ nguyên logic của bạn)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.cookies && req.cookies.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.cookies.token}`;
  }
  next();
});

app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 4. ROUTING (Giữ nguyên logic của bạn)
app.get("/", (req, res) => {
  res.json({ message: "EcoStore backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", apiRoutes);
app.use("/api/vouchers", voucherRouter);

// 5. ERROR HANDLING
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.statusCode = 404;
  next(error);
});
app.use(errorHandler);

// 6. START SERVER (QUAN TRỌNG: Đổi sang httpServer.listen)
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  // THAY ĐỔI TỪ app.listen SANG httpServer.listen
  console.log(`Server running at http://localhost:${PORT}`);
});
