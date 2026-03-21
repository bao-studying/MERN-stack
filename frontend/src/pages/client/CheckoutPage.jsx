import React, { useState, useMemo, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaUniversity,
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPlusCircle,
  FaAddressBook,
  FaStickyNote,
  FaTicketAlt,
  FaTimes,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaBox,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import orderApi from "../../services/order.service";
import userApi from "../../services/user.service";
import axiosClient from "../../services/axiosClient";
import toast from "react-hot-toast";
import "../../assets/styles/cart-checkout.css";

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .ck-root {
    --tx:    #1a1612;
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

  /* ── PROGRESS BAR TOP ── */
  .ck-progress {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 3px; background: var(--bd);
  }
  .ck-progress-fill {
    height: 100%; width: 66%;
    background: linear-gradient(90deg, var(--ac), #e85d24);
    position: relative; transition: width .4s ease;
  }
  .ck-progress-fill::after {
    content: ''; position: absolute; right: -1px; top: 0; bottom: 0;
    width: 6px; background: #e85d24; border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px #e85d24;
  }

  /* ── BLURRED BACKGROUND GRID ── */
  .ck-backdrop {
    position: fixed; inset: 0; z-index: 0;
    background: var(--bg); overflow: hidden;
  }
  .ck-backdrop-grid {
    display: grid; grid-template-columns: repeat(5, 1fr);
    gap: 12px; padding: 60px 40px 40px;
    filter: blur(3px) saturate(.7);
    transform: scale(1.04); pointer-events: none;
  }
  .ck-backdrop-card {
    background: #fff; border-radius: 12px;
    border: 0.5px solid #e8e4de; overflow: hidden;
    aspect-ratio: 3/4; display: flex; flex-direction: column;
  }
  .ck-backdrop-img {
    flex: 1; background: linear-gradient(135deg, #f0ece6, #e8e4de);
    display: flex; align-items: center; justify-content: center;
  }
  .ck-backdrop-info { padding: 8px; }
  .ck-backdrop-name { height: 8px; background: #d6d1cb; border-radius: 2px; margin-bottom: 5px; }
  .ck-backdrop-price { height: 10px; width: 55%; background: #c8c3bc; border-radius: 2px; }
  .ck-backdrop-dim {
    position: absolute; inset: 0;
    background: rgba(245,242,237,.78);
  }

  /* ── MODAL WRAPPER ── */
  .ck-modal-wrap {
    position: relative; z-index: 10;
    min-height: 100vh;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 52px 20px 60px;
  }

  /* ── MODAL CARD ── */
  .ck-modal {
    width: 100%; max-width: 1000px;
    background: var(--surf); border-radius: 22px;
    box-shadow:
      0 0 0 0.5px rgba(0,0,0,.06),
      0 4px 16px rgba(0,0,0,.06),
      0 16px 48px rgba(0,0,0,.1),
      0 48px 96px rgba(0,0,0,.08);
    overflow: hidden;
    animation: ckModalIn .45s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes ckModalIn {
    from { opacity:0; transform:translateY(20px) scale(.985); }
    to   { opacity:1; transform:translateY(0)    scale(1); }
  }

  /* ── MODAL HEADER ── */
  .ck-modal-header {
    padding: 20px 32px 18px;
    border-bottom: 0.5px solid var(--bd);
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .ck-back {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 500; color: var(--mu);
    text-decoration: none; transition: color .12s; white-space: nowrap;
  }
  .ck-back:hover { color: var(--tx); }
  .ck-modal-title {
    font-family: var(--serif); font-size: 22px; font-weight: 500;
    color: var(--tx); margin: 0; letter-spacing: -.2px;
  }

  /* ── STEP WIZARD — giữ nguyên bố cục ── */
  .ck-steps {
    display: flex; align-items: center;
  }
  .ck-step-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: var(--su); white-space: nowrap;
  }
  .ck-step-item.completed { color: var(--gn); }
  .ck-step-item.active    { color: var(--tx); }
  .ck-step-count {
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--bd); color: var(--mu);
    font-size: 11px; font-weight: 600; font-family: var(--mono);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ck-step-item.completed .ck-step-count { background: var(--gn); color: #fff; }
  .ck-step-item.active    .ck-step-count { background: var(--tx); color: #fff; }
  .ck-step-line { width: 28px; height: 1px; background: var(--bd); margin: 0 6px; }
  .ck-step-line.active { background: var(--gn); }

  /* ── MODAL BODY 2-col ── */
  .ck-modal-body { display: grid; grid-template-columns: 1fr 350px; }

  /* ── LEFT FORM ── */
  .ck-form-panel {
    padding: 28px 32px; border-right: 0.5px solid var(--bd);
    overflow-y: auto; max-height: calc(100vh - 200px);
  }
  .ck-form-panel::-webkit-scrollbar { width: 3px; }
  .ck-form-panel::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 2px; }

  .ck-section-label {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
  }
  .ck-section-title {
    font-family: var(--serif); font-size: 17px; font-weight: 500; font-style: italic;
    color: var(--tx); margin: 0; display: flex; align-items: center; gap: 8px;
  }
  .ck-section-num {
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--tx); color: #fff;
    font-size: 10px; font-weight: 700; font-family: var(--mono);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ck-divider { height: 0.5px; background: var(--bd); margin: 22px 0; }

  .ck-user-strip {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
    background: var(--bg); border-radius: 10px; border: 0.5px solid var(--bd);
    margin-bottom: 16px; font-size: 12px; color: var(--mu);
  }
  .ck-user-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--bd); display: flex; align-items: center; justify-content: center;
    color: var(--mu); font-size: 11px; flex-shrink: 0;
  }

  .ck-addr-card {
    padding: 11px 14px; border-radius: 10px;
    border: 1px solid var(--bd); background: var(--surf); cursor: pointer;
    transition: border-color .12s, background .12s;
    display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;
  }
  .ck-addr-card:hover { border-color: var(--su); }
  .ck-addr-card.selected { border-color: var(--ac); background: var(--acl); }
  .ck-radio {
    width: 16px; height: 16px; border-radius: 50%;
    border: 1.5px solid var(--bd); flex-shrink: 0; margin-top: 2px;
    display: flex; align-items: center; justify-content: center; transition: border-color .12s;
  }
  .ck-addr-card.selected .ck-radio { border-color: var(--ac); }
  .ck-radio-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ac); }
  .ck-addr-name { font-size: 13px; font-weight: 600; color: var(--tx); }
  .ck-addr-phone { font-size: 11px; color: var(--mu); font-family: var(--mono); }
  .ck-addr-line { font-size: 12px; color: var(--mu); margin-top: 2px; }
  .ck-addr-scroll { max-height: 240px; overflow-y: auto; padding-right: 2px; }
  .ck-addr-scroll::-webkit-scrollbar { width: 2px; }
  .ck-addr-scroll::-webkit-scrollbar-thumb { background: var(--bd); }

  .ck-field { margin-bottom: 12px; }
  .ck-field label {
    font-size: 10px; font-weight: 700; letter-spacing: .5px;
    text-transform: uppercase; color: var(--mu); display: block; margin-bottom: 5px;
  }
  .ck-field input, .ck-field textarea {
    width: 100%; padding: 9px 12px;
    border: 1px solid var(--bd); border-radius: 9px;
    font-size: 13px; font-family: var(--font); color: var(--tx);
    background: var(--surf); outline: none;
    transition: border-color .12s, box-shadow .12s;
    box-sizing: border-box;
  }
  .ck-field input:focus, .ck-field textarea:focus {
    border-color: var(--ac); box-shadow: 0 0 0 3px rgba(200,73,12,.08);
  }
  .ck-field textarea { resize: none; height: 70px; }
  .ck-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ck-field-hint { font-size: 10px; color: var(--su); margin-top: 4px; font-style: italic; }

  .ck-pay-card {
    padding: 11px 14px; border-radius: 10px;
    border: 1px solid var(--bd); background: var(--surf); cursor: pointer;
    transition: border-color .12s, background .12s;
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
  }
  .ck-pay-card:hover { border-color: var(--su); }
  .ck-pay-card.selected { border-color: var(--ac); background: var(--acl); }
  .ck-pay-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: var(--bg); display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
  }
  .ck-pay-icon.green { color: var(--gn); }
  .ck-pay-icon.blue  { color: #1d4ed8; }
  .ck-pay-name { font-size: 13px; font-weight: 600; color: var(--tx); }
  .ck-pay-sub  { font-size: 11px; color: var(--mu); }

  .ck-toggle-btn {
    font-size: 11px; font-weight: 600; padding: 5px 11px;
    border-radius: 7px; border: 1px solid var(--bd);
    background: transparent; color: var(--mu); cursor: pointer;
    display: flex; align-items: center; gap: 5px;
    transition: border-color .12s, color .12s;
  }
  .ck-toggle-btn:hover { border-color: var(--ac); color: var(--ac); }

  /* ── RIGHT SUMMARY ── */
  .ck-summary-panel {
    padding: 24px 22px; background: var(--bg);
    display: flex; flex-direction: column;
    max-height: calc(100vh - 200px); overflow-y: auto;
  }
  .ck-summary-panel::-webkit-scrollbar { width: 3px; }
  .ck-summary-panel::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 2px; }

  .ck-summary-heading {
    font-family: var(--serif); font-size: 16px; font-weight: 500; font-style: italic;
    color: var(--tx); margin: 0 0 14px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ck-summary-count { font-size: 11px; font-family: var(--mono); color: var(--mu); font-style: normal; }

  .ck-items-list { max-height: 200px; overflow-y: auto; margin-bottom: 14px; }
  .ck-items-list::-webkit-scrollbar { width: 2px; }
  .ck-items-list::-webkit-scrollbar-thumb { background: var(--bd); }

  .ck-item {
    display: flex; gap: 10px; margin-bottom: 11px;
    padding-bottom: 11px; border-bottom: 0.5px solid var(--bd);
  }
  .ck-item:last-child { border-bottom: none; margin-bottom: 0; }
  .ck-item-img-wrap { position: relative; flex-shrink: 0; }
  .ck-item-img { width: 46px; height: 46px; border-radius: 8px; object-fit: cover; border: 0.5px solid var(--bd); }
  .ck-item-qty {
    position: absolute; top: -5px; right: -5px;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--tx); color: #fff;
    font-size: 9px; font-weight: 700; font-family: var(--mono);
    display: flex; align-items: center; justify-content: center;
  }
  .ck-item-name {
    font-size: 12px; font-weight: 500; color: var(--tx);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;
  }
  .ck-item-unit { font-size: 11px; color: var(--mu); font-family: var(--mono); }
  .ck-item-total { font-size: 12px; font-weight: 600; color: var(--tx); font-family: var(--mono); white-space: nowrap; }

  /* Voucher */
  .ck-voucher-lbl {
    font-size: 10px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase;
    color: var(--mu); display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
  }
  .ck-voucher-row { display: flex; gap: 6px; margin-bottom: 4px; }
  .ck-voucher-input {
    flex: 1; padding: 7px 10px; border: 1px solid var(--bd); border-radius: 8px;
    font-size: 12px; font-family: var(--mono); color: var(--tx);
    background: var(--surf); outline: none; text-transform: uppercase; letter-spacing: .5px;
    transition: border-color .12s;
  }
  .ck-voucher-input:focus { border-color: var(--ac); }
  .ck-voucher-apply {
    padding: 7px 12px; border-radius: 8px; background: var(--tx); color: #fff;
    border: none; font-size: 11px; font-weight: 600; font-family: var(--font);
    cursor: pointer; white-space: nowrap; transition: background .12s;
  }
  .ck-voucher-apply:hover:not(:disabled) { background: #2f2a25; }
  .ck-voucher-apply:disabled { opacity: .4; cursor: not-allowed; }
  .ck-voucher-err { font-size: 11px; color: #dc2626; margin-bottom: 6px; }
  .ck-voucher-chip {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 11px; border-radius: 8px;
    background: var(--gnl); border: 1px solid #bbf7d0; margin-bottom: 4px;
  }
  .ck-v-code { font-size: 12px; font-weight: 700; color: var(--gn); font-family: var(--mono); }
  .ck-v-desc { font-size: 10px; color: var(--mu); }
  .ck-v-val  { font-size: 12px; font-weight: 700; color: var(--gn); font-family: var(--mono); }
  .ck-v-rm {
    background: none; border: none; cursor: pointer; color: var(--su);
    padding: 2px; display: flex; align-items: center; transition: color .12s;
  }
  .ck-v-rm:hover { color: #dc2626; }

  /* Totals */
  .ck-totals { margin-top: 10px; }
  .ck-total-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--mu); margin-bottom: 7px;
  }
  .ck-total-row.main {
    font-size: 14px; font-weight: 700; color: var(--tx);
    border-top: 0.5px solid var(--bd); padding-top: 11px; margin-top: 4px; margin-bottom: 2px;
  }
  .ck-total-row.main .ck-t-val {
    font-family: var(--serif); font-size: 22px; font-weight: 600;
    color: var(--gn); letter-spacing: -.3px;
  }
  .ck-t-green { color: var(--gn); font-weight: 600; }
  .ck-t-disc  { color: var(--gn); font-weight: 600; font-family: var(--mono); }
  .ck-vat     { font-size: 10px; color: var(--su); text-align: right; margin-top: 1px; }

  /* CTA */
  .ck-cta {
    width: 100%; padding: 13px 20px; border-radius: 12px;
    background: var(--tx); color: #fff;
    border: none; font-size: 12px; font-weight: 700; font-family: var(--font);
    letter-spacing: .5px; text-transform: uppercase; cursor: pointer; margin-top: 14px;
    transition: background .15s, transform .1s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .ck-cta:hover:not(:disabled) { background: #2f2a25; transform: translateY(-1px); }
  .ck-cta:active { transform: translateY(0); }
  .ck-cta:disabled { opacity: .45; cursor: not-allowed; transform: none; }
  .ck-cta-note { font-size: 10px; color: var(--su); text-align: center; margin-top: 7px; }

  @media (max-width: 768px) {
    .ck-modal-body { grid-template-columns: 1fr; }
    .ck-form-panel { border-right: none; border-bottom: 0.5px solid var(--bd); max-height: none; }
    .ck-summary-panel { max-height: none; }
    .ck-modal-wrap { padding: 48px 12px 40px; }
    .ck-modal-header { flex-wrap: wrap; gap: 10px; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   BACKDROP — blurred product grid behind modal
───────────────────────────────────────────────────────────── */
const BackdropGrid = () => (
  <div className="ck-backdrop">
    <div className="ck-backdrop-grid">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="ck-backdrop-card">
          <div className="ck-backdrop-img">
            <FaBox size={20} color="#c8c3bc" />
          </div>
          <div className="ck-backdrop-info">
            <div
              className="ck-backdrop-name"
              style={{ width: `${55 + (i % 5) * 9}%` }}
            />
            <div className="ck-backdrop-price" />
          </div>
        </div>
      ))}
    </div>
    <div className="ck-backdrop-dim" />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT — 100% logic gốc giữ nguyên
───────────────────────────────────────────────────────────── */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const { user, login } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  // ── VOUCHER STATE (GIỮ NGUYÊN) ──────────────────────────────
  const selectedProductIds = useMemo(
    () =>
      Array.isArray(location.state?.selectedProductIds)
        ? location.state.selectedProductIds
        : [],
    [location.state],
  );
  const cartVoucher = location.state?.appliedVoucher || null;
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(cartVoucher);
  const [voucherError, setVoucherError] = useState("");
  // ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchLatestAddresses = async () => {
      try {
        const res = await userApi.getProfile();
        if (res.success) login(res.data);
      } catch (error) {
        console.error("Lỗi cập nhật địa chỉ:", error);
      }
    };
    fetchLatestAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOGIC ĐỊA CHỈ (GIỮ NGUYÊN) ---
  const savedAddresses = useMemo(() => user?.addresses || [], [user]);
  const [useNewAddress, setUseNewAddress] = useState(
    savedAddresses.length === 0,
  );
  const defaultAddr = useMemo(
    () => savedAddresses.find((a) => a.isDefault) || savedAddresses[0],
    [savedAddresses],
  );
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddr ? defaultAddr._id : null,
  );
  const [newAddrData, setNewAddrData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    addressLine: "",
    city: "",
    province: "",
  });

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setUseNewAddress(true);
    } else if (!selectedAddressId) {
      const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (def) setSelectedAddressId(def._id);
      setUseNewAddress(false);
    }
  }, [savedAddresses, selectedAddressId]);

  // --- TÍNH TOÁN TIỀN (GIỮ NGUYÊN) ---
  const validCartItems = useMemo(() => {
    const safeItems = cartItems.filter((item) => item.productId);
    if (selectedProductIds.length === 0) return safeItems;
    const selectedSet = new Set(selectedProductIds);
    return safeItems.filter((item) => selectedSet.has(item.productId._id));
  }, [cartItems, selectedProductIds]);
  const subtotal = useMemo(
    () =>
      validCartItems.reduce(
        (acc, item) => acc + item.productId.price_cents * item.quantity,
        0,
      ),
    [validCartItems],
  );
  const FREESHIP_THRESHOLD = 300000;
  const SHIPPING_FEE = 30000;
  const isFreeShip = subtotal >= FREESHIP_THRESHOLD;
  const shippingFee = subtotal > 0 && !isFreeShip ? SHIPPING_FEE : 0;

  // ── TÍNH CÓ VOUCHER (GIỮ NGUYÊN) ────────────────────────────
  const discountAmount = appliedVoucher?.discount || 0;
  const effectiveShipping =
    appliedVoucher?.type === "freeship" ? 0 : shippingFee;
  const total = Math.max(0, subtotal + effectiveShipping - discountAmount);
  // ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!appliedVoucher) return;
    const minOrder = appliedVoucher.minOrder || 0;
    if (
      validCartItems.length === 0 ||
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
  }, [appliedVoucher, validCartItems.length, subtotal, discountAmount]);

  // ── ÁP VOUCHER (GIỮ NGUYÊN) ─────────────────────────────────
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherError("");
    setVoucherLoading(true);
    try {
      const res = await axiosClient.post("/vouchers/validate", {
        code: voucherCode.trim(),
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
        setVoucherCode("");
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

  // --- XỬ LÝ ĐẶT HÀNG (GIỮ NGUYÊN) ---
  const handlePlaceOrder = async () => {
    if (validCartItems.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    let finalShippingAddress = "";
    let finalPhone = "";
    setLoading(true);
    try {
      if (useNewAddress) {
        if (
          !newAddrData.fullName ||
          !newAddrData.phone ||
          !newAddrData.addressLine ||
          !newAddrData.city ||
          !newAddrData.province
        ) {
          toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
          setLoading(false);
          return;
        }
        const saveAddrRes = await userApi.addAddress({
          ...newAddrData,
          isDefault: savedAddresses.length === 0,
        });
        if (saveAddrRes.success) {
          const profileRes = await userApi.getProfile();
          if (profileRes.success) login(profileRes.data);
        }
        finalShippingAddress = `${newAddrData.addressLine}, ${newAddrData.city}, ${newAddrData.province}`;
        finalPhone = newAddrData.phone;
      } else {
        const selectedAddr = savedAddresses.find(
          (a) => a._id === selectedAddressId,
        );
        if (!selectedAddr) {
          toast.error("Vui lòng chọn địa chỉ giao hàng");
          setLoading(false);
          return;
        }
        finalShippingAddress = `${selectedAddr.addressLine}, ${selectedAddr.city}, ${selectedAddr.province}`;
        finalPhone = selectedAddr.phone;
      }
      const orderPayload = {
        shippingAddress: finalShippingAddress,
        phoneNumber: finalPhone,
        note: note,
        paymentMethod: paymentMethod,
        selectedProductIds: validCartItems.map((item) => item.productId._id),
        ...(appliedVoucher && {
          voucherId: appliedVoucher._id,
          voucherCode: appliedVoucher.code,
          discountAmount: discountAmount,
        }),
      };
      const res = await orderApi.createOrder(orderPayload);
      if (res.success) {
        toast.success("Đặt hàng thành công! Vui lòng kiểm tra email.");
        clearCart();
        navigate("/checkout/success", { state: { order: res.data } });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  /* ── RENDER ── */
  return (
    <div className="ck-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Progress bar top */}
      <div className="ck-progress">
        <div className="ck-progress-fill" />
      </div>

      {/* Blurred backdrop */}
      <BackdropGrid />

      {/* Modal wrapper */}
      <div className="ck-modal-wrap">
        <div className="ck-modal">
          {/* ── HEADER: back + title + step wizard (giữ nguyên vị trí) ── */}
          <div className="ck-modal-header">
            <Link to="/cart" className="ck-back">
              <FaArrowLeft style={{ fontSize: 11 }} /> Quay lại giỏ hàng
            </Link>

            <h1 className="ck-modal-title">Thanh toán</h1>

            {/* STEP WIZARD — giữ nguyên bố cục & vị trí */}
            <div className="ck-steps">
              <div className="ck-step-item completed">
                <div className="ck-step-count">✓</div>
                <span>Giỏ hàng</span>
              </div>
              <div className="ck-step-line active" />
              <div className="ck-step-item active">
                <div className="ck-step-count">2</div>
                <span>Thanh toán</span>
              </div>
              <div className="ck-step-line" />
              <div className="ck-step-item">
                <div className="ck-step-count">3</div>
                <span>Hoàn tất</span>
              </div>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="ck-modal-body">
            {/* ─── LEFT: FORM ─── */}
            <div className="ck-form-panel">
              {/* 1. Thông tin giao hàng */}
              <div className="ck-section-label">
                <h2 className="ck-section-title">
                  <div className="ck-section-num">1</div>
                  Thông tin giao hàng
                </h2>
                {savedAddresses.length > 0 &&
                  (!useNewAddress ? (
                    <button
                      className="ck-toggle-btn"
                      onClick={() => setUseNewAddress(true)}
                    >
                      <FaPlusCircle style={{ fontSize: 10 }} /> Địa chỉ khác
                    </button>
                  ) : (
                    <button
                      className="ck-toggle-btn"
                      onClick={() => setUseNewAddress(false)}
                    >
                      <FaAddressBook style={{ fontSize: 10 }} /> Sổ địa chỉ
                    </button>
                  ))}
              </div>

              {/* User info strip */}
              <div className="ck-user-strip">
                <div className="ck-user-avatar">
                  <FaUser style={{ fontSize: 11 }} />
                </div>
                <span
                  style={{ fontWeight: 600, color: "var(--tx)", fontSize: 12 }}
                >
                  {user?.name}
                </span>
                <span style={{ color: "var(--bd)" }}>·</span>
                <FaEnvelope style={{ fontSize: 10, opacity: 0.5 }} />
                <span>{user?.email}</span>
              </div>

              {/* Address list or new address form */}
              {!useNewAddress && savedAddresses.length > 0 ? (
                <div className="ck-addr-scroll">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`ck-addr-card${selectedAddressId === addr._id ? " selected" : ""}`}
                      onClick={() => setSelectedAddressId(addr._id)}
                    >
                      <div className="ck-radio">
                        {selectedAddressId === addr._id && (
                          <div className="ck-radio-dot" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 2,
                          }}
                        >
                          <span className="ck-addr-name">{addr.fullName}</span>
                          <span className="ck-addr-phone">{addr.phone}</span>
                          {addr.isDefault && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--gn)",
                                background: "var(--gnl)",
                                padding: "1px 7px",
                                borderRadius: 10,
                                marginLeft: "auto",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="ck-addr-line">
                          <FaMapMarkerAlt
                            style={{
                              fontSize: 9,
                              marginRight: 3,
                              opacity: 0.5,
                            }}
                          />
                          {addr.addressLine}, {addr.city}, {addr.province}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="ck-field-row">
                    <div className="ck-field">
                      <label>Họ và tên</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={newAddrData.fullName}
                        onChange={(e) =>
                          setNewAddrData({
                            ...newAddrData,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ck-field">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        placeholder="09..."
                        value={newAddrData.phone}
                        onChange={(e) =>
                          setNewAddrData({
                            ...newAddrData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="ck-field">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      placeholder="Số nhà, đường..."
                      value={newAddrData.addressLine}
                      onChange={(e) =>
                        setNewAddrData({
                          ...newAddrData,
                          addressLine: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="ck-field-row">
                    <div className="ck-field">
                      <label>Quận / Huyện</label>
                      <input
                        type="text"
                        placeholder="Quận..."
                        value={newAddrData.city}
                        onChange={(e) =>
                          setNewAddrData({
                            ...newAddrData,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ck-field">
                      <label>Tỉnh / Thành phố</label>
                      <input
                        type="text"
                        placeholder="Tỉnh..."
                        value={newAddrData.province}
                        onChange={(e) =>
                          setNewAddrData({
                            ...newAddrData,
                            province: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="ck-field-hint">
                    * Địa chỉ này sẽ được tự động lưu vào sổ địa chỉ của bạn.
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="ck-field" style={{ marginTop: 12 }}>
                <label>
                  <FaStickyNote style={{ marginRight: 4, fontSize: 9 }} />
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  placeholder="Lưu ý cho đơn hàng..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="ck-divider" />

              {/* 2. Phương thức thanh toán */}
              <div className="ck-section-label" style={{ marginBottom: 14 }}>
                <h2 className="ck-section-title">
                  <div className="ck-section-num">2</div>
                  Phương thức thanh toán
                </h2>
              </div>

              <div
                className={`ck-pay-card${paymentMethod === "cod" ? " selected" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="ck-pay-icon green">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <div className="ck-pay-name">
                      Thanh toán khi nhận hàng (COD)
                    </div>
                    <div className="ck-pay-sub">
                      Thanh toán tiền mặt cho shipper
                    </div>
                  </div>
                </div>
                <div className="ck-radio" style={{ flexShrink: 0 }}>
                  {paymentMethod === "cod" && <div className="ck-radio-dot" />}
                </div>
              </div>

              <div
                className={`ck-pay-card`}
                style={{ opacity: 0.55, cursor: "not-allowed" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="ck-pay-icon blue">
                    <FaUniversity />
                  </div>
                  <div>
                    <div className="ck-pay-name">
                      Chuyển khoản ngân hàng (VietQR)
                    </div>
                    <div className="ck-pay-sub">
                      Quét mã QR — Xác nhận tự động
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#fef3c7",
                        color: "#92400e",
                        padding: "1px 7px",
                        borderRadius: 10,
                        display: "inline-block",
                        marginTop: 3,
                      }}
                    >
                      Sắp ra mắt
                    </span>
                  </div>
                </div>
                <div
                  className="ck-radio"
                  style={{ flexShrink: 0, opacity: 0.3 }}
                />
              </div>
            </div>
            {/* end form-panel */}

            {/* ─── RIGHT: ORDER SUMMARY ─── */}
            <div className="ck-summary-panel">
              <div className="ck-summary-heading">
                Đơn hàng của bạn
                <span className="ck-summary-count">
                  {validCartItems.length} sản phẩm
                </span>
              </div>

              {/* Product list */}
              <div className="ck-items-list">
                {validCartItems.map((item) => (
                  <div key={item.productId._id} className="ck-item">
                    <div className="ck-item-img-wrap">
                      <img
                        src={
                          item.productId.images?.[0]?.imageUrl ||
                          "https://placehold.co/60"
                        }
                        alt={item.productId.name}
                        className="ck-item-img"
                      />
                      <div className="ck-item-qty">{item.quantity}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ck-item-name">{item.productId.name}</div>
                      <div className="ck-item-unit">
                        {item.productId.price_cents?.toLocaleString()}đ
                      </div>
                    </div>
                    <div className="ck-item-total">
                      {(
                        item.productId.price_cents * item.quantity
                      ).toLocaleString()}
                      đ
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher */}
              <div style={{ marginBottom: 10 }}>
                <div className="ck-voucher-lbl">
                  <FaTicketAlt style={{ fontSize: 10 }} /> Mã voucher
                </div>
                {!appliedVoucher ? (
                  <>
                    <div className="ck-voucher-row">
                      <input
                        className="ck-voucher-input"
                        placeholder="Nhập mã..."
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value);
                          setVoucherError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyVoucher()
                        }
                        disabled={voucherLoading}
                      />
                      <button
                        className="ck-voucher-apply"
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !voucherCode.trim()}
                      >
                        {voucherLoading ? "..." : "Áp dụng"}
                      </button>
                    </div>
                    {voucherError && (
                      <div className="ck-voucher-err">{voucherError}</div>
                    )}
                  </>
                ) : (
                  <div className="ck-voucher-chip">
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
                        <div className="ck-v-code">{appliedVoucher.code}</div>
                        <div className="ck-v-desc">
                          {appliedVoucher.description}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span className="ck-v-val">
                        {appliedVoucher.type === "freeship"
                          ? "Freeship"
                          : `−${discountAmount.toLocaleString()}đ`}
                      </span>
                      <button className="ck-v-rm" onClick={handleRemoveVoucher}>
                        <FaTimes size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="ck-totals">
                <div className="ck-total-row">
                  <span>Tạm tính</span>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 500 }}>
                    {subtotal.toLocaleString()}đ
                  </span>
                </div>
                <div className="ck-total-row">
                  <span>Phí vận chuyển</span>
                  {effectiveShipping === 0 ? (
                    <span className="ck-t-green">
                      {appliedVoucher?.type === "freeship"
                        ? "Miễn phí (voucher)"
                        : "Miễn phí"}
                    </span>
                  ) : (
                    <span style={{ fontFamily: "var(--mono)" }}>
                      {effectiveShipping.toLocaleString()}đ
                    </span>
                  )}
                </div>
                {discountAmount > 0 && (
                  <div className="ck-total-row">
                    <span>Giảm giá voucher</span>
                    <span className="ck-t-disc">
                      −{discountAmount.toLocaleString()}đ
                    </span>
                  </div>
                )}
                <div className="ck-total-row main">
                  <span>Tổng cộng</span>
                  <div style={{ textAlign: "right" }}>
                    <div className="ck-t-val">{total.toLocaleString()} đ</div>
                  </div>
                </div>
                <div className="ck-vat">(Đã bao gồm VAT)</div>
              </div>

              {/* Place order */}
              <button
                className="ck-cta"
                onClick={handlePlaceOrder}
                disabled={loading || validCartItems.length === 0}
              >
                {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>
              <div className="ck-cta-note">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản dịch vụ
              </div>
            </div>
            {/* end summary-panel */}
          </div>
          {/* end modal-body */}
        </div>
        {/* end modal */}
      </div>
      {/* end modal-wrap */}
    </div>
  );
};

export default CheckoutPage;
