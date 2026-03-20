import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import userApi from "../services/user.service";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token")); // 1. THÊM: State để giữ token trong bộ nhớ (Memory)
  const [loading, setLoading] = useState(true);
 
  const logout = useCallback(() => {
    setUser(null);
    setToken(null); // 2. THÊM: Xóa token khi logout
    localStorage.removeItem("currentUser");
    navigate("/login");
  }, [navigate]);

  const login = useCallback((userData, userToken) => {
    // 3. THÊM: Nhận thêm userToken
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
    setToken(userToken); // 4. THÊM: Lưu token vào state
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await userApi.getProfile();

        if (res.success) {
          const userData = res.data;
          // Logic xử lý role cũ của Bảo giữ nguyên
          if (userData.role && typeof userData.role === "object") {
            userData.role = userData.role.name;
          }

          setUser(userData);
          // 5. THÊM: Lấy token từ API trả về (nếu API /me của Bảo có trả về token kèm theo)
          // Nếu API không trả về token, Bảo nên sửa Backend để trả về token ở đây
          if (res.token) setToken(res.token);

          localStorage.setItem("currentUser", JSON.stringify(userData));
        } else {
          throw new Error("Xác thực thất bại");
        }
      } catch {
        console.log("User chưa đăng nhập hoặc phiên hết hạn.");
        setUser(null);
        setToken(null); // THÊM
        localStorage.removeItem("currentUser");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
