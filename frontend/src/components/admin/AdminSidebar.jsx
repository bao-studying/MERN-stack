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
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES — scoped, inject once
───────────────────────────────────────────────────────────────────────────── */
const DROPDOWN_STYLES = `
  .sb-dropdown-wrap {
    position: relative;
    margin: 4px 8px;
  }

  /* Chỉ hover chính nó mới đổi màu, không bị dính từ submenu */
  .sb-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    color: rgba(255,255,255,.7);
    text-decoration: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
  }

  /* Hiệu ứng hover riêng biệt cho trigger */
  .sb-dropdown-trigger:hover {
    background: rgba(255,255,255,.1);
    color: #fff;
  }

  /* Trạng thái khi menu con đang được chọn (Active Path) */
  .sb-dropdown-trigger.active-parent {
    background: rgba(255,255,255,.05);
    color: #fff;
    border: 1px solid rgba(255,255,255,.1);
  }

  .sb-dropdown-icon { font-size: 18px; flex-shrink: 0; }
  .sb-dropdown-label { flex: 1; }
  
  .sb-dropdown-arrow {
    font-size: 10px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: .5;
  }
  
  /* Xoay mũi tên khi mở menu */
  .sb-dropdown-wrap.open .sb-dropdown-arrow {
    transform: rotate(180deg);
    opacity: 1;
  }

  .sb-submenu {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease-in-out;
  }

  .sb-dropdown-wrap.open .sb-submenu {
    max-height: 500px; /* Tăng lên để chứa đủ nội dung */
  }

  .sb-submenu-inner {
    padding: 5px 0 5px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sb-sub-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    color: rgba(255,255,255,.5);
    text-decoration: none;
    border-radius: 8px;
    font-size: 13px;
    transition: all 0.2s;
  }

  .sb-sub-link:hover {
    color: #fff;
    background: rgba(255,255,255,.08);
  }

  .sb-sub-link.active {
    color: #fff;
    background: rgba(255,255,255,.15);
    font-weight: 600;
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   DROPDOWN MENU ITEM
   — hover to open (CSS), click to toggle (JS fallback for touch devices)
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
   ADMIN SIDEBAR
───────────────────────────────────────────────────────────────────────────── */
const AdminSidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  /* ── Flat menu items (unchanged structure) ── */
  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      roles: ["admin", "manager", "staff"],
    },
    {
      path: "/admin/categories",
      label: "Danh mục",
      icon: <FaBookOpen />,
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/products",
      label: "Sản phẩm",
      icon: <FaBox />,
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/orders",
      label: "Đơn hàng",
      icon: <FaShoppingBag />,
      roles: ["admin", "manager", "staff"],
    },
    {
      path: "/admin/messages",
      label: "Tin nhắn",
      icon: <FaComments />,
      roles: ["admin", "manager", "staff"],
    },
    // "Tài Khoản" is replaced by the dropdown below — keep roles for reference
    // { path: "/admin/customers", label: "Tài Khoản", icon: <FaUsers />, roles: ["admin","manager"] },
    {
      path: "/admin/stats",
      label: "Thống kê",
      icon: <FaChartBar />,
      roles: ["admin"],
    },
    {
      path: "/admin/settings",
      label: "Cấu hình",
      icon: <FaCogs />,
      roles: ["admin"],
    },
    {
      path: "/admin/logs",
      label: "Nhật ký",
      icon: <FaShieldAlt />,
      roles: ["admin"],
    },
  ];

  /* ── Sub-links for Tài Khoản dropdown ── */
  const accountSubItems = [
    {
      /* Customers: filter by role=customer via URL param
         CustomerManager reads searchParams.get("type") to filter */
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
      {/* inject dropdown styles once */}
      <style dangerouslySetInnerHTML={{ __html: DROPDOWN_STYLES }} />

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={closeSidebar} />
      )}

      <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo text-white">Dashboard</div>

        {/* Menu */}
        <nav className="sidebar-menu custom-scrollbar">
          <div className="text-white-50 small fw-bold text-uppercase mb-2 px-3">
            Menu Chính
          </div>

          {/* ── Group 1: luôn hiện với đủ role ── */}
          {[
            {
              path: "/admin",
              label: "Dashboard",
              icon: <FaTachometerAlt />,
              roles: ["admin", "manager", "staff"],
              end: true,
            },
            {
              path: "/admin/categories",
              label: "Danh mục",
              icon: <FaBookOpen />,
              roles: ["admin", "manager"],
            },
            {
              path: "/admin/products",
              label: "Sản phẩm",
              icon: <FaBox />,
              roles: ["admin", "manager"],
            },
            {
              path: "/admin/orders",
              label: "Đơn hàng",
              icon: <FaShoppingBag />,
              roles: ["admin", "manager", "staff"],
            },
            {
              path: "/admin/messages",
              label: "Tin nhắn",
              icon: <FaComments />,
              roles: ["admin", "manager", "staff"],
            },
            {
              path: "/admin/vouchers",
              label: "Voucher",
              icon: <FaTicketAlt />,
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

          {/* ── Tài Khoản dropdown — chỉ render 1 lần, đúng vị trí ── */}
          {canShowAccount && (
            <DropdownMenuItem
              trigger={{ label: "Tài Khoản", icon: <FaUsers /> }}
              isParentActive={isAccountActive}
              closeSidebar={closeSidebar}
            >
              {accountSubItems.map((sub) => {
                if (!user || !sub.roles.includes(user.role)) return null;
                const subType = new URLSearchParams(sub.path.split("?")[1]).get(
                  "type",
                );
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
          )}

          {/* ── Group 2: admin-only items ── */}
          {[
            {
              path: "/admin/stats",
              label: "Thống kê",
              icon: <FaChartBar />,
              roles: ["admin"],
            },
            {
              path: "/admin/settings",
              label: "Cấu hình",
              icon: <FaCogs />,
              roles: ["admin"],
            },
            {
              path: "/admin/logs",
              label: "Nhật ký",
              icon: <FaShieldAlt />,
              roles: ["admin"],
            },
          ].map((item) => {
            if (!user || !item.roles.includes(user.role)) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
        <div className="p-3 border-top border-secondary border-opacity-25 text-center text-white-50 small">
          Made By Duong Gia Bao
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
