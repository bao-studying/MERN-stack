import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import HomePage from "../pages/client/HomePage";
import ProductDetailPage from "../pages/client/ProductDetailPage";
import CartPage from "../pages/client/CartPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import UserProfilePage from "../pages/client/UserProfilePage";
import ProductListPage from "../pages/client/ProductListPage";
import CheckoutPage from "../pages/client/CheckoutPage";
import AboutPage from "../pages/client/AboutPage";
import OffersPage from "../pages/client/OffersPage";

import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage";
import ProductManager from "../pages/admin/ProductManager";
import OrderManager from "../pages/admin/OrderManager";
import CustomerManager from "../pages/admin/CustomerManager";
import StatsPage from "../pages/admin/StatsPage";
import SettingsPage from "../pages/admin/SettingsPage";
import SystemLogPage from "../pages/admin/SystemLogPage";
import AdminProfile from "../pages/admin/AdminProfile";
import CategoryManager from "../pages/admin/CategoryManager";
import SuccessPage from "../pages/client/SuccessPage";

import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import ProtectedRoute from "./ProtectedRoute";
import AdminMessages from "../../src/pages/admin/AdminMessages";
import AdminVoucherManager from "../pages/admin/AdminVoucher";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Client Routes - Dùng MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/checkout/success" element={<SuccessPage />} />
        <Route path="/offers" element={<OffersPage />} />
      </Route>

      {/* Auth Routes - Dùng AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* ADMIN ROUTES - PHÂN QUYỀN Ở ĐÂY */}

      {/* 1. Dashboard: Ai là nhân viên trở lên đều vào được Layout Admin */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />
        }
      >
        <Route path="/admin" element={<AdminLayout />}>
          {/* Dashboard: Staff xem được (hoặc chặn nếu muốn) */}
          <Route index element={<DashboardPage />} />

          <Route path="profile" element={<AdminProfile />} />

          {/* 2. Quản lý Sản phẩm: Chỉ Admin và Manager */}
          <Route
            element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
          >
            <Route path="products" element={<ProductManager />} />
            <Route path="categories" element={<CategoryManager />} />
          </Route>
          <Route path="vouchers" element={<AdminVoucherManager />} />
          {/* 3. Quản lý Đơn hàng: Cả 3 đều được vào */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />
            }
          >
            <Route path="orders" element={<OrderManager />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>

          {/* 4. Quản lý Khách hàng*/}
          <Route
            element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
          >
            <Route path="customers" element={<CustomerManager />} />
          </Route>

          {/* 5. Thống kê: Chỉ Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="stats" element={<StatsPage />} />
          </Route>

          {/* 6. Cấu hình: Chỉ Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="settings" element={<SettingsPage />} />
            <Route path="logs" element={<SystemLogPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
