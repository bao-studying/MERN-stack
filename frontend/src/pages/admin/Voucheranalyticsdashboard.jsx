/**
 * pages/admin/VoucherAnalyticsDashboard.jsx
 * Dùng dưới dạng Modal nhúng vào trang AdminVoucher
 */
import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaTimes,
  FaExclamationTriangle, // Dùng icon này thay cho FaWarning bị thiếu
} from "react-icons/fa";
import axiosClient from "../../services/axiosClient";
import toast from "react-hot-toast";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

/* Lớp phủ mờ toàn màn hình */
.vad-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
}

/* Thùng chứa nội dung Modal */
.vad-modal {
  --bg: #f5f3ef;
  --surf: #fff;
  --bd: #e2ded6;
  --tx: #1c1917;
  --mu: #78716c;
  --su: #a8a29e;
  --ac: #c8490c;
  --gn: #15803d;
  --bl: #1d4ed8;
  --f: 'DM Sans', sans-serif;
  --m: 'DM Mono', monospace;
  font-family: var(--f);
  color: var(--tx);
  background: var(--bg);
  width: 100%;
  max-width: 1100px; /* Thu nhỏ bớt cho vừa form modal */
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  position: relative;
}

.vad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.vad-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.5px;
}

.vad-close {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 0.5px solid var(--bd);
  background: var(--surf);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--mu);
  transition: 0.15s;
}

.vad-close:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* KPI Cards */
.vad-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .vad-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}

.vad-kpi {
  background: var(--surf);
  border: 0.5px solid var(--bd);
  border-radius: 14px;
  padding: 16px;
}

.vad-kpi-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--su);
  margin: 0 0 8px;
}

.vad-kpi-value {
  font-size: 26px;
  font-weight: 600;
  font-family: var(--m);
  color: var(--tx);
  margin: 0 0 4px;
}

.vad-kpi-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--gn);
}

/* Sections */
.vad-section {
  background: var(--surf);
  border: 0.5px solid var(--bd);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}

.vad-section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vad-table-wrapper {
  overflow-x: auto;
}

.vad-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.vad-table thead th {
  padding: 10px 12px;
  text-align: left;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--su);
  border-bottom: 0.5px solid var(--bd);
  background: var(--bg);
  white-space: nowrap;
}

.vad-table tbody tr {
  border-bottom: 0.5px solid var(--bd);
}

.vad-table td {
  padding: 10px 12px;
  vertical-align: middle;
}

.vad-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.vad-badge-good { background: #dcfce7; color: #15803d; }
.vad-badge-warn { background: #fef9c3; color: #a16207; }

.vad-alert {
  background: #fef9c3;
  border: 0.5px solid #fcd34d;
  border-radius: 9px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 16px;
  font-size: 12px;
  color: #78350f;
}

.spin {
  width: 24px;
  height: 24px;
  border: 2.5px solid var(--bd);
  border-top-color: var(--ac);
  border-radius: 50%;
  animation: sp 0.7s linear infinite;
  margin: 40px auto;
}

@keyframes sp { to { transform: rotate(360deg); } }
`;

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);

const VoucherAnalyticsDashboard = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chỉ call API khi modal thực sự được mở
    if (!isOpen) return;

    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const r = await axiosClient.get("/vouchers/admin/dashboard/analytics");
        if (r.success) {
          setData(r);
        }
      } catch (e) {
        toast.error("Lỗi tải analytics");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [isOpen]);

  // Nếu modal không mở, không render gì cả
  if (!isOpen) return null;

  return (
    <div className="vad-overlay" onClick={onClose}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* onClick e.stopPropagation() để nhấn vào bên trong nội dung không bị đóng modal */}
      <div className="vad-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vad-header">
          <h1 className="vad-title">📊 Phân Tích Voucher</h1>
          <button className="vad-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="spin" />
        ) : !data ? (
          <p style={{ textAlign: "center", color: "var(--mu)" }}>
            Không có dữ liệu
          </p>
        ) : (
          <>
            {/* KPI Cards */}
            {/* Giữ nguyên logic tính toán của bạn... */}
            <div className="vad-kpis">
              <div className="vad-kpi">
                <p className="vad-kpi-label">Tổng Tiền Giảm</p>
                <p className="vad-kpi-value">
                  {fmt(data.kpi?.totalSpent || 0)}
                </p>
                <p className="vad-kpi-label" style={{ fontSize: 10 }}>
                  VNĐ
                </p>
              </div>

              <div className="vad-kpi">
                <p className="vad-kpi-label">Chi Phí Tạo</p>
                <p className="vad-kpi-value">{fmt(data.kpi?.totalCost || 0)}</p>
                <p className="vad-kpi-label" style={{ fontSize: 10 }}>
                  VNĐ
                </p>
              </div>

              <div className="vad-kpi">
                <p className="vad-kpi-label">ROI</p>
                <p
                  className="vad-kpi-value"
                  style={{
                    color: data.kpi?.roi >= 100 ? "var(--gn)" : "#dc2626",
                  }}
                >
                  {data.kpi?.roi}x
                </p>
                <p
                  className="vad-kpi-change"
                  style={{
                    color: data.kpi?.roi >= 100 ? "var(--gn)" : "#dc2626",
                  }}
                >
                  {data.kpi?.roi >= 100 ? "✓ Lãi" : "✗ Lỗ"}
                </p>
              </div>

              <div className="vad-kpi">
                <p className="vad-kpi-label">Voucher Hoạt Động</p>
                <p className="vad-kpi-value">{data.kpi?.activeVouchers || 0}</p>
                <p className="vad-kpi-label" style={{ fontSize: 10 }}>
                  Cái
                </p>
              </div>
            </div>

            {/* Warnings - Sửa icon lỗi từ FaWarning thành FaExclamationTriangle */}
            {data.vouchersNeedAttention?.length > 0 && (
              <div className="vad-alert">
                <div className="vad-alert-icon">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <strong>
                    ⚠️ Có {data.vouchersNeedAttention.length} voucher cần chú ý:
                  </strong>{" "}
                  Tỷ lệ sử dụng thấp (&lt;30%). Xem xét điều chỉnh hoặc xóa.
                </div>
              </div>
            )}

            {/* Top Vouchers */}
            {data.topVouchers?.length > 0 && (
              <div className="vad-section">
                <p className="vad-section-title">
                  <FaChartBar style={{ fontSize: 14, color: "var(--gn)" }} />
                  Top Vouchers (Lãi nhất)
                </p>
                <div className="vad-table-wrapper">
                  <table className="vad-table">
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Loại</th>
                        <th>Tặng</th>
                        <th>Dùng</th>
                        <th>Tỷ Lệ</th>
                        <th>Tổng Giảm</th>
                        <th>ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topVouchers.map((v) => (
                        <tr key={v._id}>
                          <td
                            style={{ fontFamily: "var(--m)", fontWeight: 500 }}
                          >
                            {v.code}
                          </td>
                          <td>
                            <span className="vad-badge vad-badge-good">
                              {v.type}
                            </span>
                          </td>
                          <td>{v.assignedTo?.length || 0}</td>
                          <td>{v.stats?.timesUsed || 0}</td>
                          <td>
                            {((v.stats?.usageRate || 0) * 100).toFixed(1)}%
                          </td>
                          <td style={{ fontFamily: "var(--m)" }}>
                            {fmt(v.stats?.totalRevenueImpact || 0)}đ
                          </td>
                          <td
                            style={{
                              fontFamily: "var(--m)",
                              color: "var(--gn)",
                            }}
                          >
                            {v.roi || 0}x ✓
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cần chú ý */}
            {data.vouchersNeedAttention?.length > 0 && (
              <div className="vad-section">
                <p className="vad-section-title">
                  <FaExclamationTriangle
                    style={{ fontSize: 14, color: "#a16207" }}
                  />
                  Cần Chú Ý (Tỷ lệ &lt;30%)
                </p>
                <div className="vad-table-wrapper">
                  <table className="vad-table">
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Tặng</th>
                        <th>Dùng</th>
                        <th>Tỷ Lệ</th>
                        <th>Tổng Giảm</th>
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.vouchersNeedAttention.map((v) => (
                        <tr key={v._id}>
                          <td
                            style={{ fontFamily: "var(--m)", fontWeight: 500 }}
                          >
                            {v.code}
                          </td>
                          <td>{v.assignedTo?.length || 0}</td>
                          <td>{v.stats?.timesUsed || 0}</td>
                          <td>
                            <span className="vad-badge vad-badge-warn">
                              {((v.stats?.usageRate || 0) * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ fontFamily: "var(--m)" }}>
                            {fmt(v.stats?.totalRevenueImpact || 0)}đ
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: 11,
                                color: "#a16207",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Vô hiệu hóa ${v.code}? Sẽ không tặng thêm cho khách.`,
                                  )
                                ) {
                                  // Code reload tùy thuộc vào cấu trúc của bạn
                                  window.location.reload();
                                }
                              }}
                            >
                              Vô hiệu hóa?
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="vad-section">
              <p className="vad-section-title">📈 Tóm Tắt</p>
              <div
                style={{ fontSize: 13, color: "var(--mu)", lineHeight: 1.8 }}
              >
                <p>
                  <strong>Tổng doanh thu từ voucher:</strong>{" "}
                  {fmt(data.kpi?.totalSpent || 0)}đ
                </p>
                <p>
                  <strong>Hiệu suất:</strong> ROI {data.kpi?.roi}x (
                  {data.kpi?.roi >= 100 ? "✓ Lãi lớn" : "✗ Cần tối ưu"})
                </p>
                <p>
                  <strong>Gợi ý:</strong>{" "}
                  {data.vouchersNeedAttention?.length > 0
                    ? `Vô hiệu hóa ${data.vouchersNeedAttention.length} voucher tỷ lệ thấp để cắt giảm chi phí.`
                    : "Tất cả vouchers đều hoạt động tốt!"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoucherAnalyticsDashboard;
