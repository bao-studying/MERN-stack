import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowRight,
  FaCheckCircle,
  FaSignInAlt,
  FaShoppingCart,
  FaTicketAlt,
  FaTimes,
  FaBox,
  FaTruck,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import axiosClient from "../../services/axiosClient";
import toast from "react-hot-toast";
import "../../assets/styles/cart-checkout.css";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .ct-root {
    --tx:    #1c1917;
    --mu:    #6b6560;
    --su:    #a09890;
    --bd:    #e8e4de;
    --bg:    #f5f2ed;
    --surf:  #ffffff;
    --ac:    #c8490c;
    --acl:   #fff4f0;
    --gn:    #15803d;
    --gnl:   #f0fdf4;
    --font:  'DM Sans', sans-serif;
    --serif: 'Cormorant Garamond', serif;
    --mono:  'DM Mono', monospace;
    min-height: 100vh;
    font-family: var(--font);
    position: relative;
    overflow-x: hidden;
  }

  .ct-progress {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 3px; background: var(--bd);
  }
  .ct-progress-fill {
    height: 100%; width: 33%;
    background: linear-gradient(90deg, var(--ac), #e85d24);
    position: relative;
  }
  .ct-progress-fill::after {
    content: ''; position: absolute; right: -1px; top: 0; bottom: 0;
    width: 6px; background: #e85d24; border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(232,93,36,.7);
  }

  .ct-backdrop {
    position: fixed; inset: 0; z-index: 0;
    background: var(--bg); overflow: hidden;
  }
  .ct-backdrop-grid {
    display: grid; grid-template-columns: repeat(5, 1fr);
    gap: 12px; padding: 60px 40px 40px;
    filter: blur(3px) saturate(.7);
    transform: scale(1.04); pointer-events: none;
  }
  .ct-backdrop-card {
    background: #fff; border-radius: 12px;
    border: 0.5px solid #e8e4de; overflow: hidden;
    aspect-ratio: 3/4; display: flex; flex-direction: column;
  }
  .ct-backdrop-img {
    flex: 1; background: linear-gradient(135deg, #f0ece6, #e8e4de);
    display: flex; align-items: center; justify-content: center;
  }
  .ct-backdrop-info { padding: 8px; }
  .ct-backdrop-name { height: 8px; background: #d6d1cb; border-radius: 2px; margin-bottom: 5px; }
  .ct-backdrop-price { height: 10px; width: 55%; background: #c8c3bc; border-radius: 2px; }
  .ct-backdrop-dim { position: absolute; inset: 0; background: rgba(245,242,237,.78); }

  .ct-modal-wrap {
    position: relative; z-index: 10; min-height: 100vh;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 52px 20px 60px;
  }

  .ct-modal {
    width: 100%; max-width: 1060px;
    background: var(--surf); border-radius: 22px;
    box-shadow:
      0 0 0 0.5px rgba(0,0,0,.06),
      0 4px 16px rgba(0,0,0,.06),
      0 16px 48px rgba(0,0,0,.1),
      0 48px 96px rgba(0,0,0,.08);
    overflow: hidden;
    animation: ctIn .45s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes ctIn {
    from { opacity:0; transform:translateY(20px) scale(.985); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .ct-modal-header {
    padding: 20px 32px 18px;
    border-bottom: 0.5px solid var(--bd);
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .ct-back {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 500; color: var(--mu);
    text-decoration: none; transition: color .12s; white-space: nowrap;
  }
  .ct-back:hover { color: var(--tx); }
  .ct-modal-title {
    font-family: var(--serif); font-size: 22px; font-weight: 500;
    color: var(--tx); margin: 0; letter-spacing: -.2px; white-space: nowrap;
  }

  .ct-steps { display: flex; align-items: center; }
  .ct-step-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: var(--su); white-space: nowrap;
  }
  .ct-step-item.active { color: var(--tx); }
  .ct-step-count {
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--bd); color: var(--mu);
    font-size: 11px; font-weight: 600; font-family: var(--mono);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ct-step-item.active .ct-step-count { background: var(--tx); color: #fff; }
  .ct-step-line { width: 28px; height: 1px; background: var(--bd); margin: 0 6px; }

  .ct-modal-body { display: grid; grid-template-columns: 1fr 350px; }

  .ct-items-panel {
    padding: 24px 28px; border-right: 0.5px solid var(--bd);
    overflow-y: auto; max-height: calc(100vh - 200px);
  }
  .ct-items-panel::-webkit-scrollbar { width: 3px; }
  .ct-items-panel::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 2px; }

  /* Select-all bar */
  .ct-select-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border-radius: 10px;
    background: var(--bg); border: 0.5px solid var(--bd); margin-bottom: 14px;
  }
  .ct-check-row { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .ct-checkbox {
    width: 16px; height: 16px; border-radius: 4px;
    border: 1.5px solid var(--bd); background: var(--surf);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: border-color .12s, background .12s; cursor: pointer;
  }
  .ct-checkbox.checked  { background: var(--tx); border-color: var(--tx); }
  .ct-checkbox.partial  { border-color: var(--mu); }
  .ct-select-lbl   { font-size: 12px; font-weight: 600; color: var(--tx); }
  .ct-select-count { font-size: 11px; font-family: var(--mono); color: var(--su); }
  .ct-del-btn {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #dc2626;
    background: none; border: none; cursor: pointer; padding: 4px 8px;
    border-radius: 6px; transition: background .12s;
  }
  .ct-del-btn:hover { background: #fee2e2; }

  /* ── PRODUCT GROUP HEADER ── */
  .ct-product-group { margin-bottom: 4px; }
  .ct-product-group-header {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 10px 6px;
    border-bottom: 0.5px solid var(--bd);
    margin-bottom: 2px;
  }
  .ct-group-img {
    width: 36px; height: 36px; border-radius: 8px; object-fit: cover;
    border: 0.5px solid var(--bd); flex-shrink: 0; background: var(--bg);
  }
  .ct-group-name {
    font-size: 12px; font-weight: 600; color: var(--tx);
    text-decoration: none; flex: 1; min-width: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .12s;
  }
  .ct-group-name:hover { color: var(--ac); }
  .ct-group-cat {
    font-size: 10px; color: var(--su); font-weight: 400;
  }

  /* ── VARIANT LINE ITEM ── */
  .ct-variant-line {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 10px 10px 56px;
    border-bottom: 0.5px solid rgba(232,228,222,.5);
    border-radius: 8px;
    transition: background .15s;
    animation: ctItemIn .28s ease both;
    position: relative;
  }
  .ct-variant-line:last-child { border-bottom: none; }
  .ct-variant-line:hover { background: rgba(200,73,12,.022); }
  @keyframes ctItemIn {
    from { opacity:0; transform:translateX(-5px); }
    to   { opacity:1; transform:translateX(0); }
  }

  /* Variant label block */
  .ct-vline-info { flex: 1; min-width: 0; }

  .ct-vline-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 20px;
    background: var(--bg); border: 0.5px solid var(--bd);
    font-size: 11px; font-weight: 500; color: var(--tx);
    margin-bottom: 5px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 100%;
  }
  .ct-vline-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--ac); flex-shrink: 0;
  }
  .ct-vline-default {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 20px;
    background: var(--bg); border: 0.5px solid var(--bd);
    font-size: 11px; font-weight: 500; color: var(--su);
    margin-bottom: 5px;
  }

  .ct-vline-attrs {
    display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 5px;
  }
  .ct-attr-chip {
    font-size: 10px; font-weight: 500;
    padding: 1px 7px; border-radius: 4px;
    background: #f0ece8; color: var(--mu);
    border: 0.5px solid var(--bd);
    font-family: var(--mono);
  }
  .ct-attr-key {
    color: var(--su); font-weight: 400; margin-right: 2px;
  }

  .ct-vline-price { font-size: 11px; color: var(--mu); font-family: var(--mono); }

  /* stock warning */
  .ct-stock-warn {
    font-size: 10px; color: #d97706; font-weight: 500;
    margin-top: 3px; display: flex; align-items: center; gap: 4px;
  }
  .ct-stock-out {
    font-size: 10px; color: #dc2626; font-weight: 600;
    margin-top: 3px; display: flex; align-items: center; gap: 4px;
  }

  /* Qty */
  .ct-qty {
    display: flex; align-items: center;
    border: 1px solid var(--bd); border-radius: 8px; overflow: hidden;
    width: fit-content; background: var(--surf); flex-shrink: 0;
    transition: border-color .12s;
  }
  .ct-qty:focus-within { border-color: var(--ac); }
  .ct-qty-btn {
    width: 28px; height: 28px; background: none; border: none;
    color: var(--mu); font-size: 10px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .12s, color .12s;
  }
  .ct-qty-btn:hover:not(:disabled) { background: var(--bg); color: var(--tx); }
  .ct-qty-btn:disabled { opacity: .3; cursor: not-allowed; }
  .ct-qty-val {
    width: 32px; height: 28px; text-align: center;
    font-size: 12px; font-weight: 600; font-family: var(--mono);
    color: var(--tx); background: none; border: none; outline: none;
    border-left: 1px solid var(--bd); border-right: 1px solid var(--bd);
  }

  /* Line total + delete */
  .ct-vline-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .ct-vline-total {
    font-family: var(--serif); font-size: 16px; font-weight: 600;
    color: var(--tx); letter-spacing: -.2px; line-height: 1;
    white-space: nowrap; min-width: 80px; text-align: right;
  }
  .ct-item-del {
    background: none; border: none; cursor: pointer; color: var(--su);
    font-size: 12px; padding: 5px; border-radius: 7px;
    transition: color .12s, background .12s; display: flex; align-items: center;
  }
  .ct-item-del:hover { color: #dc2626; background: #fee2e2; }

  .ct-continue {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 500; color: var(--mu);
    text-decoration: none; margin-top: 18px; transition: color .12s;
  }
  .ct-continue:hover { color: var(--ac); }

  /* ── SUMMARY PANEL ── */
  .ct-summary-panel {
    padding: 24px 22px; background: var(--bg);
    display: flex; flex-direction: column;
    max-height: calc(100vh - 200px); overflow-y: auto;
  }
  .ct-summary-panel::-webkit-scrollbar { width: 3px; }
  .ct-summary-panel::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 2px; }
  .ct-summary-title {
    font-family: var(--serif); font-size: 16px; font-weight: 500; font-style: italic;
    color: var(--tx); margin: 0 0 14px;
  }

  .ct-freeship {
    padding: 11px 14px; border-radius: 10px;
    background: var(--surf); border: 0.5px solid var(--bd); margin-bottom: 14px;
  }
  .ct-freeship-text { font-size: 11px; color: var(--mu); margin-bottom: 7px; }
  .ct-freeship-text strong { color: var(--ac); font-weight: 700; }
  .ct-freeship-text.done { color: var(--gn); font-weight: 600; display: flex; align-items: center; gap: 5px; margin-bottom: 0; }
  .ct-freeship-text.empty { margin-bottom: 0; text-align: center; }
  .ct-prog-bar { height: 5px; background: var(--bd); border-radius: 10px; overflow: hidden; }
  .ct-prog-fill {
    height: 100%; border-radius: 10px;
    background: linear-gradient(90deg, var(--gn), #16a34a);
    transition: width .4s cubic-bezier(.16,1,.3,1);
  }

  .ct-voucher-lbl {
    font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase;
    color: var(--mu); display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
  }
  .ct-voucher-row { display: flex; gap: 6px; margin-bottom: 4px; }
  .ct-voucher-input {
    flex: 1; padding: 7px 10px; border: 1px solid var(--bd); border-radius: 8px;
    font-size: 12px; font-family: var(--mono); color: var(--tx);
    background: var(--surf); outline: none; text-transform: uppercase; letter-spacing: .5px;
    transition: border-color .12s;
  }
  .ct-voucher-input:focus { border-color: var(--ac); }
  .ct-voucher-input:disabled { opacity: .4; }
  .ct-voucher-apply {
    padding: 7px 12px; border-radius: 8px; background: var(--tx); color: #fff;
    border: none; font-size: 11px; font-weight: 600; font-family: var(--font);
    cursor: pointer; white-space: nowrap; transition: background .12s;
  }
  .ct-voucher-apply:hover:not(:disabled) { background: #2f2a25; }
  .ct-voucher-apply:disabled { opacity: .4; cursor: not-allowed; }
  .ct-voucher-hint { font-size: 10px; color: var(--su); margin-top: 3px; }
  .ct-voucher-err  { font-size: 11px; color: #dc2626; margin-top: 3px; }
  .ct-voucher-chip {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 11px; border-radius: 8px;
    background: var(--gnl); border: 1px solid #bbf7d0;
    animation: ctChipIn .2s ease both;
  }
  @keyframes ctChipIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  .ct-v-code { font-size: 12px; font-weight: 700; color: var(--gn); font-family: var(--mono); }
  .ct-v-desc { font-size: 10px; color: var(--mu); }
  .ct-v-val  { font-size: 12px; font-weight: 700; color: var(--gn); font-family: var(--mono); }
  .ct-v-rm { background: none; border: none; cursor: pointer; color: var(--su); padding: 2px; display: flex; align-items: center; transition: color .12s; }
  .ct-v-rm:hover { color: #dc2626; }

  .ct-divider { height: 0.5px; background: var(--bd); margin: 12px 0; }

  .ct-total-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--mu); margin-bottom: 7px; }
  .ct-total-row.main {
    font-size: 14px; font-weight: 700; color: var(--tx);
    border-top: 0.5px solid var(--bd); padding-top: 11px; margin-top: 4px; margin-bottom: 2px;
  }
  .ct-total-row.main .ct-t-val { font-family: var(--serif); font-size: 22px; font-weight: 600; color: var(--gn); letter-spacing: -.3px; }
  .ct-t-green { color: var(--gn); font-weight: 600; }
  .ct-t-disc  { color: var(--gn); font-weight: 600; font-family: var(--mono); }
  .ct-t-mono  { font-family: var(--mono); font-weight: 500; }
  .ct-vat     { font-size: 10px; color: var(--su); text-align: right; margin-top: 1px; }

  .ct-cta {
    width: 100%; padding: 13px 20px; border-radius: 12px;
    background: var(--tx); color: #fff; border: none;
    font-size: 12px; font-weight: 700; font-family: var(--font);
    letter-spacing: .5px; text-transform: uppercase; cursor: pointer; margin-top: 14px;
    transition: background .15s, transform .1s, box-shadow .15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .ct-cta:hover:not(:disabled) { background: #2f2a25; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(28,25,23,.18); }
  .ct-cta:active { transform: translateY(0); box-shadow: none; }
  .ct-cta:disabled { opacity: .4; cursor: not-allowed; transform: none; }
  .ct-cta-note { font-size: 10px; color: var(--su); text-align: center; margin-top: 7px; }

  .ct-empty { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; z-index: 10; }
  .ct-empty-card {
    background: var(--surf); border-radius: 20px; padding: 48px 40px;
    text-align: center; max-width: 380px;
    box-shadow: 0 8px 32px rgba(0,0,0,.08), 0 32px 64px rgba(0,0,0,.06);
    animation: ctIn .4s cubic-bezier(.16,1,.3,1) both;
  }
  .ct-empty-icon {
    width: 64px; height: 64px; border-radius: 16px;
    background: var(--bg); border: 0.5px solid var(--bd);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; color: var(--su); font-size: 22px;
  }
  .ct-empty-title { font-family: var(--serif); font-size: 24px; font-weight: 500; font-style: italic; color: var(--tx); margin: 0 0 8px; }
  .ct-empty-sub   { font-size: 13px; color: var(--mu); margin-bottom: 20px; }
  .ct-empty-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 24px; border-radius: 10px;
    background: var(--tx); color: #fff;
    font-size: 13px; font-weight: 600; font-family: var(--font);
    text-decoration: none; transition: background .12s, transform .1s;
  }
  .ct-empty-btn:hover { background: #2f2a25; transform: translateY(-1px); color: #fff; }

  @media (max-width: 768px) {
    .ct-modal-body { grid-template-columns: 1fr; }
    .ct-items-panel { border-right: none; border-bottom: 0.5px solid var(--bd); max-height: none; }
    .ct-summary-panel { max-height: none; }
    .ct-modal-wrap { padding: 48px 12px 40px; }
    .ct-modal-header { flex-wrap: wrap; gap: 10px; }
    .ct-variant-line { padding-left: 10px; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   BACKDROP
───────────────────────────────────────────────────────────── */
const BackdropGrid = () => (
  <div className="ct-backdrop">
    <div className="ct-backdrop-grid">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="ct-backdrop-card">
          <div className="ct-backdrop-img">
            <FaBox size={20} color="#c8c3bc" />
          </div>
          <div className="ct-backdrop-info">
            <div
              className="ct-backdrop-name"
              style={{ width: `${55 + (i % 5) * 9}%` }}
            />
            <div className="ct-backdrop-price" />
          </div>
        </div>
      ))}
    </div>
    <div className="ct-backdrop-dim" />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   KEY HELPER
   Mỗi dòng trong cart là 1 cặp product + variant duy nhất.
   Nếu không có variant thì dùng "default".
───────────────────────────────────────────────────────────── */
const getLineKey = (item) => {
  const pid = item.productId?._id || item.productId;
  const vid = item.variant?._id || item.variantId || "default";
  return `${pid}__${vid}`;
};

const getItemPrice = (item) =>
  item.variant?.price_cents ?? item.productId?.price_cents ?? 0;

/* ─────────────────────────────────────────────────────────────
   VARIANT LABEL — tên + attributes dạng chip
───────────────────────────────────────────────────────────── */
const VariantLabel = ({ variant, variantId, product }) => {
  // ➔ SỬA DÒNG NÀY: Ép cả 2 ID về chuỗi chữ thường để tránh lệch kiểu dữ liệu từ MongoDB
  const activeVariant =
    variant ||
    product?.variants?.find(
      (v) =>
        v._id?.toString().toLowerCase() === variantId?.toString().toLowerCase(),
    );

  if (!activeVariant || variantId === "default") {
    return <div className="ct-vline-default">Sản phẩm đơn</div>;
  }

  const attrs = activeVariant.attributes
    ? Object.entries(activeVariant.attributes).filter(([, v]) => v)
    : [];

  const isDefault = !activeVariant.name || activeVariant.name === "Mặc định";

  return (
    <div>
      {!isDefault && (
        <div className="ct-vline-badge">
          <span className="ct-vline-dot" />
          {activeVariant.name}
        </div>
      )}
      {attrs.length > 0 && (
        <div className="ct-vline-attrs">
          {attrs.map(([key, val]) => (
            <span key={key} className="ct-attr-chip">
              <span className="ct-attr-key">{key}:</span> {val}
            </span>
          ))}
        </div>
      )}
      {isDefault && attrs.length === 0 && (
        <div className="ct-vline-default">Mặc định</div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  // selectedItems giờ lưu lineKey (productId__variantId) thay vì chỉ productId
  const [selectedItems, setSelectedItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");

  // Safe guard — giữ nguyên logic gốc
  const validCartItems = useMemo(
    () =>
      Array.isArray(cartItems)
        ? cartItems.filter(
            (item) => item && item.productId && item.productId._id,
          )
        : [],
    [cartItems],
  );

  // Group theo productId để hiển thị header sản phẩm 1 lần,
  // các biến thể bên dưới
  const groupedItems = useMemo(() => {
    const map = new Map();
    validCartItems.forEach((item) => {
      const pid = item.productId._id;
      if (!map.has(pid)) {
        map.set(pid, { product: item.productId, lines: [] });
      }
      map.get(pid).lines.push(item);
    });
    return Array.from(map.values());
  }, [validCartItems]);

  // Tất cả lineKey có trong cart
  const allLineKeys = useMemo(
    () => validCartItems.map(getLineKey),
    [validCartItems],
  );

  /* ── SELECTION — dùng lineKey thay vì productId ── */
  const handleSelectLine = (lineKey) =>
    setSelectedItems((prev) =>
      prev.includes(lineKey)
        ? prev.filter((k) => k !== lineKey)
        : [...prev, lineKey],
    );

  const handleSelectAll = (checked) =>
    setSelectedItems(checked ? [...allLineKeys] : []);

  const handleRemoveSelected = () => {
    if (window.confirm(`Bạn muốn xóa ${selectedItems.length} dòng đã chọn?`)) {
      selectedItems.forEach((lineKey) => {
        const item = validCartItems.find((i) => getLineKey(i) === lineKey);
        if (item) {
          const vid = item.variant?._id || item.variantId;
          removeFromCart(item.productId._id, vid);
        }
      });
      setSelectedItems([]);
    }
  };

  const isAllSelected =
    allLineKeys.length > 0 && selectedItems.length === allLineKeys.length;
  const isPartialSel = selectedItems.length > 0 && !isAllSelected;

  /* ── TÍNH TIỀN — theo lineKey ── */
  const subtotal = useMemo(
    () =>
      validCartItems.reduce((acc, item) => {
        if (selectedItems.includes(getLineKey(item)))
          return acc + getItemPrice(item) * item.quantity;
        return acc;
      }, 0),
    [validCartItems, selectedItems],
  );

  const FREESHIP_THRESHOLD = 300000;
  const SHIPPING_FEE = 30000;
  const isFreeShip = subtotal >= FREESHIP_THRESHOLD;
  const currentShippingFee = subtotal > 0 && !isFreeShip ? SHIPPING_FEE : 0;

  const discountAmount = appliedVoucher?.discount || 0;
  const effectiveShipping =
    appliedVoucher?.type === "freeship" ? 0 : currentShippingFee;
  const finalTotal = subtotal + effectiveShipping - discountAmount;
  const progress = Math.min((subtotal / FREESHIP_THRESHOLD) * 100, 100);

  // Dọn selectedItems khi cart thay đổi
  useEffect(() => {
    const validKeys = new Set(allLineKeys);
    setSelectedItems((prev) => prev.filter((k) => validKeys.has(k)));
  }, [allLineKeys]);

  // Gỡ voucher nếu không còn đủ điều kiện
  useEffect(() => {
    if (!appliedVoucher) return;
    const minOrder = appliedVoucher.minOrder || 0;
    if (
      selectedItems.length === 0 ||
      subtotal <= 0 ||
      subtotal < minOrder ||
      discountAmount > subtotal
    ) {
      setAppliedVoucher(null);
      setVoucherError("");
      toast("Voucher đã được gỡ vì đơn hàng không còn đủ điều kiện", {
        icon: "ℹ️",
      });
    }
  }, [appliedVoucher, selectedItems.length, subtotal, discountAmount]);

  /* ── VOUCHER ── */
  const handleApplyVoucher = async () => {
    if (!couponCode.trim()) return;
    setVoucherError("");
    setVoucherLoading(true);
    try {
      const res = await axiosClient.post("/vouchers/validate", {
        code: couponCode.trim(),
        orderAmount: subtotal,
      });
      if (res.success) {
        setAppliedVoucher({
          _id: res.voucher._id,
          code: res.voucher.code,
          description: res.voucher.description,
          type: res.voucher.type,
          minOrder: res.voucher.minOrder || 0,
          discount: res.discount,
        });
        toast.success(`Áp dụng "${res.voucher.code}" thành công!`);
        setCouponCode("");
      }
    } catch (err) {
      setVoucherError(err.response?.data?.message || "Mã voucher không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
    toast("Đã xóa voucher", { icon: "🗑️" });
  };

  /* ── CHECKOUT — truyền thêm selectedLineKeys để checkout biết variant nào ── */
  const handleCheckout = () =>
    navigate("/checkout", {
      state: {
        selectedProductIds: selectedItems, // giờ là mảng lineKey
        appliedVoucher: appliedVoucher || null,
        discount: discountAmount,
      },
    });

  /* ── EMPTY STATES ── */
  if (!user)
    return (
      <div className="ct-root">
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <div className="ct-progress">
          <div className="ct-progress-fill" />
        </div>
        <BackdropGrid />
        <div className="ct-empty">
          <div className="ct-empty-card">
            <div className="ct-empty-icon">
              <FaSignInAlt />
            </div>
            <h2 className="ct-empty-title">Xác thực tài khoản</h2>
            <p className="ct-empty-sub">Vui lòng đăng nhập để xem giỏ hàng.</p>
            <Link to="/login" className="ct-empty-btn">
              Đăng nhập ngay <FaArrowRight style={{ fontSize: 11 }} />
            </Link>
          </div>
        </div>
      </div>
    );

  if (validCartItems.length === 0)
    return (
      <div className="ct-root">
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <div className="ct-progress">
          <div className="ct-progress-fill" />
        </div>
        <BackdropGrid />
        <div className="ct-empty">
          <div className="ct-empty-card">
            <div className="ct-empty-icon">
              <FaShoppingCart />
            </div>
            <h2 className="ct-empty-title">Giỏ hàng trống</h2>
            <p className="ct-empty-sub">Chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to="/products" className="ct-empty-btn">
              Khám phá ngay <FaArrowRight style={{ fontSize: 11 }} />
            </Link>
          </div>
        </div>
      </div>
    );

  /* ── MAIN RENDER ── */
  return (
    <div className="ct-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="ct-progress">
        <div className="ct-progress-fill" />
      </div>
      <BackdropGrid />

      <div className="ct-modal-wrap">
        <div className="ct-modal">
          {/* HEADER */}
          <div className="ct-modal-header">
            <Link to="/products" className="ct-back">
              <FaArrowLeft style={{ fontSize: 11 }} /> Tiếp tục mua sắm
            </Link>
            <h1 className="ct-modal-title">Giỏ hàng</h1>
            <div className="ct-steps">
              <div className="ct-step-item active">
                <div className="ct-step-count">1</div>
                <span>Giỏ hàng</span>
              </div>
              <div className="ct-step-line" />
              <div className="ct-step-item">
                <div className="ct-step-count">2</div>
                <span>Thanh toán</span>
              </div>
              <div className="ct-step-line" />
              <div className="ct-step-item">
                <div className="ct-step-count">3</div>
                <span>Hoàn tất</span>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="ct-modal-body">
            {/* LEFT: ITEMS */}
            <div className="ct-items-panel">
              {/* Select-all */}
              <div className="ct-select-bar">
                <div
                  className="ct-check-row"
                  onClick={() => handleSelectAll(!isAllSelected)}
                >
                  <div
                    className={`ct-checkbox${isAllSelected ? " checked" : isPartialSel ? " partial" : ""}`}
                  >
                    {isAllSelected && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path
                          d="M1 3.5L3.5 6L8 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {isPartialSel && !isAllSelected && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path
                          d="M1.5 3.5H7.5"
                          stroke="#6b6560"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="ct-select-lbl">Chọn tất cả</span>
                  {/* Số dòng biến thể, không phải số sản phẩm */}
                  <span className="ct-select-count">
                    ({allLineKeys.length} biến thể)
                  </span>
                </div>
                {selectedItems.length > 0 && (
                  <button className="ct-del-btn" onClick={handleRemoveSelected}>
                    <FaTrash style={{ fontSize: 10 }} /> Xóa (
                    {selectedItems.length})
                  </button>
                )}
              </div>

              {/* Grouped product list */}
              {groupedItems.map(({ product, lines }, gIdx) => (
                <div
                  key={product._id}
                  className="ct-product-group"
                  style={{ animationDelay: `${gIdx * 0.06}s` }}
                >
                  {/* Product header — chỉ hiện tên + ảnh 1 lần */}
                  <div className="ct-product-group-header">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={
                          product.images?.[0]?.imageUrl ||
                          "https://placehold.co/36"
                        }
                        alt={product.name}
                        className="ct-group-img"
                      />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/product/${product.slug}`}
                        className="ct-group-name"
                      >
                        {product.name}
                      </Link>
                      {product.categoryId?.name && (
                        <div className="ct-group-cat">
                          {product.categoryId.name}
                        </div>
                      )}
                    </div>
                    {/* Badge số biến thể nếu > 1 */}
                    {lines.length > 1 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--ac)",
                          background: "var(--acl)",
                          border: "0.5px solid rgba(200,73,12,.2)",
                          borderRadius: 20,
                          padding: "2px 8px",
                          flexShrink: 0,
                        }}
                      >
                        {lines.length} biến thể
                      </span>
                    )}
                  </div>

                  {/* Variant lines */}
                  {lines.map((item, lIdx) => {
                    const lineKey = getLineKey(item);
                    const isSelected = selectedItems.includes(lineKey);
                    const price = getItemPrice(item);
                    const variantStock = item.variant?.stock ?? Infinity;
                    const isOutOfStock = variantStock === 0;
                    const vid = item.variant?._id || item.variantId;

                    return (
                      <div
                        key={lineKey}
                        className="ct-variant-line"
                        style={{
                          animationDelay: `${(gIdx * 3 + lIdx) * 0.04}s`,
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className={`ct-checkbox${isSelected ? " checked" : ""}`}
                          style={{ flexShrink: 0 }}
                          onClick={() => handleSelectLine(lineKey)}
                        >
                          {isSelected && (
                            <svg
                              width="9"
                              height="7"
                              viewBox="0 0 9 7"
                              fill="none"
                            >
                              <path
                                d="M1 3.5L3.5 6L8 1"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>

                        {/* Variant info */}
                        <div className="ct-vline-info">
                          <VariantLabel
                            variant={item.variant}
                            variantId={vid}
                            product={product}
                          />{" "}
                          <div className="ct-vline-price">
                            {price.toLocaleString("vi-VN")} đ / sản phẩm
                          </div>
                          {isOutOfStock && (
                            <div className="ct-stock-out">⛔ Hết hàng</div>
                          )}
                          {!isOutOfStock &&
                            variantStock !== Infinity &&
                            variantStock <= 5 && (
                              <div className="ct-stock-warn">
                                ⚠ Còn {variantStock} sản phẩm
                              </div>
                            )}
                        </div>

                        {/* Qty */}
                        <div className="ct-qty">
                          <button
                            className="ct-qty-btn"
                            onClick={() =>
                              updateQuantity(
                                product._id,
                                item.quantity - 1,
                                vid,
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus />
                          </button>
                          <input
                            className="ct-qty-val"
                            value={item.quantity}
                            readOnly
                          />
                          <button
                            className="ct-qty-btn"
                            onClick={() =>
                              updateQuantity(
                                product._id,
                                item.quantity + 1,
                                vid,
                              )
                            }
                            disabled={
                              isOutOfStock || item.quantity >= variantStock
                            }
                          >
                            <FaPlus />
                          </button>
                        </div>

                        {/* Total + delete */}
                        <div className="ct-vline-right">
                          <div className="ct-vline-total">
                            {(price * item.quantity).toLocaleString("vi-VN")} đ
                          </div>
                          <button
                            className="ct-item-del"
                            onClick={() => removeFromCart(product._id, vid)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              <Link to="/products" className="ct-continue">
                <FaArrowLeft style={{ fontSize: 10 }} /> Tiếp tục khám phá
              </Link>
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="ct-summary-panel">
              <div className="ct-summary-title">Tổng kết đơn hàng</div>

              {/* Freeship */}
              <div className="ct-freeship">
                {subtotal === 0 ? (
                  <div className="ct-freeship-text empty">
                    Chọn sản phẩm để xem ưu đãi vận chuyển
                  </div>
                ) : subtotal < FREESHIP_THRESHOLD ? (
                  <>
                    <div className="ct-freeship-text">
                      Thêm{" "}
                      <strong>
                        {(FREESHIP_THRESHOLD - subtotal).toLocaleString(
                          "vi-VN",
                        )}{" "}
                        đ
                      </strong>{" "}
                      để miễn phí vận chuyển
                    </div>
                    <div className="ct-prog-bar">
                      <div
                        className="ct-prog-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="ct-freeship-text done">
                    <FaTruck style={{ fontSize: 12 }} /> Đủ điều kiện miễn phí
                    vận chuyển
                  </div>
                )}
              </div>

              {/* Voucher */}
              <div style={{ marginBottom: 12 }}>
                <div className="ct-voucher-lbl">
                  <FaTicketAlt style={{ fontSize: 10 }} /> Mã voucher
                </div>
                {!appliedVoucher ? (
                  <>
                    <div className="ct-voucher-row">
                      <input
                        className="ct-voucher-input"
                        placeholder="Nhập mã..."
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setVoucherError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyVoucher()
                        }
                        disabled={voucherLoading || selectedItems.length === 0}
                      />
                      <button
                        className="ct-voucher-apply"
                        onClick={handleApplyVoucher}
                        disabled={
                          voucherLoading ||
                          !couponCode.trim() ||
                          selectedItems.length === 0
                        }
                      >
                        {voucherLoading ? "..." : "Áp dụng"}
                      </button>
                    </div>
                    {selectedItems.length === 0 && (
                      <div className="ct-voucher-hint">
                        Chọn sản phẩm trước để áp voucher
                      </div>
                    )}
                    {voucherError && (
                      <div className="ct-voucher-err">{voucherError}</div>
                    )}
                  </>
                ) : (
                  <div className="ct-voucher-chip">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <FaCheckCircle
                        style={{
                          color: "var(--gn)",
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div className="ct-v-code">{appliedVoucher.code}</div>
                        <div className="ct-v-desc">
                          {appliedVoucher.description}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span className="ct-v-val">
                        {appliedVoucher.type === "freeship"
                          ? "Freeship"
                          : `−${appliedVoucher.discount.toLocaleString("vi-VN")}đ`}
                      </span>
                      <button className="ct-v-rm" onClick={handleRemoveVoucher}>
                        <FaTimes size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="ct-divider" />

              {/* Totals */}
              <div className="ct-total-row">
                <span>Tạm tính ({selectedItems.length} dòng)</span>
                <span className="ct-t-mono">
                  {subtotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="ct-total-row">
                <span>Phí vận chuyển</span>
                {subtotal === 0 ? (
                  <span className="ct-t-mono">—</span>
                ) : effectiveShipping === 0 ? (
                  <span className="ct-t-green">
                    {appliedVoucher?.type === "freeship"
                      ? "Miễn phí (voucher)"
                      : "Miễn phí"}
                  </span>
                ) : (
                  <span className="ct-t-mono">
                    {currentShippingFee.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="ct-total-row">
                  <span>Giảm giá voucher</span>
                  <span className="ct-t-disc">
                    −{discountAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div className="ct-total-row main">
                <span>Tổng cộng</span>
                <div className="ct-t-val">
                  {Math.max(0, finalTotal).toLocaleString("vi-VN")} đ
                </div>
              </div>
              <div className="ct-vat">(Đã bao gồm VAT)</div>

              <button
                className="ct-cta"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
              >
                Tiến hành thanh toán <FaArrowRight style={{ fontSize: 11 }} />
              </button>
              <div className="ct-cta-note">
                {selectedItems.length === 0
                  ? "Chọn ít nhất 1 sản phẩm để tiếp tục"
                  : `${selectedItems.length} dòng đã chọn`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
