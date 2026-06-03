import React, { useState, useEffect } from "react";

const SepayPaymentModal = ({
  isOpen,
  onClose,
  orderNumber,
  totalAmount,
  statusMessage,
}) => {
  if (!isOpen) return null;

  const BANK_ID = "Sacombank";
  const ACCOUNT_NO = import.meta.env.VITE_SACOMBANK_ACCOUNT?.trim();
  const hasAccount = Boolean(ACCOUNT_NO);

  const qrUrl = hasAccount
    ? `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-qr_only.png?amount=${totalAmount}&addInfo=${orderNumber}`
    : "";

  return (
    <div className="sepay-modal-overlay">
      <style>{`
        @keyframes liquidPopIn {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(20px);
            filter: blur(10px);
          }
          60% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes liquidShine {
          0%, 100% {
            opacity: 0;
            transform: translateX(-100%);
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(-3px);
          }
          50% {
            transform: translateY(3px);
          }
        }

        .sepay-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 16px;
          pointer-events: auto;
        }

        .sepay-modal-bg-click {
          position: absolute;
          inset: 0;
          cursor: pointer;
        }

        .sepay-modal-content {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.88) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 28px;
          padding: 28px 24px;
          box-shadow: 
            0 8px 32px rgba(15, 23, 42, 0.1),
            0 32px 64px rgba(15, 23, 42, 0.06),
            inset 1px 1px 0 rgba(255, 255, 255, 0.8);
          animation: liquidPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          overflow: hidden;
          position: relative;
        }

        /* Liquid background effect */
        .sepay-modal-content::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          animation: float 6s ease-in-out infinite;
          pointer-events: none;
        }

        .sepay-modal-content::after {
          content: '';
          position: absolute;
          bottom: -50%;
          left: -10%;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(35px);
          animation: float 8s ease-in-out infinite reverse;
          pointer-events: none;
        }

        .sepay-modal-inner {
          position: relative;
          z-index: 2;
        }

        .sepay-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .sepay-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: rgba(15, 23, 42, 0.6);
          margin-bottom: 8px;
          display: block;
        }

        .sepay-title {
          font-size: 24px;
          font-weight: 700;
          color: rgba(15, 23, 42, 0.95);
          margin: 0;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .sepay-qr-container {
          width: 160px;
          height: 160px;
          margin: 20px auto;
          border-radius: 20px;
          overflow: hidden;
          border: 2px solid rgba(59, 130, 246, 0.2);
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 12px 32px rgba(15, 23, 42, 0.08),
            inset 0 1px 2px rgba(255, 255, 255, 0.8);
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .sepay-qr-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: liquidShine 3s ease-in-out infinite;
          pointer-events: none;
          border-radius: 20px;
        }

        .sepay-qr-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          position: relative;
          z-index: 1;
        }

        .sepay-amount {
          background: linear-gradient(
            135deg,
            rgba(34, 197, 94, 0.08) 0%,
            rgba(59, 130, 246, 0.08) 100%
          );
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 18px;
          padding: 14px 16px;
          margin-bottom: 16px;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .sepay-amount-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(15, 23, 42, 0.5);
          margin-bottom: 4px;
          display: block;
        }

        .sepay-amount-value {
          font-size: 22px;
          font-weight: 800;
          color: rgba(34, 197, 94, 0.9);
          letter-spacing: -0.5px;
        }

        .sepay-info-box {
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 18px;
          padding: 12px 14px;
          margin-bottom: 14px;
          backdrop-filter: blur(10px);
        }

        .sepay-info-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(15, 23, 42, 0.5);
          margin-bottom: 4px;
          display: block;
        }

        .sepay-info-value {
          font-size: 13px;
          font-weight: 600;
          color: rgba(15, 23, 42, 0.85);
          word-break: break-all;
        }

        .sepay-status {
          background: linear-gradient(
            135deg,
            rgba(34, 197, 94, 0.1) 0%,
            rgba(34, 197, 94, 0.05) 100%
          );
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 18px;
          padding: 14px 16px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
        }

        .sepay-status-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(34, 197, 94, 0.7);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sepay-status-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.8);
          animation: float 2s ease-in-out infinite;
        }

        .sepay-status-message {
          font-size: 12px;
          font-weight: 500;
          color: rgba(34, 197, 94, 0.85);
          line-height: 1.4;
        }

        .sepay-hint {
          font-size: 11px;
          color: rgba(15, 23, 42, 0.6);
          text-align: center;
          padding: 10px 12px;
          background: rgba(59, 130, 246, 0.03);
          border-radius: 14px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .sepay-btn-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.05);
          border: 1px solid rgba(15, 23, 42, 0.1);
          color: rgba(15, 23, 42, 0.6);
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
          font-weight: bold;
        }

        .sepay-btn-close:hover {
          background: rgba(15, 23, 42, 0.1);
          color: rgba(15, 23, 42, 0.8);
        }

        .sepay-btn-close:active {
          transform: scale(0.9);
        }

        .sepay-error-box {
          background: linear-gradient(
            135deg,
            rgba(220, 38, 38, 0.1) 0%,
            rgba(220, 38, 38, 0.05) 100%
          );
          border: 1px solid rgba(220, 38, 38, 0.25);
          border-radius: 18px;
          padding: 12px 14px;
          text-align: center;
        }

        .sepay-error-label {
          font-size: 12px;
          font-weight: 700;
          color: rgba(220, 38, 38, 0.8);
          margin-bottom: 4px;
        }

        .sepay-error-text {
          font-size: 11px;
          color: rgba(220, 38, 38, 0.7);
          line-height: 1.4;
        }

        .sepay-error-text code {
          background: rgba(220, 38, 38, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 10px;
        }

        @media (max-width: 480px) {
          .sepay-modal-content {
            max-width: 100%;
            padding: 24px 20px;
            border-radius: 24px;
          }

          .sepay-title {
            font-size: 20px;
          }

          .sepay-amount-value {
            font-size: 20px;
          }

          .sepay-qr-container {
            width: 140px;
            height: 140px;
          }
        }
      `}</style>

      <div className="sepay-modal-bg-click" onClick={onClose} />

      <div className="sepay-modal-content">
        <button className="sepay-btn-close" onClick={onClose}>
          ✕
        </button>

        <div className="sepay-modal-inner">
          {/* Header */}
          <div className="sepay-header">
            <span className="sepay-label">Quét & thanh toán</span>
            <h2 className="sepay-title">SePay QR</h2>
          </div>

          {/* QR Code */}
          <div className="sepay-qr-container">
            <img
              src={qrUrl || "https://placehold.co/160x160?text=QR"}
              alt="Mã QR Thanh Toán SePay"
              className="sepay-qr-img"
            />
          </div>

          {/* Số tiền */}
          <div className="sepay-amount">
            <span className="sepay-amount-label">Số tiền</span>
            <div className="sepay-amount-value">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(totalAmount)}
            </div>
          </div>

          {/* Info */}
          <div className="sepay-info-box">
            <span className="sepay-info-label">Mã đơn hàng</span>
            <div className="sepay-info-value">
              {orderNumber || "Đang tạo..."}
            </div>
          </div>

          {/* Status */}
          <div className="sepay-status">
            <div className="sepay-status-label">
              <span className="sepay-status-dot" />
              Trạng thái
            </div>
            <div className="sepay-status-message">
              {statusMessage || "Đang chờ xác nhận..."}
            </div>
          </div>

          {/* Hint */}
          <div className="sepay-hint">
            ⏱️ Giữ màn hình mở và chờ xác nhận. Thường 1-2 phút.
          </div>

          {/* Error if no account */}
          {!hasAccount && (
            <div className="sepay-error-box">
              <div className="sepay-error-label">⚠️ Chưa cấu hình</div>
              <div className="sepay-error-text">
                Thêm <code>VITE_SACOMBANK_ACCOUNT</code> vào <code>.env</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SepayPaymentModal;
