import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaChartBar,
  FaCogs,
  FaShieldAlt,
  FaLeaf,
  FaBookOpen,
  FaUserTie,
  FaChevronDown,
  FaComments,
  FaTicketAlt,
  FaChartPie,
  FaLayerGroup,
  FaCube,
  FaClipboardList,
  FaRegEnvelope,
  FaPercentage,
  FaTags,
  FaRegNewspaper,
  FaEnvelope,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

/* ─────────────────────────────────────────────────────────────────────────────
   ENHANCED DROPDOWN STYLES - Smooth Animations + Underline
───────────────────────────────────────────────────────────────────────────── */
const DROPDOWN_STYLES = `
  .sb-dropdown-wrap {
    position: relative;
    margin: 6px 12px;
  }

  /* Trigger Button - Glassmorphic Style */
  .sb-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: rgba(17, 24, 39, 0.85);
    text-decoration: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.6);
    position: relative;
    overflow: hidden;
  }

  /* Animated background on hover */
  .sb-dropdown-trigger::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .sb-dropdown-trigger:hover::before {
    left: 0;
  }

  /* Content positioning */
  .sb-dropdown-trigger > * {
    position: relative;
    z-index: 1;
  }

  /* Hover state */
  .sb-dropdown-trigger:hover {
    background: rgba(255, 255, 255, 0.5);
    border-color: rgba(59, 130, 246, 0.3);
    color: rgba(15, 23, 42, 0.95);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
    transform: translateX(4px);
  }

  /* Active parent state with glow */
  .sb-dropdown-trigger.active-parent {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
    color: rgba(15, 23, 42, 0.95);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
  }

  .sb-dropdown-trigger.active-parent::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 3px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0), rgba(59, 130, 246, 1), rgba(59, 130, 246, 0));
    border-radius: 2px;
  }

  /* Icon styling */
  .sb-dropdown-icon { 
    font-size: 16px; 
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sb-dropdown-trigger:hover .sb-dropdown-icon {
    transform: scale(1.1) rotate(5deg);
    color: rgba(59, 130, 246, 0.9);
  }

  .sb-dropdown-trigger.active-parent .sb-dropdown-icon {
    color: rgba(59, 130, 246, 0.95);
  }

  .sb-dropdown-label { 
    flex: 1;
    letter-spacing: 0.3px;
  }
  
  /* Arrow animation */
  .sb-dropdown-arrow {
    font-size: 10px;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.65;
    color: rgba(17, 24, 39, 0.6);
  }
  
  .sb-dropdown-wrap.open .sb-dropdown-arrow {
    transform: rotate(180deg);
    opacity: 1;
    color: rgba(59, 130, 246, 0.8);
  }

  /* Submenu animation */
  .sb-submenu {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
  }

  .sb-dropdown-wrap.open .sb-submenu {
    max-height: 500px;
    opacity: 1;
  }

  .sb-submenu-inner {
    padding: 8px 0 8px 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Sub-link styling */
  .sb-sub-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    color: rgba(17, 24, 39, 0.75);
    text-decoration: none;
    border-radius: 10px;
    font-size: 13px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    border-left: 3px solid transparent;
    margin-left: -3px;
  }

  /* Sub-link hover with underline animation */
  .sb-sub-link::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.6));
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .sb-sub-link > * {
    position: relative;
    z-index: 1;
  }

  .sb-sub-link:hover {
    color: rgba(15, 23, 42, 0.95);
    background: rgba(59, 130, 246, 0.08);
    padding-left: 18px;
    border-left-color: rgba(59, 130, 246, 0.5);
  }

  .sb-sub-link:hover::before {
    width: 100%;
  }

  /* Active sub-link state */
  .sb-sub-link.active {
    color: rgba(59, 130, 246, 0.95);
    background: rgba(59, 130, 246, 0.12);
    font-weight: 600;
    border-left-color: rgba(59, 130, 246, 0.8);
    box-shadow: inset 0 0 15px rgba(59, 130, 246, 0.08);
  }

  .sb-sub-link.active::before {
    width: 100%;
    background: linear-gradient(90deg, rgba(59, 130, 246, 1), rgba(139, 92, 246, 1));
  }

  .sb-sub-link.active:hover {
    padding-left: 18px;
  }

  /* Icon for sub-links */
  .sb-sub-icon {
    font-size: 13px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sb-sub-link:hover .sb-sub-icon {
    transform: translateX(2px);
    color: rgba(59, 130, 246, 0.8);
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   ENHANCED SIDEBAR STYLES - Glassmorphism + Gradient Background
───────────────────────────────────────────────────────────────────────────── */
const SIDEBAR_STYLES = `
  .admin-sidebar {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 20px;
    box-shadow: 
      0 20px 60px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    overflow: hidden;
    color: rgba(17, 24, 39, 0.95);
    display: flex;
    flex-direction: column;
  }

  /* Logo section with gradient accent */
  .admin-sidebar .sidebar-logo {
    color: rgba(17, 24, 39, 0.95);
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    padding: 24px 24px !important;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    position: relative;
    overflow: hidden;
  }

  .admin-sidebar .sidebar-logo::before {
    content: '';
    position: absolute;
    top: 0;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .admin-sidebar .sidebar-logo > * {
    position: relative;
    z-index: 1;
  }

  /* Main menu section */
  .admin-sidebar .sidebar-menu {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
  }

  /* Menu category label */
  .admin-sidebar .text-white-50 {
    color: rgba(15, 23, 42, 0.55) !important;
    font-size: 11px;
    letter-spacing: 0.8px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 12px 24px !important;
    margin: 8px 0 4px 0 !important;
  }

  /* Regular sidebar links */
  .admin-sidebar .sidebar-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px !important;
    color: rgba(17, 24, 39, 0.8);
    text-decoration: none;
    margin: 6px 12px;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    border-left: 3px solid transparent;
    font-weight: 500;
  }

  /* Animated background for sidebar links */
  .admin-sidebar .sidebar-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .admin-sidebar .sidebar-link > * {
    position: relative;
    z-index: 1;
  }

  /* Hover state */
  .admin-sidebar .sidebar-link:hover {
    color: rgba(15, 23, 42, 0.95);
    background: rgba(59, 130, 246, 0.08);
    border-left-color: rgba(59, 130, 246, 0.5);
    padding-left: 24px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    transform: translateX(2px);
  }

  .admin-sidebar .sidebar-link:hover::before {
    left: 0;
  }

  /* Active state with underline animation */
  .admin-sidebar .sidebar-link.active {
    background: rgba(59, 130, 246, 0.12);
    color: rgba(59, 130, 246, 0.95);
    border-left-color: rgba(59, 130, 246, 0.8);
    font-weight: 600;
    box-shadow: 
      inset 0 0 15px rgba(59, 130, 246, 0.08),
      0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .admin-sidebar .sidebar-link.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 3px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0), rgba(59, 130, 246, 1), rgba(59, 130, 246, 0));
    border-radius: 2px;
    animation: slideUnderline 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* Icon hover animation */
  .admin-sidebar .sidebar-link:hover span:first-child {
    transform: scale(1.15) rotate(5deg);
    color: rgba(59, 130, 246, 0.9);
  }

  .admin-sidebar .sidebar-link.active span:first-child {
    color: rgba(59, 130, 246, 0.95);
  }

  /* Scrollbar styling */
  .admin-sidebar .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .admin-sidebar .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .admin-sidebar .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
    transition: background 0.3s;
  }

  .admin-sidebar .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.6);
  }

  /* Footer section */
  .admin-sidebar .sidebar-footer {
    border-top: 1px solid rgba(15, 23, 42, 0.08);
    padding: 12px 24px !important;
    text-align: center;
    color: rgba(15, 23, 42, 0.55);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.3px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
  }

  /* Mobile overlay */
  .admin-sidebar .sidebar-overlay {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* Animation keyframes */
  @keyframes slideUnderline {
    from {
      width: 0;
      left: 50%;
    }
    to {
      width: calc(100% - 40px);
      left: 20px;
    }
  }

  /* Smooth transition for dropdown */
  .sb-dropdown-wrap {
    animation: fadeInSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }

  @keyframes fadeInSlide {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   DROPDOWN MENU ITEM - Enhanced
───────────────────────────────────────────────────────────────────────────── */
const DropdownMenuItem = ({
  trigger,
  children,
  isParentActive,
  closeSidebar,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`sb-dropdown-wrap${open ? " open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger row */}
      <div
        className={`sb-dropdown-trigger${isParentActive ? " active-parent" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sb-dropdown-icon">{trigger.icon}</span>
        <span className="sb-dropdown-label">{trigger.label}</span>
        <FaChevronDown className="sb-dropdown-arrow" />
      </div>

      {/* Submenu */}
      <div className="sb-submenu">
        <div className="sb-submenu-inner">{children}</div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ADMIN SIDEBAR - Main Component
───────────────────────────────────────────────────────────────────────────── */
const AdminSidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  /* ── Account sub-items ── */
  const accountSubItems = [
    {
      path: "/admin/customers?type=customer",
      label: "Khách hàng",
      icon: <FaUsers />,
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/customers?type=staff",
      label: "Đội ngũ",
      icon: <FaUserTie />,
      roles: ["admin", "manager"],
    },
  ];

  /* Is any account sub-page currently active? */
  const isAccountActive = location.pathname.startsWith("/admin/customers");

  const canShowAccount = user && ["admin", "manager"].includes(user.role);

  return (
    <>
      {/* Inject styles */}
      <style dangerouslySetInnerHTML={{ __html: DROPDOWN_STYLES }} />
      <style dangerouslySetInnerHTML={{ __html: SIDEBAR_STYLES }} />

      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={closeSidebar} />
      )}

      <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo Section */}
        <div className="sidebar-logo">
          <span>📊 Dashboard</span>
        </div>

        {/* Main Menu */}
        <nav className="sidebar-menu custom-scrollbar">
          <div className="text-white-50 small fw-bold text-uppercase mb-2">
            ☰ Menu Chính
          </div>

          {/* ── Group 1a: Main items ── */}
          {[
            {
              path: "/admin",
              label: "Dashboard",
              icon: <FaChartPie />,
              roles: ["admin", "manager", "staff"],
              end: true,
            },
            {
              path: "/admin/categories",
              label: "Danh mục",
              icon: <FaLayerGroup />,
              roles: ["admin", "manager"],
            },
            {
              path: "/admin/brands",
              label: "Thương hiệu",
              icon: <FaTags />,
              roles: ["admin", "manager"],
            },
            {
              path: "/admin/products",
              label: "Sản phẩm",
              icon: <FaCube />,
              roles: ["admin", "manager"],
            },
            {
              path: "/admin/orders",
              label: "Đơn hàng",
              icon: <FaClipboardList />,
              roles: ["admin", "manager", "staff"],
            },
            {
              path: "/admin/messages",
              label: "Tin nhắn",
              icon: <FaRegEnvelope />,
              roles: ["admin", "manager", "staff"],
            },
          ].map((item) => {
            if (!user || !item.roles.includes(user.role)) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={!!item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={closeSidebar}
              >
                <span className="fs-5">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* ── Tài Khoản Dropdown ── */}
          {canShowAccount && (
            <>
              <div className="text-white-50 small fw-bold text-uppercase mt-4 mb-2">
                👤 Tài Khoản
              </div>
              <DropdownMenuItem
                trigger={{ label: "Tài Khoản", icon: <FaUsers /> }}
                isParentActive={isAccountActive}
                closeSidebar={closeSidebar}
              >
                {accountSubItems.map((sub) => {
                  if (!user || !sub.roles.includes(user.role)) return null;
                  const subType = new URLSearchParams(
                    sub.path.split("?")[1],
                  ).get("type");
                  const currentType = new URLSearchParams(location.search).get(
                    "type",
                  );
                  const isSubActive =
                    location.pathname === "/admin/customers" &&
                    currentType === subType;
                  return (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={`sb-sub-link${isSubActive ? " active" : ""}`}
                      onClick={closeSidebar}
                    >
                      <span className="sb-sub-icon">{sub.icon}</span>
                      {sub.label}
                    </NavLink>
                  );
                })}
              </DropdownMenuItem>
            </>
          )}

          {/* ── Group 1b: Additional items ── */}
          <div className="text-white-50 small fw-bold text-uppercase mt-4 mb-2">
            ⚙️ Cấu Hình
          </div>
          {[
            {
              path: "/admin/vouchers",
              label: "Voucher",
              icon: <FaPercentage />,
              roles: ["admin", "manager"],
            },
            {
              path: "/admin/blogs",
              label: "Blog",
              icon: <FaRegNewspaper />,
              roles: ["admin", "manager"],
            },
            {
              path: "/admin/email-builder",
              icon: <FaEnvelope />,
              label: "Email cấu hình",
              roles: ["admin", "manager"],
            },
          ].map((item) => {
            if (!user || !item.roles.includes(user.role)) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={!!item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={closeSidebar}
              >
                <span className="fs-5">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">✨ Made By Duong Gia Bao</div>
      </div>
    </>
  );
};

export default AdminSidebar;
