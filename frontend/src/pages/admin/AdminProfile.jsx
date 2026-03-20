import React, { useState, useRef, useMemo } from "react";
import {
  FaSave,
  FaCamera,
  FaKey,
  FaUserCheck,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import axiosClient from "../../services/axiosClient";

/* ─────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .ap-root {
    --bg:   #f5f3ef; --surf: #ffffff; --bd: #e2ded6;
    --tx:   #1c1917; --mu: #78716c;   --su: #a8a29e;
    --ac:   #c8490c; --gn: #15803d;
    --font: 'DM Sans',sans-serif;
    --serif:'Fraunces',serif;
    --mono: 'DM Mono',monospace;
    font-family: var(--font); color: var(--tx);
  }

  .ap-page-title {
    font-family: var(--serif);
    font-size: 26px; font-weight: 300; font-style: italic;
    letter-spacing: -.5px; color: var(--tx); margin: 0 0 22px;
  }

  /* ── CARD ── */
  .ap-card {
    background: var(--surf); border: 0.5px solid var(--bd);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06);
  }

  /* ── COVER ── */
  .ap-cover {
    height: 90px; background: #1c1917;
    position: relative; overflow: hidden;
  }
  .ap-cover::before {
    content:''; position:absolute; inset:0;
    background: repeating-linear-gradient(
      45deg, transparent, transparent 28px,
      rgba(255,255,255,.03) 28px, rgba(255,255,255,.03) 29px
    );
  }
  .ap-cover-blob {
    position:absolute; right:-50px; top:-50px;
    width:200px; height:200px; border-radius:50%;
    background: var(--ac); opacity:.15;
  }
  .ap-cover-blob2 {
    position:absolute; left:20%; bottom:-30px;
    width:100px; height:100px; border-radius:50%;
    background: #d4af37; opacity:.08;
  }

  /* ── IDENTITY ROW ── */
  .ap-identity {
    padding: 0 28px 18px;
    display: flex; align-items: flex-end; gap: 16px;
    border-bottom: 0.5px solid var(--bd); flex-wrap: wrap;
  }
  .ap-avatar-wrap { position:relative; margin-top:-38px; flex-shrink:0; }
  .ap-avatar {
    width: 78px; height: 78px; border-radius: 18px;
    object-fit: cover; border: 3px solid var(--surf);
    box-shadow: 0 2px 8px rgba(0,0,0,.15); display: block;
  }
  .ap-cam-btn {
    position: absolute; bottom: -7px; right: -7px;
    width: 26px; height: 26px; border-radius: 8px;
    background: var(--tx); border: 2px solid var(--surf);
    cursor: pointer; display:flex; align-items:center; justify-content:center;
    color: #fff; font-size: 10px; transition: background .15s, transform .1s;
  }
  .ap-cam-btn:hover { background: var(--ac); transform: scale(1.1); }

  .ap-name-block { flex:1; min-width:0; padding-bottom:4px; }
  .ap-name {
    font-family: var(--serif); font-size: 20px; font-weight: 500;
    color: var(--tx); margin: 0 0 3px; letter-spacing: -.3px;
  }
  .ap-email { font-size: 13px; color: var(--mu); margin: 0; }

  .ap-badges { display:flex; gap:6px; align-items:center; padding-bottom:4px; flex-wrap:wrap; }
  .ap-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding: 4px 10px; border-radius:20px;
    font-size:11px; font-weight:500; border:0.5px solid;
  }
  .ap-badge-role   { background:#fef3c7; color:#92400e; border-color:#fde68a; }
  .ap-badge-active { background:#dcfce7; color:#15803d; border-color:#86efac; }

  /* ── BODY ── */
  .ap-body {
    display: grid; grid-template-columns: 1fr 0.5px 1fr;
  }
  @media (max-width:700px) {
    .ap-body { grid-template-columns: 1fr; }
    .ap-vdivider { display:none; }
  }
  .ap-vdivider { background: var(--bd); }
  .ap-section  { padding: 24px 28px; }

  .ap-section-hd { display:flex; align-items:center; gap:8px; margin-bottom:18px; }
  .ap-section-icon {
    width:28px; height:28px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; flex-shrink:0;
  }
  .ap-icon-info { background:#dbeafe; color:#1d4ed8; }
  .ap-icon-sec  { background:#fee2e2; color:#dc2626; }
  .ap-section-title { font-size:13px; font-weight:600; color:var(--tx); margin:0; letter-spacing:-.1px; }

  /* ── FIELDS ── */
  .ap-fields { display:flex; flex-direction:column; gap:13px; }
  .ap-field  { display:flex; flex-direction:column; gap:4px; }
  .ap-label  {
    font-size:10px; font-weight:700; letter-spacing:.5px;
    text-transform:uppercase; color:var(--su); margin:0;
  }
  .ap-input {
    padding: 9px 12px; border: 0.5px solid var(--bd); border-radius:9px;
    font-size:13px; font-family:var(--font); color:var(--tx);
    background:var(--bg); outline:none; width:100%;
    transition:border-color .15s, background .15s;
  }
  .ap-input:focus { border-color:var(--ac); background:#fff; }
  .ap-input:disabled { opacity:.5; cursor:not-allowed; }

  .ap-pw-wrap { position:relative; }
  .ap-pw-wrap .ap-input { padding-right:36px; }
  .ap-eye {
    position:absolute; right:10px; top:50%; transform:translateY(-50%);
    background:none; border:none; padding:0; color:var(--su);
    cursor:pointer; font-size:13px; display:flex; align-items:center;
    transition:color .12s;
  }
  .ap-eye:hover { color:var(--tx); }

  /* strength bar */
  .ap-str-bar  { height:3px; border-radius:2px; background:var(--bd); overflow:hidden; margin-top:6px; }
  .ap-str-fill { height:100%; border-radius:2px; transition:width .3s, background .3s; }
  .ap-str-lbl  { font-size:10px; font-family:var(--mono); margin-top:3px; }

  /* match hint */
  .ap-mismatch { font-size:11px; color:#dc2626; margin-top:3px; }

  /* ── FOOTER ── */
  .ap-footer {
    padding:14px 28px; border-top:0.5px solid var(--bd);
    background:var(--bg); display:flex;
    justify-content:flex-end; gap:10px; flex-wrap:wrap;
  }
  .ab {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 20px; border-radius:9px; font-size:13px; font-weight:500;
    font-family:var(--font); cursor:pointer; border:0.5px solid transparent;
    transition:background .15s, transform .1s;
  }
  .ab:active { transform:scale(.98); }
  .ab-dark { background:var(--tx); color:#fff; }
  .ab-dark:hover { background:#3c3c3c; }
  .ab-danger { background:transparent; color:#dc2626; border-color:#fca5a5; }
  .ab-danger:hover { background:#fee2e2; }
  .ab:disabled { opacity:.38; cursor:not-allowed; transform:none; }

  /* ── TOAST ── */
  .ap-toast {
    position:fixed; top:20px; right:20px; z-index:2000;
    padding:11px 16px; border-radius:10px; font-size:13px; font-weight:500;
    box-shadow:0 4px 20px rgba(0,0,0,.14);
    display:flex; align-items:center; gap:8px;
    min-width:220px; max-width:320px;
    animation:apToastIn .22s ease;
    font-family:'DM Sans',sans-serif;
  }
  @keyframes apToastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
  .ap-toast.success { background:#dcfce7; color:#15803d; border:0.5px solid #86efac; }
  .ap-toast.danger  { background:#fee2e2; color:#dc2626; border:0.5px solid #fca5a5; }
  .ap-toast.warning { background:#fef9c3; color:#a16207; border:0.5px solid #fde047; }
`;

/* ─────────────────────────────────────────────────────────────────
   PASSWORD STRENGTH HELPER
───────────────────────────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { pct: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return (
    [
      { pct: 0, label: "", color: "transparent" },
      { pct: 20, label: "Rất yếu", color: "#ef4444" },
      { pct: 40, label: "Yếu", color: "#f97316" },
      { pct: 65, label: "Trung bình", color: "#eab308" },
      { pct: 85, label: "Mạnh", color: "#22c55e" },
      { pct: 100, label: "Rất mạnh", color: "#15803d" },
    ][s] || { pct: 0, label: "", color: "transparent" }
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT — 100% logic gốc giữ nguyên
───────────────────────────────────────────────────────────────── */
const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const demoAvatar =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  /* State thông tin (GIỮ NGUYÊN) */
  const [info, setInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    phone: user?.phone || "",
  });

  /* State mật khẩu (GIỮ NGUYÊN) */
  const [pass, setPass] = useState({ current: "", new: "", confirm: "" });

  /* State thông báo (GIỮ NGUYÊN) */
  const [status, setStatus] = useState({
    show: false,
    type: "success",
    msg: "",
  });

  /* Thêm: show/hide password */
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const togglePw = (f) => setShowPw((p) => ({ ...p, [f]: !p[f] }));

  const strength = useMemo(() => getStrength(pass.new), [pass.new]);

  /* --- 1. UPLOAD ẢNH (GIỮ NGUYÊN) --- */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await axiosClient.post("/auth/upload-avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.success) {
        updateUser({ avatarUrl: res.avatarUrl });
        showAlert("success", "Đã cập nhật ảnh đại diện!");
      }
    } catch {
      showAlert("danger", "Lỗi khi tải ảnh lên server.");
    }
  };

  /* --- 2. LƯU THÔNG TIN (GIỮ NGUYÊN) --- */
  const handleSaveInfo = async () => {
    try {
      const res = await axiosClient.put("/auth/profile/update", {
        name: info.name,
        phone: info.phone,
      });
      if (res.success) {
        updateUser({ name: res.user.name, phone: res.user.phone });
        showAlert("success", "Cập nhật thông tin thành công!");
      }
    } catch (err) {
      showAlert(
        "danger",
        err.response?.data?.message || "Lỗi cập nhật thông tin",
      );
    }
  };

  /* --- 3. ĐỔI MẬT KHẨU (GIỮ NGUYÊN) --- */
  const handleChangePassword = async () => {
    if (!pass.current || !pass.new || !pass.confirm) {
      showAlert("warning", "Vui lòng nhập đầy đủ các trường mật khẩu");
      return;
    }
    if (pass.new !== pass.confirm) {
      showAlert("warning", "Mật khẩu xác nhận không khớp!");
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
    } catch (err) {
      showAlert(
        "danger",
        err.response?.data?.message || "Mật khẩu hiện tại không đúng!",
      );
    }
  };

  /* Helper thông báo (GIỮ NGUYÊN) */
  const showAlert = (type, msg) => {
    setStatus({ show: true, type, msg });
    setTimeout(() => setStatus((s) => ({ ...s, show: false })), 3000);
  };

  const handleChangeInfo = (e) =>
    setInfo({ ...info, [e.target.name]: e.target.value });
  const handleChangePass = (e) =>
    setPass({ ...pass, [e.target.name]: e.target.value });

  const currentAvatar = user?.avatarUrl || demoAvatar;
  const roleLabel =
    typeof info.role === "object" ? info.role?.name : info.role || "";

  /* ── RENDER ── */
  return (
    <div className="ap-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Toast */}
      {status.show && (
        <div className={`ap-toast ${status.type}`}>
          {status.type === "success"
            ? "✓"
            : status.type === "danger"
              ? "✕"
              : "⚠"}{" "}
          {status.msg}
        </div>
      )}

      <p className="ap-page-title">Hồ sơ cá nhân</p>

      <div className="ap-card">
        {/* Cover */}
        <div className="ap-cover">
          <div className="ap-cover-blob" />
          <div className="ap-cover-blob2" />
        </div>

        {/* Identity */}
        <div className="ap-identity">
          <div className="ap-avatar-wrap">
            <img src={currentAvatar} alt="Avatar" className="ap-avatar" />
            <button
              className="ap-cam-btn"
              onClick={() => fileInputRef.current.click()}
              title="Đổi ảnh"
            >
              <FaCamera />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="ap-name-block">
            <p className="ap-name">{info.name || "Chưa có tên"}</p>
            <p className="ap-email">{info.email}</p>
          </div>

          <div className="ap-badges">
            {roleLabel && (
              <span className="ap-badge ap-badge-role">
                {roleLabel.toUpperCase()}
              </span>
            )}
            <span className="ap-badge ap-badge-active">
              <FaUserCheck style={{ fontSize: 10 }} /> Đang hoạt động
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="ap-body">
          {/* LEFT: Thông tin */}
          <div className="ap-section">
            <div className="ap-section-hd">
              <div className="ap-section-icon ap-icon-info">
                <FaUser />
              </div>
              <p className="ap-section-title">Thông tin cá nhân</p>
            </div>
            <div className="ap-fields">
              <div className="ap-field">
                <label className="ap-label">Họ và tên</label>
                <input
                  className="ap-input"
                  type="text"
                  name="name"
                  value={info.name}
                  onChange={handleChangeInfo}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">Số điện thoại</label>
                <input
                  className="ap-input"
                  type="text"
                  name="phone"
                  value={info.phone}
                  onChange={handleChangeInfo}
                  placeholder="09xx xxx xxx"
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">Email — không thể thay đổi</label>
                <input
                  className="ap-input"
                  type="email"
                  value={info.email}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="ap-vdivider" />

          {/* RIGHT: Bảo mật */}
          <div className="ap-section">
            <div className="ap-section-hd">
              <div className="ap-section-icon ap-icon-sec">
                <FaShieldAlt />
              </div>
              <p className="ap-section-title">Đổi mật khẩu</p>
            </div>
            <div className="ap-fields">
              {/* Hiện tại */}
              <div className="ap-field">
                <label className="ap-label">Mật khẩu hiện tại</label>
                <div className="ap-pw-wrap">
                  <input
                    className="ap-input"
                    name="current"
                    type={showPw.current ? "text" : "password"}
                    value={pass.current}
                    onChange={handleChangePass}
                    placeholder="••••••••"
                  />
                  <button
                    className="ap-eye"
                    type="button"
                    onClick={() => togglePw("current")}
                  >
                    {showPw.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Mới */}
              <div className="ap-field">
                <label className="ap-label">Mật khẩu mới</label>
                <div className="ap-pw-wrap">
                  <input
                    className="ap-input"
                    name="new"
                    type={showPw.new ? "text" : "password"}
                    value={pass.new}
                    onChange={handleChangePass}
                    placeholder="••••••••"
                  />
                  <button
                    className="ap-eye"
                    type="button"
                    onClick={() => togglePw("new")}
                  >
                    {showPw.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {pass.new && (
                  <>
                    <div className="ap-str-bar">
                      <div
                        className="ap-str-fill"
                        style={{
                          width: `${strength.pct}%`,
                          background: strength.color,
                        }}
                      />
                    </div>
                    <div
                      className="ap-str-lbl"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </div>
                  </>
                )}
              </div>

              {/* Xác nhận */}
              <div className="ap-field">
                <label className="ap-label">Xác nhận mật khẩu</label>
                <div className="ap-pw-wrap">
                  <input
                    className="ap-input"
                    name="confirm"
                    type={showPw.confirm ? "text" : "password"}
                    value={pass.confirm}
                    onChange={handleChangePass}
                    placeholder="••••••••"
                    style={{
                      borderColor:
                        pass.confirm && pass.confirm !== pass.new
                          ? "#dc2626"
                          : undefined,
                    }}
                  />
                  <button
                    className="ap-eye"
                    type="button"
                    onClick={() => togglePw("confirm")}
                  >
                    {showPw.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {pass.confirm && pass.confirm !== pass.new && (
                  <div className="ap-mismatch">Mật khẩu không khớp</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ap-footer">
          <button
            className="ab ab-danger"
            onClick={handleChangePassword}
            disabled={!pass.current || !pass.new || !pass.confirm}
          >
            <FaKey style={{ fontSize: 11 }} /> Đổi mật khẩu
          </button>
          <button className="ab ab-dark" onClick={handleSaveInfo}>
            <FaSave style={{ fontSize: 11 }} /> Lưu thông tin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
