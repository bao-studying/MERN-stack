import React, { useState, useRef } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import {
  FaCamera,
  FaSave,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaKey,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import axiosClient from "../../services/axiosClient";
import "../../assets/styles/auth-profile.css";

const ProfileInfo = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState({
    show: false,
    type: "success",
    msg: "",
  });

  // 1. STATE THÔNG TIN (Bỏ birthday, gender)
  const [info, setInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar:
      user?.avatarUrl ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80",
  });

  // 2. STATE MẬT KHẨU
  const [pass, setPass] = useState({ current: "", new: "", confirm: "" });

  // Helper thông báo
  const showAlert = (type, msg) => {
    setStatus({ show: true, type, msg });
    setTimeout(() => setStatus({ ...status, show: false }), 3000);
  };

  // --- XỬ LÝ UPLOAD ẢNH ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview ngay lập tức
    const previewUrl = URL.createObjectURL(file);
    setInfo((prev) => ({ ...prev, avatar: previewUrl }));

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axiosClient.post("/auth/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.success) {
        updateUser({ avatarUrl: res.avatarUrl });
        setInfo((prev) => ({ ...prev, avatar: res.avatarUrl }));
        showAlert("success", "Đã cập nhật ảnh đại diện!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showAlert("danger", "Lỗi khi tải ảnh lên server.");
    }
  };

  const handleChangeInfo = (e) =>
    setInfo({ ...info, [e.target.name]: e.target.value });
  const handleChangePass = (e) =>
    setPass({ ...pass, [e.target.name]: e.target.value });

  // --- API CẬP NHẬT THÔNG TIN ---
  const handleSaveInfo = async () => {
    try {
      const res = await axiosClient.put("/auth/profile/update", {
        name: info.fullName,
        phone: info.phone,
      });

      if (res.success) {
        // Cập nhật Context để Header thay đổi theo
        updateUser({
          name: res.user.name,
          phone: res.user.phone,
        });
        showAlert("success", "Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error(error);
      showAlert(
        "danger",
        error.response?.data?.message || "Lỗi cập nhật thông tin",
      );
    }
  };

  // --- API ĐỔI MẬT KHẨU ---
  const handleChangePassword = async () => {
    if (!pass.current || !pass.new || !pass.confirm) {
      showAlert("warning", "Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }
    if (pass.new !== pass.confirm) {
      showAlert("warning", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (pass.new.length < 6) {
      showAlert("warning", "Mật khẩu mới phải từ 6 ký tự trở lên");
      return;
    }

    try {
      const res = await axiosClient.put("/auth/profile/change-password", {
        currentPassword: pass.current,
        newPassword: pass.new,
      });

      if (res.success) {
        showAlert("success", "Đổi mật khẩu thành công!");
        setPass({ current: "", new: "", confirm: "" });
      }
    } catch (error) {
      console.error(error);
      showAlert(
        "danger",
        error.response?.data?.message || "Mật khẩu hiện tại không đúng",
      );
    }
  };

  return (
    <div className="  animate-fade-in">
      {/* THÔNG BÁO CHUNG */}
      {status.show && (
        <Alert variant={status.type} className="mb-4 shadow-sm">
          {status.msg}
        </Alert>
      )}

      {/* --- PHẦN 1: THÔNG TIN CÁ NHÂN --- */}
      <h4 className="fw-bold mb-4 pb-3 border-bottom text-success">
        Thông tin cá nhân
      </h4>

      <div className="text-center mb-5 position-relative">
        <div className="avatar-container">
          <img src={info.avatar} alt="Avatar" className="avatar-img" />
          <label
            className="avatar-upload-btn cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <FaCamera size={14} />
          </label>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <p className="text-muted small mt-2">
          Nhấn vào icon máy ảnh để thay đổi.
        </p>
      </div>

      <Form>
        <Row className="g-4 mb-4">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-bold small text-secondary">
                HỌ VÀ TÊN
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaUser className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={info.fullName}
                  onChange={handleChangeInfo}
                  className="modern-input border-start-0 ps-0"
                />
              </div>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold small text-secondary">
                EMAIL
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaEnvelope className="text-muted" />
                </span>
                <Form.Control
                  type="email"
                  name="email"
                  value={info.email}
                  disabled
                  className="modern-input border-start-0 ps-0 bg-light"
                />
              </div>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold small text-secondary">
                SỐ ĐIỆN THOẠI
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaPhoneAlt className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  name="phone"
                  value={info.phone}
                  onChange={handleChangeInfo}
                  className="modern-input border-start-0 ps-0"
                  placeholder="Chưa cập nhật"
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <div className="text-end pt-3 mb-5 border-top">
          <Button
            variant="success"
            onClick={handleSaveInfo}
            className="px-5 py-2 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center gap-2"
          >
            <FaSave /> Lưu Thông Tin
          </Button>
        </div>
      </Form>

      {/* --- PHẦN 2: ĐỔI MẬT KHẨU --- */}
      <h4 className="fw-bold mb-4 pb-3 border-bottom text-danger mt-5">
        <FaLock className="me-2 mb-1" />
        Đổi mật khẩu
      </h4>

      <Form>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-secondary">
                MẬT KHẨU HIỆN TẠI
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaKey className="text-muted" />
                </span>
                <Form.Control
                  type="password"
                  name="current"
                  value={pass.current}
                  onChange={handleChangePass}
                  placeholder="••••••••"
                  className="modern-input border-start-0 ps-0"
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-secondary">
                MẬT KHẨU MỚI
              </Form.Label>
              <Form.Control
                type="password"
                name="new"
                value={pass.new}
                onChange={handleChangePass}
                placeholder="••••••••"
                className="modern-input"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-secondary">
                XÁC NHẬN MẬT KHẨU MỚI
              </Form.Label>
              <Form.Control
                type="password"
                name="confirm"
                value={pass.confirm}
                onChange={handleChangePass}
                placeholder="••••••••"
                className="modern-input"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-end border-top pt-3">
          <Button
            variant="outline-danger"
            className="px-4 py-2 rounded-pill fw-bold shadow-sm"
            onClick={handleChangePassword}
          >
            Cập nhật mật khẩu
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProfileInfo;
