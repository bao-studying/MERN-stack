import React, { useState, useEffect } from "react";
import { Badge, Spinner } from "react-bootstrap";
import {
  FaUserSlash,
  FaUserCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShoppingBag,
  FaMoneyBillWave,
  FaPhone,
  FaEnvelope,
  FaBoxOpen,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import axiosClient from "../../services/axiosClient";

/* ─────────────────────────────────────────────────────────────
   STYLES — Slide drawer từ phải, giống ProductManager split panel
───────────────────────────────────────────────────────────── */
const DRAWER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .cd-overlay {
    position: fixed; inset: 0;
    background: rgba(28,25,23,.3); z-index: 1050;
    animation: cdFadeIn .18s ease both;
  }
  @keyframes cdFadeIn { from{opacity:0} to{opacity:1} }

  .cd-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 460px; max-width: 96vw;
    background: #fff; z-index: 1051;
    display: flex; flex-direction: column;
    box-shadow: -12px 0 40px rgba(0,0,0,.12), -2px 0 0 rgba(0,0,0,.04);
    transform: translateX(100%);
    animation: cdSlideIn .3s cubic-bezier(.16,1,.3,1) forwards;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes cdSlideIn { to { transform: translateX(0); } }

  /* ── DRAWER HEADER ── */
  .cd-hd {
    flex-shrink: 0; background: #1c1917;
    position: relative; overflow: hidden;
  }
  /* diagonal pattern overlay */
  .cd-hd::before {
    content: ''; position: absolute; inset: 0;
    background-image: repeating-linear-gradient(
      -45deg, rgba(255,255,255,.03) 0, rgba(255,255,255,.03) 1px,
      transparent 0, transparent 50%
    );
    background-size: 14px 14px;
  }
  .cd-hd-inner { position: relative; padding: 20px 20px 16px; }
  .cd-close {
    position: absolute; top: 14px; right: 14px;
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(255,255,255,.1); border: 0.5px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.7); cursor: pointer; display: flex;
    align-items: center; justify-content: center; font-size: 13px;
    transition: background .12s, color .12s;
  }
  .cd-close:hover { background: rgba(220,38,38,.5); color: #fff; }

  .cd-avatar-row { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 12px; }
  .cd-avatar-wrap { position: relative; flex-shrink: 0; }
  .cd-avatar {
    width: 68px; height: 68px; border-radius: 16px; object-fit: cover;
    border: 2px solid rgba(255,255,255,.15);
  }
  .cd-status-dot {
    position: absolute; bottom: -2px; right: -2px;
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid #1c1917;
  }
  .cd-status-dot.active { background: #22c55e; }
  .cd-status-dot.locked { background: #ef4444; }

  .cd-id-line {
    font-size: 10px; font-family: 'DM Mono', monospace;
    color: rgba(255,255,255,.35); margin: 0 0 3px; letter-spacing: .5px;
  }
  .cd-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 500; color: #fff;
    margin: 0 0 4px; letter-spacing: -.3px; line-height: 1.1;
  }
  .cd-role-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase;
    padding: 2px 8px; border-radius: 20px;
    background: rgba(255,255,255,.12); color: rgba(255,255,255,.7);
    border: 0.5px solid rgba(255,255,255,.15);
  }

  /* contact row */
  .cd-contact { display: flex; flex-wrap: wrap; gap: 12px; }
  .cd-contact-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: rgba(255,255,255,.5);
  }
  .cd-contact-item svg { font-size: 10px; opacity: .7; }

  /* ── KPI STRIP ── */
  .cd-kpi {
    flex-shrink: 0; background: #f5f2ed;
    border-bottom: 0.5px solid #e8e4de;
    display: grid; grid-template-columns: repeat(3,1fr);
  }
  .cd-kpi-item {
    padding: 14px 16px; text-align: center;
    border-right: 0.5px solid #e8e4de;
    display: flex; flex-direction: column; gap: 3px;
  }
  .cd-kpi-item:last-child { border-right: none; }
  .cd-kpi-lbl {
    font-size: 9px; font-weight: 700; letter-spacing: .6px;
    text-transform: uppercase; color: #a09890;
  }
  .cd-kpi-val {
    font-size: 18px; font-weight: 600; font-family: 'DM Mono', monospace;
    color: #1c1917; line-height: 1;
  }
  .cd-kpi-val.green { color: #15803d; font-family: 'Cormorant Garamond', serif; font-size: 20px; }
  .cd-kpi-val.orange { color: #c8490c; }
  .cd-kpi-sub { font-size: 9px; color: #a09890; }

  /* ── TABS ── */
  .cd-tabs {
    flex-shrink: 0; display: flex;
    border-bottom: 0.5px solid #e8e4de; background: #fff;
  }
  .cd-tab {
    flex: 1; padding: 11px 0; text-align: center;
    font-size: 11px; font-weight: 600; color: #a09890;
    border: none; background: none; cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color .12s, border-color .12s;
  }
  .cd-tab.active { color: #1c1917; border-bottom-color: #c8490c; }
  .cd-tab:hover:not(.active) { color: #6b6560; }

  /* ── BODY ── */
  .cd-body {
    flex: 1; overflow-y: auto; padding: 20px;
  }
  .cd-body::-webkit-scrollbar { width: 3px; }
  .cd-body::-webkit-scrollbar-thumb { background: #e8e4de; border-radius: 2px; }

  /* Info section */
  .cd-section { margin-bottom: 20px; }
  .cd-section-title {
    font-size: 10px; font-weight: 700; letter-spacing: .6px;
    text-transform: uppercase; color: #a09890;
    margin: 0 0 10px; padding-bottom: 7px;
    border-bottom: 0.5px solid #f0ece6;
    display: flex; align-items: center; gap: 6px;
  }
  .cd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .cd-info-item {
    background: #faf9f7; border: 0.5px solid #e8e4de;
    border-radius: 10px; padding: 10px 12px;
  }
  .cd-info-lbl { font-size: 10px; font-weight: 600; letter-spacing: .3px; color: #a09890; margin: 0 0 3px; text-transform: uppercase; }
  .cd-info-val { font-size: 12px; font-weight: 500; color: #1c1917; margin: 0; }
  .cd-info-val.mono { font-family: 'DM Mono', monospace; }
  .cd-info-val.full { grid-column: span 2; }

  /* Address card */
  .cd-addr-card {
    background: #faf9f7; border: 0.5px solid #e8e4de;
    border-radius: 10px; padding: 11px 14px; margin-bottom: 8px;
    display: flex; gap: 10px; align-items: flex-start;
  }
  .cd-addr-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: #f0ece6; display: flex; align-items: center;
    justify-content: center; color: #c8490c; font-size: 11px; flex-shrink: 0; margin-top: 1px;
  }
  .cd-addr-name { font-size: 12px; font-weight: 600; color: #1c1917; }
  .cd-addr-phone { font-size: 11px; color: #6b6560; font-family: 'DM Mono', monospace; }
  .cd-addr-line { font-size: 11px; color: #6b6560; margin-top: 2px; }
  .cd-addr-default {
    font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 10px;
    background: #f0fdf4; color: #15803d; border: 0.5px solid #bbf7d0;
    margin-left: 6px;
  }

  /* Order list */
  .cd-order-item {
    background: #faf9f7; border: 0.5px solid #e8e4de;
    border-radius: 10px; padding: 11px 14px; margin-bottom: 8px;
    display: flex; align-items: center; gap: 12px;
    animation: cdItemIn .2s ease both;
    transition: border-color .12s;
  }
  .cd-order-item:hover { border-color: #c8c3bc; }
  @keyframes cdItemIn { from{opacity:0;transform:translateX(6px)} to{opacity:1;transform:translateX(0)} }
  .cd-order-num { font-size: 11px; font-weight: 700; font-family: 'DM Mono', monospace; color: #1c1917; }
  .cd-order-date { font-size: 10px; color: #a09890; margin-top: 1px; }
  .cd-order-total {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px; font-weight: 600; color: #15803d;
    margin-left: auto; letter-spacing: -.2px; white-space: nowrap;
  }
  .cd-order-status {
    font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px;
    letter-spacing: .3px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
  }
  .cd-order-status.pending  { background: #fef9c3; color: #a16207; }
  .cd-order-status.shipping { background: #dbeafe; color: #1d4ed8; }
  .cd-order-status.delivered     { background: #dcfce7; color: #15803d; }
  .cd-order-status.cancel   { background: #fee2e2; color: #dc2626; }

  .cd-empty {
    padding: 32px 20px; text-align: center; color: #a09890;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .cd-empty-icon {
    width: 42px; height: 42px; border-radius: 12px; background: #f5f2ed;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; opacity: .5;
  }

  /* ── FOOTER ── */
  .cd-footer {
    flex-shrink: 0; padding: 14px 20px;
    border-top: 0.5px solid #e8e4de; background: #fff;
    display: flex; gap: 10px;
  }
  .cd-btn-close {
    flex: 1; padding: 10px; border-radius: 10px;
    border: 1px solid #e8e4de; background: transparent;
    font-size: 12px; font-weight: 600; color: #6b6560;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background .12s, border-color .12s;
  }
  .cd-btn-close:hover { background: #f5f2ed; border-color: #c8c3bc; }
  .cd-btn-lock {
    flex: 1.4; padding: 10px; border-radius: 10px;
    border: none; font-size: 12px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    letter-spacing: .3px; text-transform: uppercase;
    transition: background .12s, transform .1s;
  }
  .cd-btn-lock.lock   { background: #1c1917; color: #fff; }
  .cd-btn-lock.lock:hover   { background: #dc2626; transform: translateY(-1px); }
  .cd-btn-lock.unlock { background: #15803d; color: #fff; }
  .cd-btn-lock.unlock:hover { background: #166534; transform: translateY(-1px); }
  .cd-btn-lock:active { transform: translateY(0); }

  .cd-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 32px; flex: 1;
  }
`;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const ORDER_STATUS_MAP = {
  pending: { label: "Chờ xử lý", cls: "pending", icon: <FaClock /> },
  shipping: { label: "Đang giao", cls: "shipping", icon: <FaTruck /> },
  delivered: { label: "Hoàn thành", cls: "delivered", icon: <FaCheckCircle /> },
  cancel: { label: "Đã huỷ", cls: "cancel", icon: <FaTimesCircle /> },
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const CustomerDetailModal = ({
  show,
  handleClose,
  customer,
  handleToggleStatus,
}) => {
  const [tab, setTab] = useState("info");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch orders khi mở drawer
  useEffect(() => {
    if (!show || !customer?._id) return;
    setTab("info");
    setOrders([]);
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        // Dùng route admin/all với filter userId — trả về { success, data: [...] }
        const res = await axiosClient.get(`/orders/admin/all`, {
          params: { userId: customer._id },
        });
        const list = res.data || [];
        setOrders(list);
      } catch (e) {
        console.error("Lỗi lấy đơn hàng:", e);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [show, customer?._id]);

  if (!show || !customer) return null;

  // Tính KPI từ orders thật
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  // Chỉ cộng tổng chi tiêu từ đơn đã hoàn thành (status = delivered)
  const totalSpend = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.totalAmount_cents || 0), 0);

  // Địa chỉ
  const primaryAddr = customer.addresses?.[0];
  const joinDate = new Date(customer.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Tính ngày thành viên
  const daysMember = Math.floor(
    (Date.now() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24),
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DRAWER_STYLES }} />

      {/* Overlay */}
      <div className="cd-overlay" onClick={handleClose} />

      {/* Drawer */}
      <div className="cd-drawer">
        {/* ── HEADER ── */}
        <div className="cd-hd">
          <div className="cd-hd-inner">
            <button className="cd-close" onClick={handleClose}>
              <FaTimes />
            </button>

            <div className="cd-avatar-row">
              <div className="cd-avatar-wrap">
                <img
                  src={
                    customer.avatarUrl ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(customer.name) +
                      "&background=e8e4de&color=1c1917"
                  }
                  alt={customer.name}
                  className="cd-avatar"
                />
                <div
                  className={`cd-status-dot ${customer.status === 1 ? "active" : "locked"}`}
                />
              </div>
              <div>
                <p className="cd-id-line">
                  ID · {customer._id?.slice(-8).toUpperCase()}
                </p>
                <h2 className="cd-name">{customer.name}</h2>
                <span className="cd-role-badge">
                  {customer.role?.name || "customer"}
                </span>
              </div>
            </div>

            <div className="cd-contact">
              <div className="cd-contact-item">
                <FaEnvelope />
                {customer.email}
              </div>
              {customer.phone && (
                <div className="cd-contact-item">
                  <FaPhone />
                  {customer.phone}
                </div>
              )}
              <div className="cd-contact-item">
                <FaCalendarAlt />
                Tham gia {joinDate}
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div className="cd-kpi">
          <div className="cd-kpi-item">
            <span className="cd-kpi-lbl">Tổng đơn</span>
            {ordersLoading ? (
              <span className="cd-kpi-val">—</span>
            ) : (
              <span className="cd-kpi-val orange">{totalOrders}</span>
            )}
            <span className="cd-kpi-sub">{deliveredOrders} hoàn thành</span>
          </div>
          <div className="cd-kpi-item">
            <span className="cd-kpi-lbl">Tổng chi tiêu</span>
            {ordersLoading ? (
              <span className="cd-kpi-val">—</span>
            ) : (
              <span className="cd-kpi-val green">
                {totalSpend.toLocaleString("vi-VN")}đ
              </span>
            )}
            <span className="cd-kpi-sub">từ đơn hoàn thành</span>
          </div>
          <div className="cd-kpi-item">
            <span className="cd-kpi-lbl">Thành viên</span>
            <span className="cd-kpi-val">{daysMember}</span>
            <span className="cd-kpi-sub">ngày</span>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="cd-tabs">
          {[
            { key: "info", label: "Thông tin" },
            { key: "orders", label: `Đơn hàng (${totalOrders})` },
            {
              key: "addr",
              label: `Địa chỉ (${customer.addresses?.length || 0})`,
            },
          ].map((t) => (
            <button
              key={t.key}
              className={`cd-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── BODY ── */}
        <div className="cd-body">
          {/* TAB: THÔNG TIN */}
          {tab === "info" && (
            <div>
              <div className="cd-section">
                <p className="cd-section-title">
                  <FaShoppingBag />
                  Tổng quan tài khoản
                </p>
                <div className="cd-info-grid">
                  <div className="cd-info-item">
                    <p className="cd-info-lbl">Trạng thái</p>
                    <p className="cd-info-val">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 10,
                          background:
                            customer.status === 1 ? "#dcfce7" : "#fee2e2",
                          color: customer.status === 1 ? "#15803d" : "#dc2626",
                        }}
                      >
                        {customer.status === 1 ? "Đang hoạt động" : "Đã khóa"}
                      </span>
                    </p>
                  </div>
                  <div className="cd-info-item">
                    <p className="cd-info-lbl">Ngày tham gia</p>
                    <p className="cd-info-val mono">{joinDate}</p>
                  </div>
                  <div className="cd-info-item">
                    <p className="cd-info-lbl">Tổng đơn hàng</p>
                    <p className="cd-info-val mono">
                      {ordersLoading ? "..." : totalOrders}
                    </p>
                  </div>
                  <div className="cd-info-item">
                    <p className="cd-info-lbl">Đơn hoàn thành</p>
                    <p className="cd-info-val mono">
                      {ordersLoading ? "..." : deliveredOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="cd-section">
                <p className="cd-section-title">
                  <FaMoneyBillWave />
                  Chi tiêu
                </p>
                <div className="cd-info-grid">
                  <div
                    className="cd-info-item"
                    style={{
                      gridColumn: "span 2",
                      background: "#f0fdf4",
                      borderColor: "#bbf7d0",
                    }}
                  >
                    <p className="cd-info-lbl" style={{ color: "#15803d" }}>
                      Tổng chi tiêu thực tế
                    </p>
                    <p
                      className="cd-info-val"
                      style={{
                        fontFamily: "Cormorant Garamond,serif",
                        fontSize: 24,
                        color: "#15803d",
                        letterSpacing: "-.3px",
                      }}
                    >
                      {ordersLoading ? (
                        <Spinner size="sm" variant="success" />
                      ) : (
                        `${totalSpend.toLocaleString("vi-VN")} đ`
                      )}
                    </p>
                  </div>
                  <div className="cd-info-item">
                    <p className="cd-info-lbl">Hạng thành viên</p>
                    <p className="cd-info-val">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 10,
                          background:
                            totalSpend >= 5000000
                              ? "#fef3c7"
                              : totalSpend >= 1000000
                                ? "#f0fdf4"
                                : "#f5f2ed",
                          color:
                            totalSpend >= 5000000
                              ? "#92400e"
                              : totalSpend >= 1000000
                                ? "#15803d"
                                : "#6b6560",
                        }}
                      >
                        {totalSpend >= 5000000
                          ? "⭐ VIP"
                          : totalSpend >= 1000000
                            ? "✓ Thân thiết"
                            : "Mới"}
                      </span>
                    </p>
                  </div>
                  <div className="cd-info-item">
                    <p className="cd-info-lbl">Số ngày thành viên</p>
                    <p className="cd-info-val mono">{daysMember} ngày</p>
                  </div>
                </div>
              </div>

              {primaryAddr && (
                <div className="cd-section">
                  <p className="cd-section-title">
                    <FaMapMarkerAlt />
                    Địa chỉ chính
                  </p>
                  <div className="cd-addr-card">
                    <div className="cd-addr-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="cd-addr-name">
                          {primaryAddr.fullName}
                        </span>
                        {primaryAddr.isDefault && (
                          <span className="cd-addr-default">Mặc định</span>
                        )}
                      </div>
                      <div className="cd-addr-phone">{primaryAddr.phone}</div>
                      <div className="cd-addr-line">
                        {primaryAddr.addressLine}, {primaryAddr.city},{" "}
                        {primaryAddr.province}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ĐƠN HÀNG */}
          {tab === "orders" && (
            <div>
              {ordersLoading ? (
                <div className="cd-loading">
                  <Spinner animation="border" size="sm" variant="success" />
                </div>
              ) : orders.length === 0 ? (
                <div className="cd-empty">
                  <div className="cd-empty-icon">
                    <FaBoxOpen />
                  </div>
                  <span>Chưa có đơn hàng nào</span>
                </div>
              ) : (
                orders.map((order, idx) => {
                  const st =
                    ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
                  return (
                    <div
                      key={order._id}
                      className="cd-order-item"
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <div>
                        <div className="cd-order-num">
                          #
                          {order.orderNumber ||
                            order._id?.slice(-8).toUpperCase()}
                        </div>
                        <div className="cd-order-date">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>
                      <span className={`cd-order-status ${st.cls}`}>
                        {st.label}
                      </span>
                      <span className="cd-order-total">
                        {(order.totalAmount_cents || 0).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: ĐỊA CHỈ */}
          {tab === "addr" && (
            <div>
              {!customer.addresses || customer.addresses.length === 0 ? (
                <div className="cd-empty">
                  <div className="cd-empty-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <span>Chưa có địa chỉ nào</span>
                </div>
              ) : (
                customer.addresses.map((addr, idx) => (
                  <div key={idx} className="cd-addr-card">
                    <div className="cd-addr-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="cd-addr-name">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="cd-addr-default">Mặc định</span>
                        )}
                      </div>
                      <div className="cd-addr-phone">{addr.phone}</div>
                      <div className="cd-addr-line">
                        {addr.addressLine}, {addr.city}, {addr.province}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="cd-footer">
          <button className="cd-btn-close" onClick={handleClose}>
            Đóng
          </button>
          {customer.role?.name !== "admin" &&
            (customer.status === 1 ? (
              <button
                className="cd-btn-lock lock"
                onClick={() => handleToggleStatus(customer._id, 1)}
              >
                <FaUserSlash style={{ fontSize: 11 }} /> Khóa tài khoản
              </button>
            ) : (
              <button
                className="cd-btn-lock unlock"
                onClick={() => handleToggleStatus(customer._id, 0)}
              >
                <FaUserCheck style={{ fontSize: 11 }} /> Mở khóa
              </button>
            ))}
        </div>
      </div>
    </>
  );
};

export default CustomerDetailModal;
