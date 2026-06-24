import React, { useState } from "react";
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
  FaBell,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useAdminTheme } from "../../context/useAdminTheme";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────────────────
   PREMIUM HEADER STYLES - Glassmorphism + Smooth Animations
───────────────────────────────────────────────────────────────────────────── */
const HEADER_PREMIUM_STYLES = `
  /* Main Header Container */
  .admin-header-floating {
    margin: 16px 24px;
    padding: 12px 28px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.88) 100%);
    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    border-radius: 20px;
    border: 1px solid rgba(15, 23, 42, 0.1);
    box-shadow: 
      0 20px 50px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 16px;
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 64px;
  }

  .admin-header-floating:hover {
    box-shadow: 
      0 25px 60px rgba(15, 23, 42, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
  }

  /* ───────────────────────────────────────────────────────
     LEFT SECTION: BRAND & TOGGLE
  ─────────────────────────────────────────────────────── */
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* Toggle Sidebar Button */
  .header-toggle {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: rgba(59, 130, 246, 0.8);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .header-toggle:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    transform: scale(1.05) rotate(5deg);
    color: rgba(59, 130, 246, 0.95);
  }

  .header-toggle:active {
    transform: scale(0.95);
  }

  /* Breadcrumb Brand */
  .breadcrumb-custom {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.95);
    letter-spacing: -0.5px;
    animation: fadeInSlide 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .breadcrumb-custom .brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    display: grid;
    place-items: center;
    color: rgba(59, 130, 246, 0.8);
    font-size: 18px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .breadcrumb-custom:hover .brand-icon {
    transform: rotate(8deg) scale(1.05);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%);
    border-color: rgba(59, 130, 246, 0.4);
  }

  .breadcrumb-custom span {
    font-size: 16px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(59, 130, 246, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ───────────────────────────────────────────────────────
     CENTER SECTION: SEARCH BAR
  ─────────────────────────────────────────────────────── */
  .header-search {
    flex: 1;
    max-width: 400px;
    margin: 0 20px;
  }

  .search-island {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 14px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1.5px solid rgba(59, 130, 246, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  .search-island:focus-within {
    background: #fff;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 
      0 0 0 4px rgba(59, 130, 246, 0.1),
      0 8px 20px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  .search-island input {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    font-size: 0.9rem;
    color: rgba(15, 23, 42, 0.8);
    font-weight: 500;
  }

  .search-island input::placeholder {
    color: rgba(100, 116, 139, 0.6);
  }

  .search-island .search-icon {
    color: rgba(100, 116, 139, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 16px;
  }

  .search-island:focus-within .search-icon {
    color: rgba(59, 130, 246, 0.8);
  }

  /* ───────────────────────────────────────────────────────
     RIGHT SECTION: ACTIONS & PROFILE
  ─────────────────────────────────────────────────────── */
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Action Circle Button */
  .action-circle {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.6);
    color: rgba(100, 116, 139, 0.8);
    border: 1px solid rgba(15, 23, 42, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    font-size: 18px;
  }

  .action-circle::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .action-circle:hover::before {
    left: 100%;
  }

  .action-circle:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(139, 92, 246, 0.85) 100%);
    color: #fff;
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
    transform: translateY(-3px) rotate(6deg);
  }

  .action-circle:active {
    transform: scale(0.92);
  }

  /* Divider */
  .header-divider {
    height: 24px;
    border-left: 1px solid rgba(15, 23, 42, 0.1);
    margin: 0 4px;
  }

  /* ───────────────────────────────────────────────────────
     USER PILL DROPDOWN
  ─────────────────────────────────────────────────────── */
  .user-pill {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.7) 100%);
    padding: 6px 14px 6px 6px;
    border-radius: 50px;
    border: 1.5px solid rgba(59, 130, 246, 0.2);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-pill:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 10px 28px rgba(59, 130, 246, 0.15);
    transform: translateY(-3px);
  }

  .user-pill:active {
    transform: scale(0.95);
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2.5px solid rgba(59, 130, 246, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
  }

  .user-pill:hover .user-avatar {
    border-color: rgba(59, 130, 246, 0.95);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .user-name {
    font-weight: 700;
    color: rgba(15, 23, 42, 0.95);
    font-size: 0.85rem;
    letter-spacing: -0.3px;
  }

  .user-role {
    font-size: 0.65rem;
    color: rgba(100, 116, 139, 0.8);
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* ───────────────────────────────────────────────────────
     DROPDOWN MENU
  ─────────────────────────────────────────────────────── */
  .dropdown-menu-enhanced {
    border: 1px solid rgba(59, 130, 246, 0.15) !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 252, 0.95) 100%) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 18px !important;
    padding: 12px !important;
    box-shadow: 
      0 20px 50px rgba(15, 23, 42, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
    margin-top: 12px !important;
    min-width: 240px !important;
  }

  .dropdown-header-pill {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 14px;
    padding: 14px 16px !important;
    margin-bottom: 10px;
  }

  .dropdown-header-greeting {
    color: rgba(100, 116, 139, 0.8);
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .dropdown-header-email {
    color: rgba(100, 116, 139, 0.6);
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Dropdown Items */
  .dropdown-item-enhanced {
    border-radius: 12px !important;
    padding: 12px 14px !important;
    margin: 4px 0 !important;
    display: flex !important;
    align-items: center;
    gap: 12px;
    color: rgba(15, 23, 42, 0.85) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    position: relative;
    overflow: hidden;
    font-weight: 600;
  }

  .dropdown-item-enhanced::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .dropdown-item-enhanced > * {
    position: relative;
    z-index: 1;
  }

  .dropdown-item-enhanced:hover {
    background: rgba(59, 130, 246, 0.1) !important;
    transform: translateX(4px);
    color: rgba(59, 130, 246, 0.95) !important;
  }

  .dropdown-item-enhanced:hover::before {
    left: 100%;
  }

  .dropdown-item-enhanced.text-danger:hover {
    background: rgba(239, 68, 68, 0.1) !important;
    color: rgba(239, 68, 68, 0.95) !important;
  }

  /* Item Icon */
  .dropdown-item-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  /* Divider */
  .dropdown-divider-enhanced {
    background: linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.1), transparent) !important;
    margin: 8px 0 !important;
  }

  /* ───────────────────────────────────────────────────────
     ANIMATIONS
  ─────────────────────────────────────────────────────── */
  @keyframes fadeInSlide {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes popIn {
    0% { 
      opacity: 0; 
      transform: scale(0.92) translateY(-10px); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }

  @keyframes pulse-glow {
    0%, 100% { 
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
    }
    50% { 
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
  }

  .animate-pop-in {
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .admin-header-floating {
      margin: 12px 16px;
      padding: 10px 16px;
      min-height: 56px;
    }

    .header-search {
      display: none !important;
    }

    .breadcrumb-custom span {
      font-size: 14px;
    }

    .user-pill {
      padding: 4px 8px 4px 4px;
    }

    .user-info {
      display: none;
    }

    .action-circle {
      width: 38px;
      height: 38px;
      font-size: 16px;
    }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   ADMIN HEADER COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const AdminHeader = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const demoAvatar =
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

  const displayName = user?.name || "Admin User";
  const displayRole = user?.role || "Administrator";
  const displayAvatar = user?.avatarUrl || demoAvatar;
  const displayEmail = user?.email || "admin@example.com";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HEADER_PREMIUM_STYLES }} />

      <header className="admin-header-floating">
        {/* LEFT: BRAND & TOGGLE */}
        <div className="header-left">
          <button
            className="header-toggle d-lg-none"
            onClick={toggleSidebar}
            title="Mở sidebar"
          >
            <FaBars size={20} />
          </button>

          <div className="breadcrumb-custom d-none d-md-flex">
            <div className="brand-icon">
              <FaShapes />
            </div>
            <span>Dương Gia Bảo</span>
          </div>
        </div>

        {/* CENTER: SEARCH BAR */}
        <div className="header-search d-none d-lg-block">
          <div className="search-island">
            <FaSearch className="search-icon" />
            <Form.Control
              type="text"
              placeholder="Tìm kiếm..."
              className="flex-1"
            />
          </div>
        </div>

        {/* RIGHT: ACTIONS & PROFILE */}
        <div className="header-right">
          {/* Home Button */}
          <Link
            to="/"
            className="action-circle text-decoration-none"
            title="Trang chủ"
          >
            <FaHome size={18} />
          </Link>

          {/* Notifications Button */}
          <button className="action-circle" title="Thông báo">
            <div style={{ position: "relative" }}>
              <FaBell size={18} />
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "18px",
                  height: "18px",
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  color: "#fff",
                  border: "2px solid #fff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                3
              </span>
            </div>
          </button>

          {/* Settings Button */}
          <button className="action-circle" title="Cài đặt">
            <FaCog size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            className="action-circle"
            onClick={toggleTheme}
            title={theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
          >
            {theme === "light" ? (
              <FaMoon size={18} />
            ) : (
              <FaSun size={18} className="text-warning" />
            )}
          </button>

          {/* Divider */}
          <div className="header-divider d-none d-md-block"></div>

          {/* User Pill Dropdown */}
          <Dropdown
            align="end"
            show={showDropdown}
            onToggle={(show) => setShowDropdown(show)}
          >
            <Dropdown.Toggle
              as="div"
              className="user-pill"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img src={displayAvatar} alt="Admin" className="user-avatar" />
              <div className="user-info d-none d-md-flex">
                <div className="user-name">{displayName}</div>
                <div className="user-role">{displayRole}</div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-enhanced animate-pop-in">
              {/* Header Greeting */}
              <div className="dropdown-header-pill">
                <div className="dropdown-header-greeting">
                  👋 Xin chào, {displayName.split(" ").pop()}!
                </div>
                <div className="dropdown-header-email">{displayEmail}</div>
              </div>

              {/* Profile Item */}
              <Dropdown.Item
                as={Link}
                to="/admin/profile"
                className="dropdown-item-enhanced"
              >
                <div
                  className="dropdown-item-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
                    color: "rgba(34, 197, 94, 0.8)",
                  }}
                >
                  <FaUserCircle size={16} />
                </div>
                <span>Hồ sơ cá nhân</span>
              </Dropdown.Item>

              {/* Settings Item */}
              <Dropdown.Item
                as={Link}
                to="/admin/settings"
                className="dropdown-item-enhanced"
              >
                <div
                  className="dropdown-item-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
                    color: "rgba(99, 102, 241, 0.8)",
                  }}
                >
                  <FaCog size={16} />
                </div>
                <span>Cài đặt hệ thống</span>
              </Dropdown.Item>

              {/* Help Item */}
              <Dropdown.Item className="dropdown-item-enhanced">
                <div
                  className="dropdown-item-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))",
                    color: "rgba(139, 92, 246, 0.8)",
                  }}
                >
                  <FaQuestionCircle size={16} />
                </div>
                <span>Trợ giúp & hỗ trợ</span>
              </Dropdown.Item>

              <Dropdown.Divider className="dropdown-divider-enhanced" />

              {/* Logout Item */}
              <Dropdown.Item
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="dropdown-item-enhanced text-danger"
              >
                <div
                  className="dropdown-item-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
                    color: "rgba(239, 68, 68, 0.8)",
                  }}
                >
                  <FaSignOutAlt size={16} />
                </div>
                <span>Đăng xuất</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
