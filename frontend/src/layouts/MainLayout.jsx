import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../components/common/Header.jsx"; // Import Header mới
import Footer from "../components/common/Footer";
import FloatingChat from "../context/FloatingChat";


const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header mới */}
      <Header />

      {/* Nội dung chính */}
      <main className="flex-grow-1">
        <Outlet />
    <FloatingChat />  
      </main>

      {/* Footer (Giữ tạm hoặc tách ra file riêng sau) */}
      <Footer />
    </div>
  );
};

export default MainLayout;
