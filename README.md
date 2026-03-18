 

## Giới Thiệu

 là một ứng dụng Full-stack được xây dựng trên nền tảng **MERN (MongoDB, Express, React, Node.js)**. Dự án tập trung vào trải nghiệm người dùng mượt mà (Optimistic UI), bảo mật cao (HttpOnly Cookie, RBAC) và kiến trúc mã nguồn sạch sẽ, dễ bảo trì.

---

## Công Nghệ Sử Dụng

### Frontend (Client & Admin)

* **Core:** [React 19](https://react.dev/), [Vite](https://vitejs.dev/) (Build tool).
* **UI Framework:** [React Bootstrap](https://react-bootstrap.github.io/) (Responsive layout).
* **State & Routing:** Context API (Auth, Cart, Wishlist), [React Router DOM v7](https://reactrouter.com/).
* **Data Fetching:** [Axios](https://axios-http.com/) (với Interceptors xử lý Token/Lỗi).
* **Utilities:**
* `react-hot-toast`: Thông báo (Toast notification).
* `recharts`: Biểu đồ thống kê.
* `react-icons`: Bộ icon đa dạng.
* `js-cookie`, `jwt-decode`: Xử lý cookie và token.

### Backend (API Server)

* **Runtime:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/).
* **Database:** [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/).
* **Authentication:** JWT (JSON Web Token), BCrypt (Mã hóa mật khẩu).
* **File Upload:** [Multer](https://github.com/expressjs/multer) (Xử lý upload ảnh).
* **Email Service:** [Nodemailer](https://nodemailer.com/).
* **Security & Validation:** `cookie-parser`, `cors`, `express-validator`, `dotenv`.
* **Utilities:** `slugify` (Tạo URL thân thiện).

---

## Tính Năng Nổi Bật

### Client (Khách Hàng)

#### 1. Xác thực (Auth)

* Đăng ký / Đăng nhập / Đăng xuất.
* **Quên mật khẩu & Đặt lại mật khẩu** (qua Email xác thực).
* Bảo mật phiên làm việc bằng **HttpOnly Cookie**.

#### 2. Mua sắm (Shopping Flow)

* **Sản phẩm:** Xem danh sách, chi tiết sản phẩm, lọc theo (Danh mục, Thương hiệu, Giá), Tìm kiếm thời gian thực.
* **Giỏ hàng (Cart):**
* Đồng bộ giỏ hàng với Database (giữ giỏ hàng khi đăng nhập thiết bị khác).
* Tự động tính toán tổng tiền và Freeship tại Backend.
* **Thanh toán (Checkout):**
* Quản lý sổ địa chỉ (Thêm mới/Chọn có sẵn).
* **Snapshot giá:** Lưu cứng giá sản phẩm tại thời điểm mua (tránh sai lệch khi giá gốc thay đổi).
* Kiểm tra và trừ tồn kho (Inventory Check).
* **Đơn hàng:** Xem lịch sử mua hàng, nhận Email xác nhận đơn hàng tự động.

#### 3. Tiện ích (Standalone)

* **Wishlist:** Thêm/Xóa sản phẩm yêu thích (Sử dụng Optimistic UI update - cập nhật ngay lập tức không cần chờ server).
* **Liên hệ:** Gửi thắc mắc, tự động gửi email phản hồi cho khách và thông báo cho Admin.

#### 4. Hệ thống (System)

* **URL Params Sync:** Trạng thái lọc, phân trang, tab đều được đồng bộ lên URL (F5 không mất dữ liệu).
* **Auto Logout:** Tự động đăng xuất khi Token hết hạn.

---

### Admin Dashboard (Quản Trị)

#### 1. Phân quyền (RBAC - Role Based Access Control)

* Hệ thống phân quyền 3 cấp độ: **ADMIN**, **MANAGER**, **STAFF**.
* **Middleware bảo vệ:** Chặn API ngay từ Backend nếu không đủ quyền.
* **Dynamic Sidebar:** Menu tự động ẩn/hiện tùy theo vai trò của người đăng nhập.

#### 2. Quản lý dữ liệu (Management)

* **Dashboard:** Thống kê tổng quan (Chart, Mini stats).
* **Sản phẩm (Product):** Thêm, Sửa, Xóa, Upload ảnh, Quản lý biến thể (SKU, Stock).
* **Danh mục (Category):** CRUD danh mục sản phẩm.
* **Đơn hàng (Order):** Xem chi tiết, Cập nhật trạng thái (Pending -> Shipping -> Delivered).
* **Khách hàng (Customer):** Xem danh sách.
* *Logic đặc biệt:* Chỉ **Admin** mới có quyền Khóa/Mở khóa tài khoản, Manager chỉ được xem.

---

## Hướng Dẫn Cài Đặt & Chạy Local

Yêu cầu tiên quyết: Node.js (v16 trở lên), MongoDB (Local hoặc Atlas)

1. Cài đặt Backend
cd backend
npm install
npm run seed  
npm run dev

2. Cài đặt Frontend
cd frontend
npm install
npm run dev

3. Cấu hình biến môi trường (backend/.env)
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecostore
JWT_SECRET=your_super_secret_key_123
JWT_EXPIRES_IN=7d
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=[your-email@gmail.com]
MAIL_PASS=[your-app-password]
CLIENT_URL=[http://localhost:5173]

---

 