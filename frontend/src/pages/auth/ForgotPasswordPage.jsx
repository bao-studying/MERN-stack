// frontend/src/pages/auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaKey, FaShieldAlt } from 'react-icons/fa';
import authApi from '../../services/auth.service'; // Import API
import '../../assets/styles/auth-profile.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Bước 1: Xác minh
  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // GỌI API THẬT
      const res = await authApi.verifyReset({
        email: formData.email,
        phone: formData.phone,
      });

      if (res.success) {
        setStep(2); // Chuyển sang bước đổi pass
      }
    } catch (err) {
      setError(err.response?.data?.message || "Thông tin xác thực không đúng.");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Đổi pass
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      // GỌI API THẬT
      const res = await authApi.resetPassword({
        email: formData.email,
        phone: formData.phone, // Cần gửi lại thông tin xác thực để backend check
        newPassword: formData.newPassword,
      });

      if (res.success) {
        alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* BANNER SIDE - Đổi ảnh chủ đề Pokemon TCG */}
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
              "linear-gradient(135deg, rgba(239, 83, 80, 0.9) 0%, rgba(0, 0, 0, 0.8) 100%)",
          }}
        ></div>
        <div className="auth-banner-content">
          {/* Poké Ball Icon thay cho FaKey */}
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
            Khôi Phục Trung Tâm
          </h1>
          <p className="fs-5 opacity-90 text-white">
            Mất dấu bộ sưu tập? Chúng tôi sẽ giúp bạn kết nối lại với tài khoản
            TCG của mình.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <Link
          to="/login"
          className="back-home-btn text-decoration-none text-dark fw-bold"
        >
          <FaArrowLeft className="me-2" /> Quay lại đăng nhập
        </Link>

        <div className="auth-form-container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">Quên Mật Khẩu?</h2>
            <p className="text-muted">
              {step === 1
                ? "Xác minh danh tính nhà huấn luyện để tiếp tục."
                : "Thiết lập mã bảo mật mới cho kho báu của bạn."}
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="text-center border-0 shadow-sm">
              {error}
            </Alert>
          )}

          {step === 1 ? (
            <Form onSubmit={handleVerifyIdentity}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">
                  EMAIL TRAINER
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="pikachu@tcgstore.com"
                  className="modern-input"
                  style={{ borderRadius: "12px", padding: "12px" }}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small text-secondary">
                  SỐ ĐIỆN THOẠI ĐĂNG KÝ
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  className="modern-input"
                  style={{ borderRadius: "12px", padding: "12px" }}
                  onChange={handleChange}
                  required
                />
                <Form.Text className="text-muted small d-flex align-items-center mt-2">
                  <FaShieldAlt className="me-1 text-danger" /> Thông tin được mã
                  hóa bảo mật chuẩn TCG.
                </Form.Text>
              </Form.Group>
              <Button
                variant="danger"
                type="submit"
                className="w-100 py-3 rounded-pill fw-bold shadow-sm mb-4 border-0"
                style={{
                  background: "linear-gradient(45deg, #ef5350, #d32f2f)",
                }}
                disabled={loading}
              >
                {loading ? "Đang quét dữ liệu..." : "Tiếp Tục Xác Minh"}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">
                  MẬT KHẨU MỚI
                </Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  placeholder="••••••••"
                  className="modern-input"
                  style={{ borderRadius: "12px", padding: "12px" }}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small text-secondary">
                  XÁC NHẬN MẬT KHẨU
                </Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  className="modern-input"
                  style={{ borderRadius: "12px", padding: "12px" }}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button
                variant="danger"
                type="submit"
                className="w-100 py-3 rounded-pill fw-bold shadow-sm mb-4 border-0"
                style={{
                  background: "linear-gradient(45deg, #ef5350, #d32f2f)",
                }}
                disabled={loading}
              >
                {loading ? "Đang thiết lập..." : "Cập Nhật Mật Khẩu"}
              </Button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;