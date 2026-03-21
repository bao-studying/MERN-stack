import React from "react";
import { Form, Dropdown, Button } from "react-bootstrap";
import {
  FaBars,
  FaSearch,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaShapes,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useAdminTheme } from "../../context/useAdminTheme";
import { Link } from "react-router-dom";

/* ── STYLES ĐỘT PHÁ CHO HEADER ── */
const HEADER_DOPAMINE_STYLES = `
  .admin-header-floating {
    margin: 15px 25px;
    padding: 10px 25px;
    background: rgba(242, 18, 18, 0.81);
    backdrop-filter: blur(15px) saturate(180%);
    -webkit-backdrop-filter: blur(15px) saturate(180%);
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 15px;
    z-index: 1000;
    transition: all 0.3s ease;
  }

  /* Search Bar Hiện Đại */
  .search-island {
    background: rgba(241, 245, 249, 0.8);
    border-radius: 18px;
    padding: 5px 15px;
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    transition: 0.3s;
    width: 300px;
  }
  .search-island:focus-within {
    background: #fff;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    width: 350px;
  }
  .search-island input {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    font-size: 0.9rem;
    color: #1e293b;
  }

  /* User Pill */
  .user-pill {
    background: #fff;
    padding: 5px 15px 5px 6px;
    border-radius: 50px;
    border: 1px solid #f1f5f9;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  }
  .user-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
  }

  /* Action Buttons */
  .action-circle {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: #fff;
    color: #64748b;
    border: 1px solid #f1f5f9;
    transition: 0.3s;
    position: relative;
  }
  .action-circle:hover {
    background: #6366f1;
    color: #fff;
    transform: rotate(8deg);
  }

  .breadcrumb-custom {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.5px;
  }

  /* Animation cho Dropdown */
  .animate-pop-in {
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.9) translateY(-10px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const AdminHeader = ({ toggleSidebar }) => {
  /* ── GIỮ NGUYÊN 100% LOGIC ── */
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();

  const demoAvatar =
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

  const displayName = user?.name || "Admin User";
  const displayRole = user?.role || "Administrator";
  const displayAvatar = user?.avatarUrl || demoAvatar;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HEADER_DOPAMINE_STYLES }} />

      <header className="admin-header-floating">
        {/* 1. LEFT: BRAND & TOGGLE */}
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="link"
            className="p-0 d-lg-none"
            onClick={toggleSidebar}
          >
            <FaBars size={22} color="#1e293b" />
          </Button>
          <div className="breadcrumb-custom d-none d-md-flex">
            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
              <FaShapes size={18} />
            </div>
            <span className="fs-5">Dương Gia Bảo</span>
          </div>
        </div>

        {/* 2. MIDDLE: MODERN SEARCH */}
        <div className="header-search d-none d-lg-block">
          <div className="search-island">
            <FaSearch className="text-muted me-2" />
            <Form.Control type="text" placeholder="Hệ thống đang sẵn sàng..." />
          </div>
        </div>

        {/* 3. RIGHT: ACTIONS & PROFILE */}
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/"
            className="action-circle text-decoration-none"
            title="Về trang chủ"
          >
            <FaHome size={18} />
          </Link>

          <button
            className="action-circle"
            onClick={toggleTheme}
            title="Chế độ hiển thị"
          >
            {theme === "light" ? (
              <FaMoon size={18} />
            ) : (
              <FaSun size={18} className="text-warning" />
            )}
          </button>

          <div className="ms-2 me-1 h-25 border-end border-light"></div>

          {/* User Pill Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              as="div"
              className="user-pill d-flex align-items-center gap-2"
            >
              <img
                src={displayAvatar}
                alt="Admin"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #6366f1",
                }}
              />
              <div className="d-none d-md-block text-start lh-1">
                <div
                  className="fw-bold small text-dark"
                  style={{ fontSize: "0.85rem" }}
                >
                  {displayName}
                </div>
                <span
                  className="text-muted"
                  style={{ fontSize: "0.65rem", fontWeight: 600 }}
                >
                  {displayRole.toUpperCase()}
                </span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="border-0 shadow-lg mt-3 rounded-4 animate-pop-in p-2"
              style={{ minWidth: "220px" }}
            >
              <div className="px-3 py-3 mb-2 rounded-3 bg-light">
                <p className="m-0 small text-muted fw-bold">Xin chào, Bảo!</p>
                <small className="text-truncate d-block">{user?.email}</small>
              </div>

              <Dropdown.Item
                as={Link}
                to="/admin/profile"
                className="rounded-3 py-2 d-flex align-items-center gap-3"
              >
                <div className="p-2 rounded-2 bg-success bg-opacity-10 text-success">
                  <FaUserCircle size={14} />
                </div>
                <span className="fw-bold small">Hồ sơ cá nhân</span>
              </Dropdown.Item>

              <Dropdown.Divider className="my-2" />

              <Dropdown.Item
                onClick={logout}
                className="rounded-3 py-2 text-danger d-flex align-items-center gap-3 fw-bold"
              >
                <div className="p-2 rounded-2 bg-danger bg-opacity-10">
                  <FaSignOutAlt size={14} />
                </div>
                <span className="small">Đăng xuất hệ thống</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
