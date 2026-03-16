// frontend/src/pages/auth/LoginPage.jsx
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authApi from "../../services/auth.service";
import { FaArrowLeft, FaGoogle, FaFacebookF } from "react-icons/fa";
import "../../assets/styles/auth-profile.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authApi.login(formData);
      if (response.success) {
        const { token, user } = response.data;
        login(user, token, rememberMe);
        if (
          user.role === "admin" ||
          user.role === "manager" ||
          user.role === "staff"
        ) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Thông tin đăng nhập không chính xác.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* BANNER SIDE - Chủ đề Pokemon TCG Sang Trọng */}
      <div
        className="auth-banner-side"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1613771418174-b3d67be4b262?auto=format&fit=crop&w=1200&q=80")',
        }}
      >
        <div
          className="auth-banner-overlay"
          style={{
            background:
              "linear-gradient(135deg, rgba(239, 83, 80, 0.85) 0%, rgba(0, 0, 0, 0.9) 100%)",
          }}
        ></div>
        <div className="auth-banner-content text-center">
          {/* Poké Ball Icon thay cho FaLeaf */}
          <div
            className="bg-white p-2 rounded-circle d-inline-flex mb-4 shadow-lg animate-bounce"
            style={{ border: "4px solid #000" }}
          >
            <div
              style={{ position: "relative", width: "50px", height: "50px" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  width: "100%",
                  height: "50%",
                  backgroundColor: "#EF5350",
                  borderTopLeftRadius: "25px",
                  borderTopRightRadius: "25px",
                  borderBottom: "2px solid #000",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  height: "50%",
                  backgroundColor: "#fff",
                  borderBottomLeftRadius: "25px",
                  borderBottomRightRadius: "25px",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "14px",
                  height: "14px",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  border: "3px solid #000",
                  zIndex: 2,
                }}
              ></div>
            </div>
          </div>
          <h1 className="display-4 fw-bold mb-3 text-white">TCG STORE</h1>
          <p className="fs-5 opacity-90 text-white">
            Chạm tay vào những quân bài huyền thoại.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <Link
          to="/"
          className="back-home-btn text-decoration-none text-dark fw-bold"
        >
          <FaArrowLeft /> Về trang chủ
        </Link>

        <div className="auth-form-container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">Chào Mừng Trở Lại!</h2>
            <p className="text-muted">
              Đăng nhập vào tài khoản Trainer của bạn
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="text-center border-0 shadow-sm">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-secondary">
                EMAIL TRAINER
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="trainer@tcgstore.com"
                className="modern-input"
                style={{ borderRadius: "12px" }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-secondary">
                MẬT KHẨU
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="••••••••"
                className="modern-input"
                style={{ borderRadius: "12px" }}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <Form.Check
                type="checkbox"
                label="Ghi nhớ đăng nhập"
                className="small text-muted"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Link
                to="/forgot-password"
                style={{ color: "#EF5350" }}
                className="text-decoration-none small fw-bold"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-100 py-3 rounded-pill fw-bold shadow-sm mb-4 text-uppercase border-0"
              style={{
                background: "linear-gradient(45deg, #EF5350, #000)",
                color: "#fff",
              }}
              disabled={loading}
            >
              {loading ? "Đang quét dữ liệu..." : "Đăng Nhập"}
            </Button>

            <div className="position-relative text-center mb-4">
              <hr className="text-muted opacity-25" />
              <span className="bg-white px-3 text-muted small position-absolute top-50 start-50 translate-middle">
                Hoặc sử dụng
              </span>
            </div>

            <div className="d-flex gap-3 mb-4">
              <Button
                variant="outline-dark"
                className="w-50 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2"
              >
                <FaGoogle className="text-danger" /> Google
              </Button>
              <Button
                variant="outline-dark"
                className="w-50 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2"
              >
                <FaFacebookF className="text-primary" /> Facebook
              </Button>
            </div>

            <div className="text-center mt-4">
              <span className="text-muted">Mới gia nhập cộng đồng? </span>
              <Link
                to="/register"
                style={{ color: "#EF5350" }}
                className="text-decoration-none fw-bold"
              >
                Đăng ký ngay
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
