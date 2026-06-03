import React, { useState, useEffect } from "react";
import {
  FaPrint,
  FaSave,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaCreditCard,
  FaStickyNote,
  FaChevronDown,
  FaCheckCircle,
  FaTruck,
  FaClock,
  FaTimesCircle,
  FaClipboardCheck,
  FaBox,
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────
   STYLES — Right slide drawer, warm neutral admin aesthetic
   DM Sans + Cormorant Garamond + DM Mono
   Palette: #f5f2ed / #1c1917 / #c8490c / #15803d
───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .od-overlay {
    position: fixed; inset: 0; z-index: 1060;
    background: rgba(28,25,23,.38);
    animation: odFadeIn .2s ease both;
  }
  @keyframes odFadeIn { from{opacity:0} to{opacity:1} }

  .od-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 540px; max-width: 97vw; z-index: 1061;
    background: #fff;
    display: flex; flex-direction: column;
    box-shadow: -16px 0 56px rgba(28,25,23,.14), -2px 0 0 rgba(28,25,23,.04);
    transform: translateX(100%);
    animation: odSlideIn .32s cubic-bezier(.16,1,.3,1) forwards;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes odSlideIn { to { transform: translateX(0); } }

  /* ── HEADER ── */
  .od-hd {
    flex-shrink: 0;
    background: #1c1917;
    position: relative; overflow: hidden;
  }
  .od-hd::before {
    content: ''; position: absolute; inset: 0;
    background-image: repeating-linear-gradient(
      -45deg, rgba(255,255,255,.025) 0, rgba(255,255,255,.025) 1px,
      transparent 0, transparent 50%
    );
    background-size: 14px 14px;
  }
  .od-hd-inner { position: relative; padding: 18px 20px 16px; }

  .od-hd-top {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
    margin-bottom: 12px;
  }
  .od-order-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 500; color: #fff;
    letter-spacing: -.2px; margin: 0 0 3px; line-height: 1.1;
  }
  .od-order-date {
    font-size: 11px; font-family: 'DM Mono', monospace;
    color: rgba(255,255,255,.4); margin: 0;
  }
  .od-close {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(255,255,255,.1); border: 0.5px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.65); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0; transition: background .12s, color .12s;
  }
  .od-close:hover { background: rgba(220,38,38,.5); color: #fff; }

  /* Status badge in header */
  .od-hd-status {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
  }
  .od-hd-status.pending   { background: rgba(251,191,36,.15); color: #fbbf24; border: 1px solid rgba(251,191,36,.3); }
  .od-hd-status.confirmed { background: rgba(96,165,250,.15);  color: #60a5fa; border: 1px solid rgba(96,165,250,.3); }
  .od-hd-status.shipping  { background: rgba(96,165,250,.15);  color: #60a5fa; border: 1px solid rgba(96,165,250,.3); }
  .od-hd-status.delivered { background: rgba(52,211,153,.15); color: #34d399; border: 1px solid rgba(52,211,153,.3); }
  .od-hd-status.cancelled { background: rgba(248,113,113,.15); color: #f87171; border: 1px solid rgba(248,113,113,.3); }

  /* ── STATUS STEPPER ── */
  .od-stepper {
    display: flex; align-items: center; padding: 14px 20px;
    background: #f5f2ed; border-bottom: 0.5px solid #e8e4de;
    flex-shrink: 0; overflow-x: auto; gap: 0;
    scrollbar-width: none;
  }
  .od-stepper::-webkit-scrollbar { display: none; }
  .od-step {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    flex-shrink: 0; min-width: 72px;
  }
  .od-step-icon {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; border: 2px solid #e8e4de;
    background: #fff; color: #a09890;
    transition: background .2s, border-color .2s, color .2s;
  }
  .od-step-icon.done   { background: #15803d; border-color: #15803d; color: #fff; }
  .od-step-icon.active { background: #c8490c; border-color: #c8490c; color: #fff; }
  .od-step-icon.cancel { background: #dc2626; border-color: #dc2626; color: #fff; }
  .od-step-lbl { font-size: 9px; font-weight: 600; letter-spacing: .3px; text-transform: uppercase; color: #a09890; text-align: center; }
  .od-step-lbl.done   { color: #15803d; }
  .od-step-lbl.active { color: #c8490c; }
  .od-step-lbl.cancel { color: #dc2626; }
  .od-step-line { flex: 1; height: 2px; background: #e8e4de; margin: 0 4px; margin-bottom: 18px; }
  .od-step-line.done { background: #15803d; }

  /* ── BODY ── */
  .od-body {
    flex: 1; overflow-y: auto; padding: 0;
  }
  .od-body::-webkit-scrollbar { width: 3px; }
  .od-body::-webkit-scrollbar-thumb { background: #e8e4de; border-radius: 2px; }

  /* Section */
  .od-section { padding: 18px 20px; border-bottom: 0.5px solid #f0ece6; }
  .od-section:last-child { border-bottom: none; }
  .od-section-title {
    font-size: 10px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase;
    color: #a09890; margin: 0 0 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .od-section-title svg { font-size: 10px; }

  /* Info grid */
  .od-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .od-info-card {
    background: #faf9f7; border: 0.5px solid #e8e4de; border-radius: 10px; padding: 11px 13px;
  }
  .od-info-lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .3px; color: #a09890; margin: 0 0 4px; }
  .od-info-val { font-size: 12px; font-weight: 500; color: #1c1917; margin: 0; line-height: 1.5; }
  .od-info-val.mono { font-family: 'DM Mono', monospace; font-size: 11px; }
  .od-info-full { grid-column: span 2; }

  /* Payment badge */
  .od-pay-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600;
    background: #f0fdf4; color: #15803d; border: 0.5px solid #bbf7d0;
  }

  /* Note */
  .od-note {
    background: #fffbeb; border: 0.5px solid #fde68a; border-radius: 10px;
    padding: 10px 13px; margin-top: 10px;
    font-size: 12px; color: #92400e; line-height: 1.5;
  }
  .od-note strong { font-weight: 700; }

  /* ── ITEMS LIST ── */
  .od-items { display: flex; flex-direction: column; gap: 8px; }
  .od-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; background: #faf9f7;
    border: 0.5px solid #e8e4de; border-radius: 10px;
    transition: border-color .12s;
  }
  .od-item:hover { border-color: #c8c3bc; }
  .od-item-img {
    width: 48px; height: 48px; border-radius: 8px; object-fit: cover;
    border: 0.5px solid #e8e4de; flex-shrink: 0; background: #f5f2ed;
  }
  .od-item-name {
    flex: 1; font-size: 12px; font-weight: 600; color: #1c1917;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .od-item-qty { font-size: 11px; color: #6b6560; font-family: 'DM Mono', monospace; white-space: nowrap; }
  .od-item-price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px; font-weight: 600; color: #1c1917;
    letter-spacing: -.2px; white-space: nowrap; flex-shrink: 0;
  }

  /* ── TOTALS ── */
  .od-totals { display: flex; flex-direction: column; gap: 6px; }
  .od-total-row { display: flex; justify-content: space-between; font-size: 12px; color: #6b6560; }
  .od-total-row.main {
    font-size: 14px; font-weight: 700; color: #1c1917;
    border-top: 0.5px solid #e8e4de; padding-top: 10px; margin-top: 4px;
  }
  .od-total-row.main .od-tv {
    font-family: 'Cormorant Garamond', serif; font-size: 22px;
    font-weight: 600; color: #15803d; letter-spacing: -.3px;
  }
  .od-total-green { color: #15803d; font-weight: 600; }
  .od-total-disc  { color: #15803d; font-weight: 600; font-family: 'DM Mono', monospace; }

  /* ── STATUS UPDATER ── */
  .od-status-select-wrap { position: relative; }
  .od-status-select {
    width: 100%; padding: 10px 36px 10px 14px;
    border: 1.5px solid #e8e4de; border-radius: 10px;
    background: #faf9f7; color: #1c1917;
    font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    outline: none; cursor: pointer; appearance: none;
    transition: border-color .12s, box-shadow .12s;
  }
  .od-status-select:focus { border-color: #c8490c; box-shadow: 0 0 0 3px rgba(200,73,12,.08); }
  .od-select-chevron {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: #a09890; font-size: 11px; pointer-events: none;
  }

  /* Status option colors */
  .od-status-select option[value="pending"]   { color: #92400e; }
  .od-status-select option[value="confirmed"] { color: #1d4ed8; }
  .od-status-select option[value="shipping"]  { color: #1d4ed8; }
  .od-status-select option[value="delivered"] { color: #15803d; }
  .od-status-select option[value="cancelled"] { color: #dc2626; }

  /* Change indicator */
  .od-changed-hint {
    font-size: 10px; color: #c8490c; font-weight: 600;
    margin-top: 5px; display: flex; align-items: center; gap: 4px;
    animation: odHintIn .2s ease both;
  }
  @keyframes odHintIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

  /* ── FOOTER ── */
  .od-footer {
    flex-shrink: 0; padding: 14px 20px;
    border-top: 0.5px solid #e8e4de; background: #fff;
    display: flex; gap: 10px; align-items: center;
  }
  .od-btn-print {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px; border-radius: 9px;
    border: 1px solid #e8e4de; background: transparent;
    font-size: 11px; font-weight: 600; color: #6b6560;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background .12s, border-color .12s;
  }
  .od-btn-print:hover { background: #f5f2ed; border-color: #c8c3bc; }
  .od-btn-close {
    padding: 9px 16px; border-radius: 9px;
    border: 1px solid #e8e4de; background: transparent;
    font-size: 12px; font-weight: 600; color: #6b6560;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background .12s;
  }
  .od-btn-close:hover { background: #f5f2ed; }
  .od-btn-save {
    flex: 1; padding: 10px 16px; border-radius: 10px;
    border: none; background: #1c1917; color: #fff;
    font-size: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif;
    letter-spacing: .3px; text-transform: uppercase; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: background .15s, transform .1s;
  }
  .od-btn-save:hover:not(:disabled) { background: #2f2a25; transform: translateY(-1px); }
  .od-btn-save:active { transform: translateY(0); }
  .od-btn-save:disabled { opacity: .4; cursor: not-allowed; transform: none; }
`;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const STATUS_STEPS = [
  { key: "pending", label: "Chờ xử lý", icon: <FaClock /> },
  { key: "confirmed", label: "Xác nhận", icon: <FaClipboardCheck /> },
  { key: "shipping", label: "Đang giao", icon: <FaTruck /> },
  { key: "delivered", label: "Hoàn thành", icon: <FaCheckCircle /> },
];

const STATUS_ORDER = ["pending", "confirmed", "shipping", "delivered"];

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang vận chuyển",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT — 100% logic gốc giữ nguyên
───────────────────────────────────────────────────────────── */
const OrderDetailModal = ({ show, handleClose, order, onUpdateStatus }) => {
  const [status, setStatus] = useState(order?.status || "pending");

  // Cập nhật state khi prop order thay đổi (GIỮ NGUYÊN)
  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  // Lock scroll
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const handleSave = () => {
    if (order && status !== order.status) {
      onUpdateStatus(order._id, status);
    }
    handleClose();
  };

  if (!show || !order) return null;

  const isCancelled = order.status === "cancelled" || status === "cancelled";
  const currentStepIdx = STATUS_ORDER.indexOf(order.status);

  // Tính tiền
  const itemsTotal =
    order.items?.reduce((s, i) => s + i.price_cents * i.quantity, 0) || 0;
  const discount = order.discountAmount || 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Overlay */}
      <div className="od-overlay" onClick={handleClose} />

      {/* Drawer */}
      <div className="od-drawer">
        {/* ── HEADER ── */}
        <div className="od-hd">
          <div className="od-hd-inner">
            <div className="od-hd-top">
              <div>
                <p className="od-order-num">Đơn hàng #{order.orderNumber}</p>
                <p className="od-order-date">
                  {new Date(order.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button className="od-close" onClick={handleClose}>
                <FaTimes />
              </button>
            </div>

            {/* Current status badge */}
            <div
              className={`od-hd-status ${isCancelled ? "cancelled" : order.status}`}
            >
              {isCancelled ? (
                <FaTimesCircle style={{ fontSize: 11 }} />
              ) : order.status === "delivered" ? (
                <FaCheckCircle style={{ fontSize: 11 }} />
              ) : order.status === "shipping" ? (
                <FaTruck style={{ fontSize: 11 }} />
              ) : (
                <FaClock style={{ fontSize: 11 }} />
              )}
              {STATUS_LABELS[order.status] || order.status}
            </div>
          </div>
        </div>

        {/* ── STATUS STEPPER ── */}
        {!isCancelled && (
          <div className="od-stepper">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIdx;
              const isActive = idx === currentStepIdx;
              const cls = isDone ? "done" : isActive ? "active" : "";
              return (
                <React.Fragment key={step.key}>
                  <div className="od-step">
                    <div className={`od-step-icon ${cls}`}>{step.icon}</div>
                    <div className={`od-step-lbl ${cls}`}>{step.label}</div>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`od-step-line${isDone ? " done" : ""}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ── BODY ── */}
        <div className="od-body">
          {/* 1. Thông tin khách hàng & giao hàng */}
          <div className="od-section">
            <div className="od-section-title">
              <FaUser />
              Thông tin giao hàng
            </div>
            <div className="od-info-grid">
              <div className="od-info-card">
                <p className="od-info-lbl">Khách hàng</p>
                <p className="od-info-val">
                  {order.userId?.name || "Khách vãng lai"}
                </p>
                <p
                  className="od-info-val"
                  style={{ fontSize: 11, color: "#6b6560", marginTop: 2 }}
                >
                  {order.userId?.email || "—"}
                </p>
              </div>
              <div className="od-info-card">
                <p className="od-info-lbl">Số điện thoại</p>
                <p className="od-info-val mono">
                  <FaPhone
                    style={{ fontSize: 9, marginRight: 4, opacity: 0.6 }}
                  />
                  {order.phoneNumber}
                </p>
                <p className="od-info-lbl" style={{ marginTop: 8 }}>
                  Thanh toán
                </p>
                <span className="od-pay-badge">
                  <FaCreditCard style={{ fontSize: 10 }} />
                  {order.paymentMethod === "cod" ||
                  order.paymentMethod === "COD"
                    ? "COD"
                    : order.paymentMethod}
                </span>
              </div>
              <div className="od-info-card od-info-full">
                <p className="od-info-lbl">
                  <FaMapMarkerAlt style={{ marginRight: 4 }} />
                  Địa chỉ giao hàng
                </p>
                <p className="od-info-val">{order.shippingAddress}</p>
              </div>
            </div>

            {order.note && (
              <div className="od-note">
                <strong>
                  <FaStickyNote style={{ marginRight: 5 }} />
                  Ghi chú:
                </strong>{" "}
                {order.note}
              </div>
            )}
          </div>

          {/* 2. Danh sách sản phẩm */}
          <div className="od-section">
            <div className="od-section-title">
              <FaBox />
              Sản phẩm ({order.items?.length || 0})
            </div>
            <div className="od-items">
              {order.items?.map((item, idx) => (
                <div key={idx} className="od-item">
                  <img
                    src={item.image || "https://placehold.co/48"}
                    alt={item.name}
                    className="od-item-img"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="od-item-name">{item.name}</div>
                    <div className="od-item-qty">
                      {item.price_cents?.toLocaleString("vi-VN")}đ ×{" "}
                      {item.quantity}
                    </div>
                  </div>
                  <div className="od-item-price">
                    {(item.price_cents * item.quantity).toLocaleString("vi-VN")}
                    đ
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Tổng kết */}
          <div className="od-section">
            <div className="od-section-title">Tổng kết đơn hàng</div>
            <div className="od-totals">
              <div className="od-total-row">
                <span>Tạm tính</span>
                <span style={{ fontFamily: "'DM Mono',monospace" }}>
                  {itemsTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {discount > 0 && (
                <div className="od-total-row">
                  <span>Giảm giá voucher</span>
                  <span className="od-total-disc">
                    −{discount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div className="od-total-row">
                <span>Phí vận chuyển</span>
                {order.totalAmount_cents > itemsTotal - discount ? (
                  <span style={{ fontFamily: "'DM Mono',monospace" }}>
                    {(
                      order.totalAmount_cents -
                      itemsTotal +
                      discount
                    ).toLocaleString("vi-VN")}
                    đ
                  </span>
                ) : (
                  <span className="od-total-green">Miễn phí</span>
                )}
              </div>
              <div className="od-total-row main">
                <span>Tổng cộng</span>
                <div className="od-tv">
                  {order.totalAmount_cents?.toLocaleString("vi-VN")} đ
                </div>
              </div>
            </div>
          </div>

          {/* 4. Cập nhật trạng thái */}
          <div className="od-section">
            <div className="od-section-title">Cập nhật trạng thái</div>
            <div className="od-status-select-wrap">
              <select
                className="od-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">⏳ Chờ xử lý</option>
                <option value="confirmed">✓ Đã xác nhận</option>
                <option value="shipping">🚚 Đang vận chuyển</option>
                <option value="delivered">✅ Đã giao hàng (Hoàn thành)</option>
                <option value="cancelled">✕ Đã hủy</option>
              </select>
              <FaChevronDown className="od-select-chevron" />
            </div>

            {status !== order.status && (
              <div className="od-changed-hint">
                ● Thay đổi chưa được lưu —&nbsp;
                <span style={{ color: "#1c1917", fontWeight: 500 }}>
                  {STATUS_LABELS[order.status]} → {STATUS_LABELS[status]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="od-footer">
          <button
            className="od-btn-print"
            onClick={() => alert("Tính năng in đang phát triển")}
          >
            <FaPrint style={{ fontSize: 11 }} /> In hóa đơn
          </button>
          <button className="od-btn-close" onClick={handleClose}>
            Đóng
          </button>
          <button
            className="od-btn-save"
            onClick={handleSave}
            disabled={status === order.status}
          >
            <FaSave style={{ fontSize: 11 }} /> Lưu thay đổi
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderDetailModal;
