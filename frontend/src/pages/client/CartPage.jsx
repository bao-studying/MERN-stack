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

/* ─────────────────────────────────────────────────────────────
   STYLES — Twin DNA với CheckoutPage
───────────────────────────────────────────────────────────── */
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

  /* ── PROGRESS BAR — Step 1 = 33% ── */
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

  /* ── BACKDROP ── */
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

  /* ── MODAL WRAPPER ── */
  .ct-modal-wrap {
    position: relative; z-index: 10; min-height: 100vh;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 52px 20px 60px;
  }

  /* ── MODAL CARD ── */
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

  /* ── MODAL HEADER ── */
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

  /* ── STEP WIZARD ── */
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

  /* ── MODAL BODY ── */
  .ct-modal-body { display: grid; grid-template-columns: 1fr 350px; }

  /* ── LEFT: ITEMS PANEL ── */
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

  /* Cart item */
  .ct-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 8px; border-bottom: 0.5px solid var(--bd);
    border-radius: 8px; transition: background .15s;
    animation: ctItemIn .3s ease both;
  }
  .ct-item:last-child { border-bottom: none; }
  .ct-item:hover { background: rgba(200,73,12,.025); }
  @keyframes ctItemIn {
    from { opacity:0; transform:translateX(-6px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .ct-item-img {
    width: 62px; height: 62px; border-radius: 10px; object-fit: cover;
    border: 0.5px solid var(--bd); display: block; background: var(--bg); flex-shrink: 0;
  }
  .ct-item-info { flex: 1; min-width: 0; }
  .ct-item-name {
    font-size: 13px; font-weight: 600; color: var(--tx); text-decoration: none;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
    margin-bottom: 3px; transition: color .12s;
  }
  .ct-item-name:hover { color: var(--ac); }
  .ct-item-unit { font-size: 11px; color: var(--mu); font-family: var(--mono); }

  /* Qty */
  .ct-qty {
    display: flex; align-items: center; margin-top: 8px;
    border: 1px solid var(--bd); border-radius: 8px; overflow: hidden;
    width: fit-content; background: var(--surf);
  }
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

  /* Item right */
  .ct-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
  .ct-item-total {
    font-family: var(--serif); font-size: 17px; font-weight: 500;
    color: var(--tx); letter-spacing: -.2px; line-height: 1;
  }
  .ct-item-del {
    background: none; border: none; cursor: pointer; color: var(--su);
    font-size: 12px; padding: 4px; border-radius: 6px;
    transition: color .12s, background .12s; display: flex; align-items: center;
  }
  .ct-item-del:hover { color: #dc2626; background: #fee2e2; }

  .ct-continue {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 500; color: var(--mu);
    text-decoration: none; margin-top: 16px; transition: color .12s;
  }
  .ct-continue:hover { color: var(--ac); }

  /* ── RIGHT: SUMMARY PANEL ── */
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

  /* Freeship */
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

  /* Voucher */
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

  /* Totals */
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

  /* CTA */
  .ct-cta {
    width: 100%; padding: 13px 20px; border-radius: 12px;
    background: var(--tx); color: #fff; border: none;
    font-size: 12px; font-weight: 700; font-family: var(--font);
    letter-spacing: .5px; text-transform: uppercase; cursor: pointer; margin-top: 14px;
    transition: background .15s, transform .1s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .ct-cta:hover:not(:disabled) { background: #2f2a25; transform: translateY(-1px); }
  .ct-cta:active { transform: translateY(0); }
  .ct-cta:disabled { opacity: .4; cursor: not-allowed; transform: none; }
  .ct-cta-note { font-size: 10px; color: var(--su); text-align: center; margin-top: 7px; }

  /* Empty / Auth */
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
  }
`;

/* ─────────────────────────────────────────────────────────────
   BACKDROP — giống hệt CheckoutPage
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
   MAIN COMPONENT — 100% logic gốc giữ nguyên
───────────────────────────────────────────────────────────── */
const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");

  // ── VOUCHER STATE (GIỮ NGUYÊN) ──────────────────────────────
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  // ────────────────────────────────────────────────────────────

  // --- SAFE GUARD (GIỮ NGUYÊN) ---
  const validCartItems = useMemo(
    () =>
      Array.isArray(cartItems)
        ? cartItems.filter(
            (item) => item && item.productId && item.productId._id,
          )
        : [],
    [cartItems],
  );

  // --- SELECTION LOGIC (GIỮ NGUYÊN) ---
  const handleSelectItem = (itemId) =>
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );

  const handleSelectAll = (checked) =>
    setSelectedItems(
      checked ? validCartItems.map((item) => item.productId._id) : [],
    );

  const handleRemoveSelected = () => {
    if (
      window.confirm(`Bạn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)
    ) {
      selectedItems.forEach((id) => removeFromCart(id));
      setSelectedItems([]);
    }
  };

  // --- TÍNH TOÁN TIỀN (GIỮ NGUYÊN) ---
  const subtotal = useMemo(
    () =>
      validCartItems.reduce((acc, item) => {
        if (selectedItems.includes(item.productId._id))
          return acc + (item.productId.price_cents || 0) * item.quantity;
        return acc;
      }, 0),
    [validCartItems, selectedItems],
  );

  const FREESHIP_THRESHOLD = 300000;
  const SHIPPING_FEE = 30000;
  const isFreeShip = subtotal >= FREESHIP_THRESHOLD;
  const currentShippingFee = subtotal > 0 && !isFreeShip ? SHIPPING_FEE : 0;

  // ── DISCOUNT & TOTAL (GIỮ NGUYÊN) ───────────────────────────
  const discountAmount = appliedVoucher?.discount || 0;
  const effectiveShipping =
    appliedVoucher?.type === "freeship" ? 0 : currentShippingFee;
  const finalTotal = subtotal + effectiveShipping - discountAmount;
  // ────────────────────────────────────────────────────────────

  const progress = Math.min((subtotal / FREESHIP_THRESHOLD) * 100, 100);
  const isAllSelected =
    validCartItems.length > 0 && selectedItems.length === validCartItems.length;
  const isPartialSel = selectedItems.length > 0 && !isAllSelected;

  useEffect(() => {
    const validIds = new Set(validCartItems.map((item) => item.productId._id));
    setSelectedItems((prev) => prev.filter((id) => validIds.has(id)));
  }, [validCartItems]);

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

  // ── ÁP DỤNG VOUCHER (GIỮ NGUYÊN) ───────────────────────────
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
  // ────────────────────────────────────────────────────────────

  // ── NAVIGATE KÈM VOUCHER (GIỮ NGUYÊN) ──────────────────────
  const handleCheckout = () =>
    navigate("/checkout", {
      state: {
        selectedProductIds: selectedItems,
        appliedVoucher: appliedVoucher || null,
        discount: discountAmount,
      },
    });
  // ────────────────────────────────────────────────────────────

  /* ── STATES: not logged in / empty cart ── */
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
            <p className="ct-empty-sub">
              Vui lòng đăng nhập để xem giỏ hàng của bạn.
            </p>
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
            <p className="ct-empty-sub">
              Chưa có sản phẩm nào trong giỏ hàng của bạn.
            </p>
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

      {/* Progress bar — Step 1/3 */}
      <div className="ct-progress">
        <div className="ct-progress-fill" />
      </div>

      {/* Backdrop */}
      <BackdropGrid />

      {/* Modal */}
      <div className="ct-modal-wrap">
        <div className="ct-modal">
          {/* ── HEADER ── */}
          <div className="ct-modal-header">
            <Link to="/products" className="ct-back">
              <FaArrowLeft style={{ fontSize: 11 }} /> Tiếp tục mua sắm
            </Link>

            <h1 className="ct-modal-title">Giỏ hàng</h1>

            {/* Step wizard — giữ nguyên vị trí */}
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

          {/* ── BODY ── */}
          <div className="ct-modal-body">
            {/* ─── LEFT: ITEMS ─── */}
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
                  <span className="ct-select-count">
                    ({validCartItems.length})
                  </span>
                </div>
                {selectedItems.length > 0 && (
                  <button className="ct-del-btn" onClick={handleRemoveSelected}>
                    <FaTrash style={{ fontSize: 10 }} /> Xóa (
                    {selectedItems.length})
                  </button>
                )}
              </div>

              {/* Items */}
              {validCartItems.map((item, idx) => {
                const product = item.productId;
                const price = product.price_cents || 0;
                const isSelected = selectedItems.includes(product._id);
                return (
                  <div
                    key={product._id}
                    className="ct-item"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    {/* Checkbox */}
                    <div
                      className={`ct-checkbox${isSelected ? " checked" : ""}`}
                      style={{ marginTop: 4, flexShrink: 0 }}
                      onClick={() => handleSelectItem(product._id)}
                    >
                      {isSelected && (
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
                    </div>

                    {/* Image */}
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={
                          product.images?.[0]?.imageUrl ||
                          "https://placehold.co/62"
                        }
                        alt={product.name}
                        className="ct-item-img"
                      />
                    </Link>

                    {/* Info */}
                    <div className="ct-item-info">
                      <Link
                        to={`/product/${product.slug}`}
                        className="ct-item-name"
                      >
                        {product.name}
                      </Link>
                      <div className="ct-item-unit">
                        {price.toLocaleString("vi-VN")} đ / sản phẩm
                      </div>
                      <div className="ct-qty">
                        <button
                          className="ct-qty-btn"
                          onClick={() =>
                            updateQuantity(product._id, item.quantity - 1)
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
                            updateQuantity(product._id, item.quantity + 1)
                          }
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>

                    {/* Total + delete */}
                    <div className="ct-item-right">
                      <button
                        className="ct-item-del"
                        onClick={() => removeFromCart(product._id)}
                      >
                        <FaTrash />
                      </button>
                      <div className="ct-item-total">
                        {(price * item.quantity).toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link to="/products" className="ct-continue">
                <FaArrowLeft style={{ fontSize: 10 }} /> Tiếp tục khám phá
              </Link>
            </div>

            {/* ─── RIGHT: SUMMARY ─── */}
            <div className="ct-summary-panel">
              <div className="ct-summary-title">Tổng kết đơn hàng</div>

              {/* Freeship progress */}
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
                      để được miễn phí vận chuyển
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
                <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
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

              {/* CTA */}
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
                  : `${selectedItems.length} sản phẩm đã được chọn`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
