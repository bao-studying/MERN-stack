import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../services/auth.service";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa"; // Dùng FaShieldAlt cho bảo mật
import "../../assets/styles/auth-profile.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  // GIỮ NGUYÊN LOGIC STATE
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // GIỮ NGUYÊN LOGIC XỬ LÝ INPUT
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // GIỮ NGUYÊN LOGIC SUBMIT (Chỉ thay đổi màu sắc nút & text hiển thị)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Số điện thoại không hợp lệ (10-11 số)");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register(formData);
      if (response.success) {
        alert("Đăng ký thành công! Chào mừng Tân Trainer.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Register failed:", err);
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* BANNER SIDE - Đổi chủ đề Pokemon TCG */}
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
        <div className="auth-banner-content">
          {/* Poké Ball Icon */}
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
          <h1 className="display-4 fw-bold mb-3 text-white">
            Gia Nhập <br /> Cộng Đồng TCG
          </h1>
          <p className="fs-5 opacity-90 text-white">
            Bắt đầu hành trình sưu tầm những thẻ bài Grail hiếm nhất.
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
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark mb-2">Đăng Ký Thành Viên</h2>
            <p className="text-muted small">
              Trở thành Trainer chính thức của TCG Store
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
                HỌ VÀ TÊN
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Nguyễn Gia Bảo"
                className="modern-input"
                style={{ borderRadius: "12px" }}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-secondary">
                EMAIL TRAINER
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="bao@tcgstore.com"
                className="modern-input"
                style={{ borderRadius: "12px" }}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-secondary">
                SỐ ĐIỆN THOẠI
              </Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="09xxxxxxx"
                className="modern-input"
                style={{ borderRadius: "12px" }}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-secondary">
                MẬT KHẨU BẢO MẬT
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Tối thiểu 6 ký tự"
                className="modern-input"
                style={{ borderRadius: "12px" }}
                onChange={handleChange}
                required
              />
              <Form.Text className="text-muted small mt-2 d-flex align-items-center">
                <FaShieldAlt className="me-1 text-danger" /> Bảo mật đa lớp
                chuẩn quốc tế.
              </Form.Text>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 py-3 rounded-pill fw-bold shadow-sm mb-4 text-uppercase border-0"
              style={{
                background: "linear-gradient(45deg, #EF5350, #000)",
                color: "#fff",
              }}
              disabled={loading}
            >
              {loading ? "Đang tạo hồ sơ..." : "Kích Hoạt Tài Khoản"}
            </Button>

            <div className="text-center mt-3">
              <span className="text-muted">Đã là thành viên? </span>
              <Link
                to="/login"
                style={{ color: "#EF5350" }}
                className="text-decoration-none fw-bold"
              >
                Đăng nhập tại đây
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
