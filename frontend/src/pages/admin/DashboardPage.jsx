import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Spinner, Alert, Form, Button } from "react-bootstrap";
import {
  FaShoppingBag,
  FaUsers,
  FaCoins,
  FaGem,
  FaCrown,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAdminTheme } from "../../context/useAdminTheme";
import orderApi from "../../services/order.service";
import axiosClient from "../../services/axiosClient";
import "../../assets/styles/admin.css";

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES — scoped to .db-root
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .db-root {
    --bg:      #f5f3ef;
    --surf:    #ffffff;
    --border:  #e2ded6;
    --text:    #1c1917;
    --muted:   #78716c;
    --subtle:  #a8a29e;
    --accent:  #c8490c;
    --gold:    #b45309;
    --green:   #15803d;
    --blue:    #1d4ed8;
    --font:    'DM Sans', sans-serif;
    --mono:    'DM Mono', monospace;
    --r:       12px;
    font-family: var(--font);
    color: var(--text);
  }

  /* ── PAGE HEADER ── */
  .db-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 16px;
  }
  .db-header-left { display: flex; align-items: center; gap: 10px; }
  .db-crown-wrap {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: #fef3c7;
    border: 0.5px solid #fde68a;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--gold);
    flex-shrink: 0;
  }
  .db-title {
    font-size: 19px; font-weight: 600;
    letter-spacing: -.4px; margin: 0 0 1px;
    color: var(--text);
  }
  .db-subtitle { font-size: 12px; color: var(--muted); margin: 0; }
  .db-date {
    font-size: 12px; font-family: var(--mono);
    color: var(--subtle); white-space: nowrap;
  }

  /* ── ERROR ── */
  .db-error {
    background: #fef2f2; border: 0.5px solid #fecaca;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: #dc2626; margin-bottom: 16px;
  }

  /* ── LOADING ── */
  .db-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 300px; gap: 12px;
  }
  .db-spinner {
    width: 32px; height: 32px;
    border: 2.5px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: db-spin .8s linear infinite;
  }
  @keyframes db-spin { to { transform: rotate(360deg); } }
  .db-loading-txt { font-size: 13px; color: var(--muted); }

  /* ══════════════════════════════════════════════════
     BENTO GRID
  ══════════════════════════════════════════════════ */
  .db-bento {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 12px;
    margin-bottom: 12px;
  }

  /* ── BASE CELL ── */
  .db-cell {
    background: var(--surf);
    border: 0.5px solid var(--border);
    border-radius: var(--r);
    overflow: hidden;
    animation: db-fadein .3s ease both;
  }
  @keyframes db-fadein {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: none; }
  }
  .db-cell:nth-child(1) { animation-delay: .00s; }
  .db-cell:nth-child(2) { animation-delay: .04s; }
  .db-cell:nth-child(3) { animation-delay: .08s; }
  .db-cell:nth-child(4) { animation-delay: .12s; }
  .db-cell:nth-child(5) { animation-delay: .16s; }
  .db-cell:nth-child(6) { animation-delay: .20s; }
  .db-cell:nth-child(7) { animation-delay: .24s; }

  /* ── GRID PLACEMENT ── */

  /* Row 1: Area chart (col 1-3, row 1-2) + 2 KPI cards stacked (col 4, row 1-2) */
  .db-cell-area {
    grid-column: 1 / 4;
    grid-row: 1 / 3;
    display: flex; flex-direction: column;
  }

  /* KPI tall (right column, row 1) */
  .db-cell-kpi-r1 {
    grid-column: 4;
    grid-row: 1;
  }

  /* KPI tall (right column, row 2) */
  .db-cell-kpi-r2 {
    grid-column: 4;
    grid-row: 2;
  }

  /* Row 3: 2 KPI side-by-side (col 1-2) + Pie chart (col 3-4) */
  .db-cell-kpi-b1 {
    grid-column: 1 / 2;
    grid-row: 3;
  }
  .db-cell-kpi-b2 {
    grid-column: 2 / 3;
    grid-row: 3;
  }
  .db-cell-pie {
    grid-column: 3 / 5;
    grid-row: 3;
    display: flex; flex-direction: column;
    min-height: 220px;
  }

  /* ── CELL HEADER ── */
  .db-cell-hd {
    padding: 14px 16px 10px;
    border-bottom: 0.5px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .db-cell-hd-title {
    font-size: 13px; font-weight: 600;
    color: var(--text); margin: 0;
    letter-spacing: -.2px;
  }
  .db-cell-hd-sub {
    font-size: 11px; color: var(--subtle);
  }

  /* 🆕 Nút "Xem thêm" trên mỗi cell, dẫn đến trang quản lý liên quan */
  .db-more-btn {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10.5px; font-weight: 500; color: var(--muted);
    background: transparent; border: 0.5px solid var(--border);
    border-radius: 20px; padding: 3px 9px; cursor: pointer;
    transition: background .12s, color .12s; white-space: nowrap; flex-shrink: 0;
  }
  .db-more-btn:hover { background: var(--bg); color: var(--text); }
  .db-more-btn svg { font-size: 9px; }

  /* ── AREA CHART ── */
  .db-chart-body {
    flex: 1;
    padding: 12px 8px 8px;
    min-height: 0;
  }

  /* ── KPI CARD (tall — right column) ── */
  .db-kpi-tall {
    padding: 18px 16px;
    display: flex; flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
  .db-kpi-tall-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 8px;
  }
  .db-kpi-icon {
    width: 36px; height: 36px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
  }
  .db-kpi-icon-gold   { background: #fef3c7; color: var(--gold); }
  .db-kpi-icon-green  { background: #dcfce7; color: var(--green); }
  .db-kpi-icon-blue   { background: #dbeafe; color: var(--blue); }
  .db-kpi-icon-red    { background: #fce7f3; color: #be185d; }

  .db-kpi-label {
    font-size: 10px; font-weight: 600;
    letter-spacing: .5px; text-transform: uppercase;
    color: var(--subtle); margin: 0 0 4px;
  }
  .db-kpi-value {
    font-size: 22px; font-weight: 600;
    font-family: var(--mono);
    color: var(--text); line-height: 1.1;
    letter-spacing: -.5px;
  }
  .db-kpi-sub {
    font-size: 11px; color: var(--subtle); margin-top: 10px;
  }

  /* ── KPI CARD (small — bottom row) ── */
  .db-kpi-small {
    padding: 16px;
    display: flex; flex-direction: column;
    gap: 10px;
  }
  .db-kpi-small-top {
    display: flex; align-items: center;
    justify-content: space-between;
  }
  .db-kpi-small-val {
    font-size: 24px; font-weight: 600;
    font-family: var(--mono);
    color: var(--text); letter-spacing: -.5px;
  }
  .db-kpi-small-lbl {
    font-size: 11px; font-weight: 600;
    letter-spacing: .4px; text-transform: uppercase;
    color: var(--subtle);
  }
  .db-kpi-small-sub {
    font-size: 11px; color: var(--subtle);
  }

  /* ── PIE SECTION ── */
  .db-pie-body {
    flex: 1; padding: 10px 16px;
    display: flex; align-items: center;
    gap: 12px; min-height: 180px;
  }
  .db-pie-chart-wrap { flex-shrink: 0; width: 160px; height: 160px; }
  .db-pie-legend { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .db-pie-legend-item { display: flex; align-items: center; gap: 8px; }
  .db-pie-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .db-pie-legend-name {
    font-size: 11px; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
  }
  .db-pie-legend-val {
    font-size: 11px; font-family: var(--mono);
    font-weight: 500; color: var(--text); flex-shrink: 0;
  }

  /* ══════════════════════════════════════════════════
     RECENT ORDERS TABLE
  ══════════════════════════════════════════════════ */
  .db-orders-card {
    background: var(--surf);
    border: 0.5px solid var(--border);
    border-radius: var(--r);
    overflow: hidden;
    animation: db-fadein .3s ease .28s both;
  }
  .db-orders-hd {
    padding: 13px 18px;
    border-bottom: 0.5px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .db-orders-title {
    font-size: 13px; font-weight: 600;
    color: var(--text); margin: 0;
    display: flex; align-items: center; gap: 7px;
  }
  .db-orders-title svg { font-size: 12px; color: var(--muted); }
  .db-view-all {
    font-size: 11px; font-weight: 500;
    padding: 3px 10px; border-radius: 6px;
    border: 0.5px solid var(--border);
    background: var(--bg); color: var(--muted);
    cursor: pointer; transition: background .12s;
  }
  .db-view-all:hover { background: var(--border); color: var(--text); }

  .db-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .db-table thead th {
    padding: 9px 14px;
    font-size: 10px; font-weight: 600;
    letter-spacing: .5px; text-transform: uppercase;
    color: var(--subtle);
    border-bottom: 0.5px solid var(--border);
    background: var(--bg);
    white-space: nowrap;
  }
  .db-table tbody tr {
    border-bottom: 0.5px solid var(--border);
    transition: background .1s;
  }
  .db-table tbody tr:last-child { border-bottom: none; }
  .db-table tbody tr:hover { background: #faf9f7; }
  .db-table td {
    padding: 11px 14px;
    color: var(--text);
    vertical-align: middle;
  }
  .db-order-id {
    font-family: var(--mono); font-size: 12px;
    font-weight: 500; color: var(--accent);
  }
  .db-order-amount {
    font-family: var(--mono); font-size: 13px;
    font-weight: 500; color: var(--green);
  }
  .db-order-product {
    white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; max-width: 160px;
    display: block; color: var(--muted); font-size: 12px;
  }
  .db-badge {
    display: inline-block;
    padding: 2px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 500;
  }
  .db-badge-delivered { background: #dcfce7; color: #15803d; }
  .db-badge-shipping   { background: #dbeafe; color: #1d4ed8; }
  .db-badge-confirmed  { background: #e0e7ff; color: #4338ca; }
  .db-badge-pending    { background: #fef9c3; color: #a16207; }
  .db-badge-cancelled  { background: #f4f2ee; color: var(--muted); }

  .db-empty {
    padding: 48px 20px; text-align: center;
    color: var(--subtle); font-size: 13px;
  }
  .db-empty-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--border); margin: 0 auto 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; opacity: .5;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 860px) {
    .db-bento { grid-template-columns: 1fr 1fr; }
    .db-cell-area  { grid-column: 1 / 3; grid-row: 1 / 2; }
    .db-cell-kpi-r1{ grid-column: 1;     grid-row: 2; }
    .db-cell-kpi-r2{ grid-column: 2;     grid-row: 2; }
    .db-cell-kpi-b1{ grid-column: 1;     grid-row: 3; }
    .db-cell-kpi-b2{ grid-column: 2;     grid-row: 3; }
    .db-cell-pie   { grid-column: 1 / 3; grid-row: 4; }
  }
  @media (max-width: 540px) {
    .db-bento { grid-template-columns: 1fr; }
    .db-cell-area,
    .db-cell-kpi-r1,.db-cell-kpi-r2,
    .db-cell-kpi-b1,.db-cell-kpi-b2,
    .db-cell-pie { grid-column: 1; grid-row: auto; }
  }

  /* ══════════════════════════════════════════════════
     🆕 ROW 2: STATUS DONUT + ĐƠN KẸT + SEGMENT
  ══════════════════════════════════════════════════ */
  .db-row2 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: 900px) { .db-row2 { grid-template-columns: 1fr; } }

  .db-card2 {
    background: var(--surf);
    border: 0.5px solid var(--border);
    border-radius: var(--r);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* status donut legend */
  .db-status-legend { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; flex: 1; }
  .db-status-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .db-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .db-status-name { flex: 1; color: var(--muted); }
  .db-status-count { font-family: var(--mono); font-weight: 500; color: var(--text); }

  /* stuck orders */
  .db-stuck-hd-extra {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: var(--muted);
  }
  .db-stuck-input {
    width: 40px; padding: 3px 6px; border: 0.5px solid var(--border);
    border-radius: 6px; font-size: 12px; font-family: var(--mono);
    text-align: center; background: var(--bg); color: var(--text); outline: none;
  }
  .db-stuck-input:focus { border-color: var(--accent); }
  .db-stuck-list { display: flex; flex-direction: column; gap: 0; flex: 1; overflow-y: auto; max-height: 220px; }
  .db-stuck-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 16px; border-bottom: 0.5px solid var(--border); gap: 8px;
  }
  .db-stuck-item:last-child { border-bottom: none; }
  .db-stuck-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .db-stuck-num { font-family: var(--mono); font-size: 12px; color: var(--accent); font-weight: 500; }
  .db-stuck-name { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
  .db-stuck-days { font-size: 10px; font-family: var(--mono); padding: 2px 7px; border-radius: 20px; background: #fef2f2; color: #dc2626; white-space: nowrap; }
  .db-stuck-empty { padding: 24px 16px; text-align: center; color: var(--subtle); font-size: 12px; flex: 1; display: flex; align-items: center; justify-content: center; }

  /* segment breakdown */
  .db-seg-list { display: flex; flex-direction: column; gap: 0; flex: 1; }
  .db-seg-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; border-bottom: 0.5px solid var(--border); gap: 8px; }
  .db-seg-row:last-child { border-bottom: none; }
  .db-seg-name { font-size: 12px; padding: 2px 9px; border-radius: 20px; font-weight: 500; white-space: nowrap; }
  .db-seg-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
  .db-seg-revenue { font-family: var(--mono); font-size: 12px; font-weight: 500; color: var(--text); }
  .db-seg-count { font-size: 10px; color: var(--subtle); }
  .db-seg-loading { padding: 24px 16px; text-align: center; color: var(--subtle); font-size: 12px; flex: 1; display: flex; align-items: center; justify-content: center; }
`;

const fmtMoney = (n) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} triệu`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
};

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS BADGE
   🆕 Khớp đúng enum thật trong Order model:
   ["pending", "confirmed", "shipping", "delivered", "cancelled"]
   (KHÔNG có "completed" — bản cũ check "completed" nên không bao giờ match)
───────────────────────────────────────────────────────────────────────────── */
const STATUS_LABELS = {
  pending: { text: "Chờ xác nhận", cls: "db-badge-pending" },
  confirmed: { text: "Đã xác nhận", cls: "db-badge-confirmed" },
  shipping: { text: "Đang giao", cls: "db-badge-shipping" },
  delivered: { text: "Đã giao", cls: "db-badge-delivered" },
  cancelled: { text: "Đã hủy", cls: "db-badge-cancelled" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_LABELS[status] || {
    text: status || "Không rõ",
    cls: "db-badge-cancelled",
  };
  return <span className={`db-badge ${s.cls}`}>{s.text}</span>;
};

/* ─────────────────────────────────────────────────────────────────────────────
   KPI TALL CARD
   🆕 Bỏ phần trend %/so sánh tuần trước (không có dữ liệu thật) —
   thay bằng 1 dòng phụ mô tả ngắn (sub), không bịa số.
───────────────────────────────────────────────────────────────────────────── */
const KpiTall = ({ item, onMore }) => {
  const iconCls =
    {
      gold: "db-kpi-icon-gold",
      success: "db-kpi-icon-green",
      primary: "db-kpi-icon-blue",
      danger: "db-kpi-icon-red",
    }[item.color] || "db-kpi-icon-gold";

  return (
    <div className="db-kpi-tall">
      <div className="db-kpi-tall-top">
        <div>
          <p className="db-kpi-label">{item.title}</p>
          <div className="db-kpi-value">{item.value}</div>
        </div>
        <div className={`db-kpi-icon ${iconCls}`}>{item.icon}</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {item.sub && <div className="db-kpi-sub">{item.sub}</div>}
        {onMore && (
          <button
            className="db-more-btn"
            onClick={onMore}
            style={{ marginTop: 10 }}
          >
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   KPI SMALL CARD (bottom row)
   🆕 Bỏ thanh progress giả (fillPct cứng) — chỉ hiển thị số liệu + dòng phụ.
───────────────────────────────────────────────────────────────────────────── */
const KpiSmall = ({ item, onMore }) => {
  const iconCls =
    {
      gold: "db-kpi-icon-gold",
      success: "db-kpi-icon-green",
      primary: "db-kpi-icon-blue",
      danger: "db-kpi-icon-red",
    }[item.color] || "db-kpi-icon-gold";

  return (
    <div className="db-kpi-small">
      <div className="db-kpi-small-top">
        <div>
          <div className="db-kpi-small-lbl">{item.title}</div>
          <div className="db-kpi-small-val">{item.value}</div>
        </div>
        <div className={`db-kpi-icon ${iconCls}`}>{item.icon}</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {item.sub && <div className="db-kpi-small-sub">{item.sub}</div>}
        {onMore && (
          <button className="db-more-btn" onClick={onMore}>
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   🆕 NÚT "XEM THÊM" — dẫn đến trang quản lý liên quan tới card đó
───────────────────────────────────────────────────────────────────────────── */
const MoreBtn = ({ onClick, label = "Xem thêm" }) => (
  <button className="db-more-btn" onClick={onClick}>
    {label} <FaArrowRight />
  </button>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const DashboardPage = () => {
  const { theme } = useAdminTheme();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🆕 Tổng số khách hàng — lấy thật từ API /users (totalUsers), không hard-code
  const [totalUsers, setTotalUsers] = useState(null);
  const [usersLoading, setUsersLoading] = useState(true);

  // 🆕 Ngưỡng số ngày để coi 1 đơn pending/confirmed là "kẹt" — tùy chỉnh được
  const [stuckThresholdDays, setStuckThresholdDays] = useState(3);

  // 🆕 Doanh thu theo nhóm khách hàng (segment) — lấy từ endpoint batch mới
  const [segmentRevenue, setSegmentRevenue] = useState(null);
  const [segmentLoading, setSegmentLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await orderApi.getAllOrders({
          limit: 20,
          sort: "-createdAt",
        });

        let fetchedOrders = [];
        if (Array.isArray(result)) {
          fetchedOrders = result;
        } else if (result && typeof result === "object") {
          fetchedOrders = result.orders || result.data || [];
        }

        const safeOrders = Array.isArray(fetchedOrders) ? fetchedOrders : [];
        setOrders(safeOrders);

        // 🆕 Sau khi có orders, gọi batch segment cho các khách có userId
        // (đơn khách vãng lai không có userId sẽ tự bị loại ở backend)
        fetchSegments(safeOrders);
      } catch (err) {
        setError("Không tải được đơn hàng: " + (err.message || "Lỗi server"));
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    // 🆕 Đếm tổng số khách hàng thật, dùng GET /users?limit=1 chỉ để đọc totalUsers
    // (theo user.controller.js: res.json({ users, totalPages, currentPage, totalUsers }))
    const fetchUserCount = async () => {
      try {
        setUsersLoading(true);
        const result = await axiosClient.get("/users", {
          params: { limit: 1, page: 1 },
        });
        setTotalUsers(
          typeof result?.totalUsers === "number" ? result.totalUsers : null,
        );
      } catch (err) {
        console.error("Fetch user count error:", err);
        setTotalUsers(null);
      } finally {
        setUsersLoading(false);
      }
    };

    // 🆕 Lấy segment (nhóm khách) cho từng userId xuất hiện trong orders,
    // rồi cộng doanh thu (đơn delivered) theo từng nhóm.
    const fetchSegments = async (ordersList) => {
      try {
        setSegmentLoading(true);

        const userIds = [
          ...new Set(
            ordersList
              .map((o) => o.userId?._id || o.userId)
              .filter((id) => id && typeof id === "string"),
          ),
        ];

        if (userIds.length === 0) {
          setSegmentRevenue({});
          return;
        }

        const result = await axiosClient.post(
          "/vouchers/admin/users/segments-batch",
          { userIds },
        );

        const segments = result?.segments || {};

        // Cộng doanh thu (chỉ đơn delivered) theo từng segment
        const revenueBySegment = {};
        ordersList
          .filter((o) => o.status === "delivered")
          .forEach((o) => {
            const id = o.userId?._id || o.userId;
            const seg = segments[id] || "unknown";
            if (!revenueBySegment[seg]) {
              revenueBySegment[seg] = { revenue: 0, count: 0 };
            }
            revenueBySegment[seg].revenue += o.totalAmount_cents || 0;
            revenueBySegment[seg].count += 1;
          });

        setSegmentRevenue(revenueBySegment);
      } catch (err) {
        console.error("Fetch segments error:", err);
        setSegmentRevenue(null);
      } finally {
        setSegmentLoading(false);
      }
    };

    fetchOrders();
    fetchUserCount();
  }, []);

  // 1. Tạo State lưu ngày (Mặc định lọc 7 ngày gần nhất)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // 2. Logic lọc dữ liệu cho biểu đồ (Dùng useMemo để không bị lag khi render)
  const filteredRevenueData = useMemo(() => {
    const startTime = new Date(dateRange.start).getTime();
    const endTime = new Date(dateRange.end).setHours(23, 59, 59, 999);

    const revenueByDay = orders.reduce((acc, order) => {
      const orderTime = new Date(order.createdAt).getTime();
      if (orderTime >= startTime && orderTime <= endTime) {
        const dateLabel = new Date(order.createdAt).toLocaleDateString(
          "vi-VN",
          {
            day: "2-digit",
            month: "2-digit",
          },
        );
        acc[dateLabel] = (acc[dateLabel] || 0) + (order.totalAmount_cents || 0);
      }
      return acc;
    }, {});

    return Object.entries(revenueByDay).map(([name, doanhthu]) => ({
      name,
      doanhthu,
    }));
  }, [orders, dateRange]);

  // ================== TÍNH TOÁN AN TOÀN ==================
  const safeReduce = (arr, callback, initialValue) => {
    if (!Array.isArray(arr) || arr.length === 0) return initialValue;
    return arr.reduce(callback, initialValue);
  };

  // 🆕 Chỉ tính doanh thu từ đơn đã giao thành công (delivered) — khớp đúng
  // enum status thật, tránh cộng cả đơn pending/cancelled vào "doanh thu".
  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const totalRevenue = safeReduce(
    deliveredOrders,
    (sum, o) => sum + (o.totalAmount_cents || 0),
    0,
  );
  const totalOrders = orders.length || 0;
  const deliveredCount = deliveredOrders.length;
  const completionRate =
    totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

  // 🆕 AOV — Giá trị đơn trung bình (Average Order Value), tính từ đơn đã giao,
  // thay cho "Lợi Nhuận Hiếm: 842 triệu" (số bịa, không có nguồn).
  const aov =
    deliveredCount > 0 ? Math.round(totalRevenue / deliveredCount) : 0;

  const kpiData = [
    {
      title: "Doanh Thu (đã giao)",
      value: fmtMoney(totalRevenue),
      icon: <FaCoins />,
      sub: `${deliveredCount} đơn đã giao thành công`,
      color: "gold",
    },
    {
      title: "Đơn Hàng",
      value: totalOrders.toLocaleString(),
      icon: <FaShoppingBag />,
      sub: `${completionRate}% đã giao thành công`,
      color: "success",
    },
    {
      title: "Khách Hàng",
      value: usersLoading
        ? "..."
        : totalUsers !== null
          ? totalUsers.toLocaleString()
          : "—",
      icon: <FaUsers />,
      sub: "Tổng số tài khoản trong hệ thống",
      color: "primary",
    },
    {
      title: "Giá Trị Đơn TB",
      value:
        aov > 0
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(aov)
          : "—",
      icon: <FaGem />,
      sub: "Trung bình mỗi đơn đã giao (AOV)",
      color: "danger",
    },
  ];

  // Top set bán chạy
  const setSales = safeReduce(
    orders,
    (acc, order) => {
      if (!order?.items) return acc;
      order.items.forEach((item) => {
        const name = item.name || "Unknown Set";
        acc[name] = (acc[name] || 0) + (item.quantity || 1);
      });
      return acc;
    },
    {},
  );

  const setData = Object.entries(setSales)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const COLORS = ["#d4af37", "#ff6b6b", "#4ecdc4", "#45b7d1"];

  // 🆕 Phân bố trạng thái đơn — toàn bộ orders đang có, theo 5 status thật
  const STATUS_META = {
    pending: { label: "Chờ xác nhận", color: "#ca8a04" },
    confirmed: { label: "Đã xác nhận", color: "#4338ca" },
    shipping: { label: "Đang giao", color: "#1d4ed8" },
    delivered: { label: "Đã giao", color: "#16a34a" },
    cancelled: { label: "Đã hủy", color: "#78716c" },
  };
  const statusCounts = safeReduce(
    orders,
    (acc, o) => {
      const s = o.status || "unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {},
  );
  const statusData = Object.keys(STATUS_META)
    .filter((s) => statusCounts[s] > 0)
    .map((s) => ({
      name: STATUS_META[s].label,
      value: statusCounts[s],
      color: STATUS_META[s].color,
    }));

  // 🆕 Đơn "kẹt" — pending/confirmed quá X ngày chưa chuyển sang shipping/delivered
  const now2 = new Date();
  const stuckOrders = orders
    .filter((o) => o.status === "pending" || o.status === "confirmed")
    .map((o) => {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      const daysSince = created
        ? Math.floor((now2 - created) / (1000 * 60 * 60 * 24))
        : 0;
      return { ...o, daysSince };
    })
    .filter((o) => o.daysSince >= stuckThresholdDays)
    .sort((a, b) => b.daysSince - a.daysSince);

  // 🆕 Nhãn hiển thị cho segment khách hàng
  const SEGMENT_LABELS = {
    new: { label: "Khách mới", color: "#1d4ed8", bg: "#dbeafe" },
    loyal: { label: "Thân thiết", color: "#15803d", bg: "#dcfce7" },
    "one-time": { label: "Mua 1 lần", color: "#a16207", bg: "#fef9c3" },
    "at-risk": { label: "Có nguy cơ rời", color: "#dc2626", bg: "#fee2e2" },
    "high-value": {
      label: "VIP chi tiêu cao",
      color: "#7e22ce",
      bg: "#f3e8ff",
    },
    unknown: { label: "Không rõ", color: "#78716c", bg: "#f4f2ee" },
  };
  const SEGMENT_ORDER = ["high-value", "loyal", "new", "one-time", "at-risk"];

  // Recent Orders
  const recentOrders = Array.isArray(orders)
    ? orders.slice(0, 5).map((o) => ({
        id: o.orderNumber || "N/A",
        user: o.userId?.name || "Khách vãng lai",
        date: o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("vi-VN")
          : "N/A",
        total: o.totalAmount_cents
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(o.totalAmount_cents)
          : "N/A",
        status: o.status || "unknown",
        product: o.items?.[0]?.name || "Nhiều sản phẩm",
      }))
    : [];

  /* ── RENDER ── */
  return (
    <div className="db-root animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* PAGE HEADER */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-crown-wrap">
            <FaCrown />
          </div>
          <div>
            <h1 className="db-title">BAO Po_Box Dashboard</h1>
            <p className="db-subtitle">
              Kho báu Pokémon TCG – Dữ liệu realtime
            </p>
          </div>
        </div>
        <div className="db-date">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="db-error">{error}</div>}

      {/* LOADING */}
      {loading && (
        <div className="db-loading">
          <div className="db-spinner" />
          <span className="db-loading-txt">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* BENTO GRID */}
      {!loading && (
        <>
          <div className="db-bento">
            {/* ── CELL 1: Area chart (large, col 1-3, row 1-2) ── */}
            <div className="db-cell db-cell-area">
              <div className="db-cell-hd d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <p className="db-cell-hd-title">Phân Tích Doanh Thu</p>
                  <span className="db-cell-hd-sub">
                    Dữ liệu từ hệ thống real-time
                  </span>
                </div>

                {/* BỘ LỌC NGÀY */}
                <div className="d-flex align-items-center gap-2 p-1 px-2 rounded-pill bg-light border">
                  <FaCalendarAlt className="text-muted small" />
                  <input
                    type="date"
                    className="border-0 bg-transparent fw-bold small outline-none"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                  <span className="text-muted">—</span>
                  <input
                    type="date"
                    className="border-0 bg-transparent fw-bold small outline-none"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="db-chart-body" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={filteredRevenueData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="dbGoldArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#b45309"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor="#b45309"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2ded6" />
                    <XAxis
                      dataKey="name"
                      stroke="#a8a29e"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#a8a29e"
                      tick={{ fontSize: 11 }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "0.5px solid #e2ded6",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#1c1917",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="doanhthu"
                      stroke="#b45309"
                      strokeWidth={2}
                      fill="url(#dbGoldArea)"
                      dot={{ fill: "#b45309", r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── CELL 2: KPI tall — Doanh thu (col 4, row 1) ── */}
            <div className="db-cell db-cell-kpi-r1">
              <KpiTall
                item={kpiData[0]}
                onMore={() => navigate("/admin/orders")}
              />
            </div>

            {/* ── CELL 3: KPI tall — Đơn hàng (col 4, row 2) ── */}
            <div className="db-cell db-cell-kpi-r2">
              <KpiTall
                item={kpiData[1]}
                onMore={() => navigate("/admin/orders")}
              />
            </div>

            {/* ── CELL 4: KPI small — Khách hàng (col 1, row 3) ── */}
            <div className="db-cell db-cell-kpi-b1">
              <KpiSmall
                item={kpiData[2]}
                onMore={() => navigate("/admin/customers?type=customer")}
              />
            </div>

            {/* ── CELL 5: KPI small — AOV (col 2, row 3) ── */}
            <div className="db-cell db-cell-kpi-b2">
              <KpiSmall item={kpiData[3]} />
            </div>

            {/* ── CELL 6: Pie chart (col 3-4, row 3) ── */}
            <div className="db-cell db-cell-pie">
              <div className="db-cell-hd">
                <p className="db-cell-hd-title">Top Set Bán Chạy</p>
                <span className="db-cell-hd-sub">
                  {setData.length} bộ bán chạy
                </span>
              </div>
              <div className="db-pie-body">
                {setData.length > 0 ? (
                  <>
                    {/* Chart donut — cố định kích thước, không dùng ResponsiveContainer */}
                    <div className="db-pie-chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={setData}
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {setData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "#fff",
                              border: "0.5px solid #e2ded6",
                              borderRadius: 8,
                              fontSize: 12,
                              color: "#1c1917",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Custom legend dọc bên phải — tên không bị cắt */}
                    <div className="db-pie-legend">
                      {setData.map((entry, index) => (
                        <div key={index} className="db-pie-legend-item">
                          <div
                            className="db-pie-dot"
                            style={{
                              background: COLORS[index % COLORS.length],
                            }}
                          />
                          <span
                            className="db-pie-legend-name"
                            title={entry.name}
                          >
                            {entry.name}
                          </span>
                          <span className="db-pie-legend-val">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--subtle)",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    Chưa có dữ liệu sản phẩm
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🆕 ROW 2: Phân bố trạng thái + Đơn kẹt + Doanh thu theo nhóm khách */}
          <div className="db-row2">
            {/* ── Phân bố trạng thái đơn ── */}
            <div className="db-card2">
              <div className="db-cell-hd">
                <div>
                  <p className="db-cell-hd-title">Phân Bố Trạng Thái Đơn</p>
                  <span className="db-cell-hd-sub">{orders.length} đơn</span>
                </div>
                <MoreBtn onClick={() => navigate("/admin/orders")} />
              </div>
              {statusData.length > 0 ? (
                <div className="db-pie-body" style={{ minHeight: 160 }}>
                  <div
                    className="db-pie-chart-wrap"
                    style={{ width: 110, height: 110 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={50}
                          paddingAngle={4}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={`status-cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#fff",
                            border: "0.5px solid #e2ded6",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "#1c1917",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="db-status-legend">
                    {statusData.map((s, i) => (
                      <div className="db-status-row" key={i}>
                        <div
                          className="db-status-dot"
                          style={{ background: s.color }}
                        />
                        <span className="db-status-name">{s.name}</span>
                        <span className="db-status-count">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="db-stuck-empty">Chưa có đơn hàng</div>
              )}
            </div>

            {/* ── Đơn kẹt (pending/confirmed quá lâu) ── */}
            <div className="db-card2">
              <div className="db-cell-hd">
                <div>
                  <p className="db-cell-hd-title">
                    <FaExclamationTriangle
                      style={{ fontSize: 11, color: "#dc2626", marginRight: 5 }}
                    />
                    Đơn Kẹt
                  </p>
                  <span className="db-cell-hd-sub">
                    {stuckOrders.length} đơn cần xử lý
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="db-stuck-hd-extra">
                    Quá
                    <input
                      type="number"
                      min={1}
                      max={30}
                      className="db-stuck-input"
                      value={stuckThresholdDays}
                      onChange={(e) =>
                        setStuckThresholdDays(
                          Math.max(
                            1,
                            Math.min(30, Number(e.target.value) || 1),
                          ),
                        )
                      }
                    />
                    ngày
                  </div>
                  <MoreBtn onClick={() => navigate("/admin/orders")} />
                </div>
              </div>
              {stuckOrders.length > 0 ? (
                <div className="db-stuck-list">
                  {stuckOrders.map((o) => (
                    <div className="db-stuck-item" key={o._id || o.orderNumber}>
                      <div className="db-stuck-left">
                        <span className="db-stuck-num">
                          {o.orderNumber || "N/A"}
                        </span>
                        <span className="db-stuck-name">
                          {o.userId?.name || "Khách vãng lai"}
                        </span>
                      </div>
                      <span className="db-stuck-days">{o.daysSince} ngày</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="db-stuck-empty">
                  <FaClock style={{ marginRight: 6, opacity: 0.5 }} />
                  Không có đơn nào bị kẹt
                </div>
              )}
            </div>

            {/* ── Doanh thu theo nhóm khách hàng ── */}
            <div className="db-card2">
              <div className="db-cell-hd">
                <div>
                  <p className="db-cell-hd-title">Doanh Thu Theo Nhóm Khách</p>
                  <span className="db-cell-hd-sub">Đơn đã giao</span>
                </div>
                <MoreBtn
                  onClick={() => navigate("/admin/customers?type=customer")}
                />
              </div>
              {segmentLoading ? (
                <div className="db-seg-loading">
                  <div
                    className="db-spinner"
                    style={{ width: 20, height: 20 }}
                  />
                </div>
              ) : segmentRevenue && Object.keys(segmentRevenue).length > 0 ? (
                <div className="db-seg-list">
                  {SEGMENT_ORDER.filter((seg) => segmentRevenue[seg]).map(
                    (seg) => {
                      const meta = SEGMENT_LABELS[seg];
                      const data = segmentRevenue[seg];
                      return (
                        <div className="db-seg-row" key={seg}>
                          <span
                            className="db-seg-name"
                            style={{ color: meta.color, background: meta.bg }}
                          >
                            {meta.label}
                          </span>
                          <div className="db-seg-right">
                            <span className="db-seg-revenue">
                              {fmtMoney(data.revenue)}
                            </span>
                            <span className="db-seg-count">
                              {data.count} đơn
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="db-seg-loading">Chưa có đơn đã giao</div>
              )}
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="db-orders-card">
            <div className="db-orders-hd">
              <h5 className="db-orders-title">
                <FaShoppingBag />
                Đơn Hàng Gần Đây
              </h5>
              <button
                className="db-view-all"
                onClick={() => navigate("/admin/orders")}
              >
                Xem tất cả
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty-icon">
                  <FaShoppingBag />
                </div>
                <div>Chưa có đơn hàng nào</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Khi có đơn mới, sẽ hiển thị tại đây
                </div>
              </div>
            ) : (
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Sản Phẩm</th>
                    <th>Ngày Đặt</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="db-order-id">{order.id}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{order.user}</td>
                      <td>
                        <span className="db-order-product">
                          {order.product}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>
                        {order.date}
                      </td>
                      <td>
                        <span className="db-order-amount">{order.total}</span>
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
