import React from "react";
import { NavLink, Link } from "react-router-dom";
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
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

const AdminSidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();

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
      path: "/admin/customers",
      label: "Khách hàng",
      icon: <FaUsers />,
      roles: ["admin", "manager"],
    },
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

  return (
    <>
      {/* Overlay cho Mobile khi mở menu */}
      {isOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={closeSidebar}></div>
      )}

      <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo text-white">Dashboard</div>

        {/* Menu */}
        <nav className="sidebar-menu custom-scrollbar">
          <div className="text-white-50 small fw-bold text-uppercase mb-2 px-3">
            Menu Chính
          </div>
          {menuItems.map((item, index) => {
            if (user && item.roles.includes(user.role)) {
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  end={index === 0} // Chỉ Dashboard cần exact match
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeSidebar} // Đóng menu khi click (mobile)
                >
                  <span className="fs-5">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              );
            }
            return null;
          })}
        </nav>

        {/* Footer nhỏ bên dưới sidebar */}
        <div className="p-3 border-top border-secondary border-opacity-25 text-center text-white-50 small">
          © 2025 EcoStore System
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
