/**
 * EMAIL BUILDER v4
 * ✅ API_BASE relative "/api/builder" — dùng Vite proxy
 * ✅ useEffect mount: fetch DB theo type hiện tại, fallback preset
 * ✅ handleTypeChange: fetch DB trước, fallback preset
 * ✅ handleSave: POST upsert by type
 * ✅ UX: skeleton loading, status badge, toast, spin animation
 * Layout: [Icon Strip | Canvas | Preview sticky right]
 */

import React, { useState, useEffect } from "react";
import {
  FaSave,
  FaDownload,
  FaEye,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaFileAlt,
  FaImage,
  FaTable,
  FaBoxes,
  FaClock,
  FaUser,
  FaHeading,
  FaParagraph,
  FaMousePointer,
  FaEnvelope,
  FaTimes,
  FaSync,
  FaDatabase,
  FaExclamationCircle,
} from "react-icons/fa";
import { MdDragHandle } from "react-icons/md";
import toast from "react-hot-toast";

/* ── Vite proxy: /api → http://localhost:5000 ── */
const API_BASE = "/api/builder";

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

  .eb-root {
    --bg:        #f4f2ee;
    --surf:      #ffffff;
    --border:    #e2ded6;
    --text:      #1c1917;
    --muted:     #78716c;
    --subtle:    #a8a29e;
    --accent:    #c8490c;
    --accent-lt: #fff0ea;
    --green:     #16a34a;
    --font:      'DM Sans', sans-serif;
    --mono:      'DM Mono', monospace;
    --serif:     'Cormorant Garamond', Georgia, serif;
    font-family: var(--font);
    color: var(--text);
  }

  /* ── PAGE HEADER ── */
  .eb-page-header {
    display: flex; align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px; gap: 12px;
  }
  .eb-page-title {
    font-size: 22px; font-weight: 700; letter-spacing: -.5px;
    margin: 0 0 3px; font-family: var(--serif);
  }
  .eb-page-sub { font-size: 12px; color: var(--muted); margin: 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  /* ── BUTTONS ── */
  .eb-save-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; background: var(--text); color: #fff;
    border: none; border-radius: 9px; font-size: 13px; font-weight: 600;
    font-family: var(--font); cursor: pointer; white-space: nowrap;
    transition: background .15s, transform .1s, box-shadow .15s;
    box-shadow: 0 2px 8px rgba(0,0,0,.15);
  }
  .eb-save-btn:hover  { background: #2d2926; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,.2); }
  .eb-save-btn:active { transform: translateY(0); }
  .eb-save-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }

  .eb-toolbar-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 14px; border: 0.5px solid var(--border);
    border-radius: 9px; background: var(--surf);
    font-size: 13px; font-family: var(--font);
    color: var(--muted); cursor: pointer; white-space: nowrap;
    transition: all .12s;
  }
  .eb-toolbar-btn:hover { background: var(--bg); color: var(--text); border-color: var(--muted); }

  /* ── TOOLBAR ── */
  .eb-toolbar {
    background: var(--surf); border: 0.5px solid var(--border);
    border-radius: 12px; padding: 10px 14px;
    display: flex; gap: 8px; align-items: center;
    margin-bottom: 18px; flex-wrap: wrap;
  }
  .eb-name-inp {
    flex: 1; min-width: 160px;
    padding: 8px 12px; border: 0.5px solid var(--border); border-radius: 8px;
    font-size: 13px; font-family: var(--font); font-weight: 500;
    color: var(--text); background: var(--bg); outline: none;
    transition: border-color .15s;
  }
  .eb-name-inp:focus { border-color: var(--accent); background: #fff; }
  .eb-select {
    padding: 8px 30px 8px 12px; border: 0.5px solid var(--border);
    border-radius: 8px; font-size: 13px; font-family: var(--font);
    color: var(--text); background: var(--bg);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='6'%3E%3Cpath d='M0 0l4.5 6L9 0z' fill='%2378716c'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
    appearance: none; outline: none; cursor: pointer;
    transition: border-color .15s;
  }
  .eb-select:focus { border-color: var(--accent); }

  /* ── STATUS BADGES ── */
  .eb-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-family: var(--mono);
    padding: 2px 8px; border-radius: 20px;
  }
  .eb-badge-db     { border: 0.5px solid #bbf7d0; color: #15803d; background: #f0fdf4; }
  .eb-badge-dirty  { border: 0.5px solid #fed7aa; color: #c2410c; background: #fff7ed; }
  .eb-badge-saved  { border: 0.5px solid #bbf7d0; color: #15803d; background: #f0fdf4; }
  .eb-badge-loading { border: 0.5px solid var(--border); color: var(--muted); background: var(--bg); }

  /* ── 3-COLUMN LAYOUT ── */
  .eb-builder {
    display: grid;
    grid-template-columns: 52px 1fr 400px;
    gap: 14px;
    align-items: start;
  }

  /* ── ICON STRIP ── */
  .eb-cat-col { position: sticky; top: 16px; }
  .eb-cat-strip {
    background: var(--surf); border: 0.5px solid var(--border);
    border-radius: 12px; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    padding: 8px 0; gap: 2px;
  }
  .eb-cat-line  { width: 28px; height: 0.5px; background: var(--border); margin: 4px 0; flex-shrink: 0; }
  .eb-cat-label { font-size: 7.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: var(--subtle); padding: 3px 0 2px; }
  .eb-cat-btn {
    position: relative; width: 38px; height: 38px; border-radius: 8px;
    border: none; background: transparent;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 13px; color: var(--muted);
    transition: background .12s, color .12s, transform .1s; flex-shrink: 0;
  }
  .eb-cat-btn:hover  { background: var(--accent-lt); color: var(--accent); }
  .eb-cat-btn:active { transform: scale(.9); }
  .eb-cat-tip {
    position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
    background: var(--text); color: #fff; padding: 5px 10px; border-radius: 6px;
    font-size: 11px; font-family: var(--font); white-space: nowrap;
    pointer-events: none; opacity: 0; transition: opacity .15s; z-index: 300;
  }
  .eb-cat-tip::before {
    content: ''; position: absolute; right: 100%; top: 50%; transform: translateY(-50%);
    border: 5px solid transparent; border-right-color: var(--text);
  }
  .eb-cat-btn:hover .eb-cat-tip { opacity: 1; }

  /* ── CANVAS PANEL ── */
  .eb-canvas-panel {
    background: var(--surf); border: 0.5px solid var(--border);
    border-radius: 14px; overflow: hidden;
    animation: eb-fadein .3s ease both;
  }
  @keyframes eb-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

  .eb-panel-hd {
    padding: 10px 14px; background: var(--surf);
    border-bottom: 0.5px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }
  .eb-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .eb-panel-name  { font-size: 13px; font-weight: 600; flex: 1; }
  .eb-panel-count {
    font-size: 11px; font-family: var(--mono);
    padding: 1px 7px; border-radius: 20px;
    border: 0.5px solid var(--border); color: var(--muted); background: var(--bg);
  }

  .eb-canvas-body { padding: 10px; }

  /* Skeleton loader */
  .eb-skeleton {
    border-radius: 10px; margin-bottom: 8px;
    background: linear-gradient(90deg, var(--bg) 25%, var(--border) 50%, var(--bg) 75%);
    background-size: 200% 100%;
    animation: eb-shimmer 1.2s infinite;
  }
  @keyframes eb-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* Block cards */
  .eb-block-card {
    background: var(--surf); border: 0.5px solid var(--border);
    border-radius: 10px; padding: 11px 12px; cursor: pointer;
    transition: border-color .15s, transform .1s, box-shadow .15s;
    position: relative; overflow: hidden; margin-bottom: 7px;
  }
  .eb-block-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    border-radius: 10px 0 0 10px; background: var(--accent);
    transform: scaleY(0); transition: transform .15s;
  }
  .eb-block-card:hover::before { transform: scaleY(1); }
  .eb-block-card:hover { border-color: var(--muted); transform: translateY(-1px); box-shadow: 0 3px 12px rgba(0,0,0,.07); }
  .eb-block-card.eb-sel {
    border-color: var(--accent);
    box-shadow: 0 0 0 2.5px rgba(200,73,12,.12);
  }
  .eb-block-card.eb-sel::before { transform: scaleY(1); }

  .eb-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .eb-card-tag {
    font-size: 10px; font-family: var(--mono);
    padding: 2px 7px; border-radius: 4px;
    border: 0.5px solid var(--border); color: var(--muted); background: var(--bg);
  }
  .eb-card-btns { display: flex; gap: 3px; }
  .eb-card-btn {
    width: 22px; height: 22px; border-radius: 5px;
    border: 0.5px solid var(--border); background: transparent;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 10px; color: var(--subtle);
    transition: all .1s;
  }
  .eb-card-btn:hover     { background: var(--text); color: #fff; border-color: var(--text); }
  .eb-card-btn.del:hover { background: #dc2626;     color: #fff; border-color: #dc2626; }
  .eb-card-preview {
    font-size: 12.5px; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .eb-canvas-empty {
    padding: 52px 16px; text-align: center;
    font-size: 12px; color: var(--subtle);
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .eb-canvas-empty-icon {
    width: 44px; height: 44px; border-radius: 12px; background: var(--bg);
    border: 0.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: var(--subtle);
  }

  /* ── PREVIEW COLUMN ── */
  .eb-preview-col {
    position: sticky; top: 16px;
    height: calc(100vh - 130px);
    display: flex; flex-direction: column;
  }
  .eb-preview-panel {
    background: var(--surf); border: 1.5px solid var(--text);
    border-radius: 14px; overflow: hidden; flex: 1;
    display: flex; flex-direction: column;
    box-shadow: 0 6px 28px rgba(0,0,0,.14);
    animation: eb-fadein .3s ease .1s both;
  }
  .eb-preview-hd {
    padding: 10px 14px; border-bottom: 0.5px solid var(--border);
    display: flex; align-items: center; gap: 8px;
    background: var(--text); flex-shrink: 0;
  }
  .eb-preview-hd .eb-panel-name  { color: #fff; }
  .eb-preview-hd .eb-panel-count { border-color: rgba(255,255,255,.15); color: rgba(255,255,255,.6); background: rgba(255,255,255,.08); }
  .eb-browser-bar {
    padding: 7px 12px; background: #f0ede8;
    border-bottom: 0.5px solid var(--border);
    display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  }
  .eb-bdot { width: 8px; height: 8px; border-radius: 50%; }
  .eb-browser-url {
    flex: 1; background: #fff; border-radius: 4px;
    padding: 3px 8px; font-size: 10px; font-family: var(--mono);
    color: var(--subtle); border: 0.5px solid var(--border); margin-left: 6px;
  }
  .eb-preview-iframe { flex: 1; width: 100%; border: none; display: block; }

  /* ── PROPS POPUP ── */
  .eb-backdrop {
    position: fixed; inset: 0; background: rgba(28,25,23,.3);
    backdrop-filter: blur(3px); z-index: 400;
    animation: eb-bdin .15s ease;
  }
  @keyframes eb-bdin { from { opacity:0; } to { opacity:1; } }
  .eb-popup {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 344px; max-height: 80vh; overflow-y: auto;
    background: var(--surf); border: 0.5px solid var(--border);
    border-radius: 16px;
    box-shadow: 0 16px 56px rgba(0,0,0,.2), 0 0 0 0.5px rgba(0,0,0,.03);
    z-index: 401;
    animation: eb-popin .18s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes eb-popin {
    from { opacity:0; transform:translate(-50%,-46%) scale(.94); }
    to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
  }
  .eb-popup-hd {
    padding: 13px 14px; border-bottom: 0.5px solid var(--border);
    display: flex; align-items: center; gap: 8px;
    position: sticky; top: 0; background: var(--surf); z-index: 1;
    border-radius: 16px 16px 0 0;
  }
  .eb-popup-title { font-size: 13px; font-weight: 600; flex: 1; }
  .eb-popup-tag   { font-size: 10px; font-family: var(--mono); padding: 2px 7px; border-radius: 4px; border: 0.5px solid var(--border); color: var(--muted); background: var(--bg); }
  .eb-popup-close {
    width: 24px; height: 24px; border-radius: 6px;
    border: 0.5px solid var(--border); background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 10px; color: var(--muted); transition: all .1s;
  }
  .eb-popup-close:hover { background: var(--text); color: #fff; border-color: var(--text); }
  .eb-popup-body { padding: 14px; }

  .eb-prop-g    { margin-bottom: 12px; }
  .eb-prop-lbl  { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--subtle); display: block; margin-bottom: 5px; }
  .eb-prop-inp, .eb-prop-sel, .eb-prop-ta {
    width: 100%; padding: 8px 10px;
    border: 0.5px solid var(--border); border-radius: 7px;
    font-size: 12px; font-family: var(--font); color: var(--text);
    background: var(--bg); outline: none; box-sizing: border-box;
    transition: border-color .12s;
  }
  .eb-prop-ta  { resize: vertical; min-height: 76px; }
  .eb-prop-inp:focus, .eb-prop-sel:focus, .eb-prop-ta:focus { border-color: var(--accent); background: #fff; }
  .eb-prop-color { width: 100%; height: 36px; border: 0.5px solid var(--border); border-radius: 7px; padding: 3px 5px; background: var(--bg); cursor: pointer; }
  .eb-prop-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .eb-prop-sep  { border: none; border-top: 0.5px solid var(--border); margin: 10px 0; }
  .eb-prop-hint {
    font-size: 11.5px; color: var(--muted);
    background: var(--accent-lt); border-radius: 8px; padding: 10px 12px;
    border: 0.5px solid #f5c9b3; line-height: 1.65;
  }
  .eb-prop-btn-prev {
    display: inline-block; padding: 9px 20px; border: none;
    border-radius: 7px; font-size: 13px; font-family: var(--font);
    cursor: default; color: white; font-weight: 600;
  }
  .eb-popup-footer {
    padding: 10px 14px; border-top: 0.5px solid var(--border);
    display: flex; justify-content: flex-end; gap: 8px;
    position: sticky; bottom: 0; background: var(--surf);
    border-radius: 0 0 16px 16px;
  }
  .eb-del-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 12px; border: 0.5px solid #fecaca;
    border-radius: 7px; background: #fef2f2;
    font-size: 12px; font-family: var(--font); color: #dc2626;
    cursor: pointer; transition: all .12s;
  }
  .eb-del-btn:hover { background: #dc2626; color: #fff; border-color: #dc2626; }
  .eb-done-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 16px; border: none; border-radius: 7px;
    background: var(--text); font-size: 12px; font-weight: 600;
    font-family: var(--font); color: #fff; cursor: pointer; transition: background .12s;
  }
  .eb-done-btn:hover { background: #2d2926; }

  /* ── ANIMATIONS ── */
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .eb-spin { animation: spin .9s linear infinite; }
  @keyframes eb-block-in { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:none; } }
  .eb-block-card { animation: eb-block-in .18s ease both; }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   CATALOGUE
═══════════════════════════════════════════════════════════════════════════ */
const CATALOGUE = [
  { id: "header", icon: <FaHeading />, label: "Tiêu đề", cat: "Nội dung" },
  { id: "text", icon: <FaParagraph />, label: "Văn bản", cat: "Nội dung" },
  { id: "image", icon: <FaImage />, label: "Hình ảnh", cat: "Nội dung" },
  { id: "button", icon: <FaMousePointer />, label: "Nút bấm", cat: "Nội dung" },
  { id: "divider", icon: <MdDragHandle />, label: "Đường kẻ", cat: "Bố cục" },
  { id: "spacer", icon: <FaBoxes />, label: "Khoảng trắng", cat: "Bố cục" },
  {
    id: "product-table",
    icon: <FaTable />,
    label: "Bảng sản phẩm",
    cat: "Động",
  },
  {
    id: "order-info",
    icon: <FaFileAlt />,
    label: "Thông tin đơn",
    cat: "Động",
  },
  { id: "customer-name", icon: <FaUser />, label: "Tên khách", cat: "Động" },
  { id: "timestamp", icon: <FaClock />, label: "Thời gian đặt", cat: "Động" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE OPTIONS — khớp BE enum
═══════════════════════════════════════════════════════════════════════════ */
const TEMPLATE_OPTIONS = [
  { value: "pending", label: "Đặt hàng thành công", sub: "pending" },
  {
    value: "order_confirmation",
    label: "Xác nhận đơn hàng",
    sub: "order_confirmation",
  },
  { value: "shipping", label: "Đang giao hàng", sub: "shipping" },
  { value: "delivered", label: "Giao thành công", sub: "delivered" },
  { value: "cancelled", label: "Đã hủy đơn", sub: "cancelled" },
  { value: "welcome", label: "Chào mừng thành viên", sub: "welcome" },
  { value: "contact_reply", label: "Phản hồi liên hệ", sub: "contact_reply" },
  { value: "custom", label: "Tùy chỉnh", sub: "custom" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PRESETS — fallback khi DB chưa có
═══════════════════════════════════════════════════════════════════════════ */
const PRESETS = {
  pending: [
    {
      id: "h1",
      type: "header",
      content: "Đặt hàng thành công!",
      level: 2,
      color: "#c8490c",
    },
    { id: "cn", type: "customer-name" },
    {
      id: "t1",
      type: "text",
      content:
        "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý và sẽ sớm được xác nhận.",
    },
    { id: "oi", type: "order-info" },
    { id: "pt", type: "product-table" },
    { id: "ts", type: "timestamp" },
    { id: "d1", type: "divider" },
    {
      id: "t2",
      type: "text",
      content: "Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.",
    },
    {
      id: "btn",
      type: "button",
      text: "Xem đơn hàng",
      bgColor: "#c8490c",
      url: "https://example.com/orders",
    },
  ],
  order_confirmation: [
    {
      id: "h1",
      type: "header",
      content: "Đơn hàng đã được xác nhận!",
      level: 2,
      color: "#7c3aed",
    },
    { id: "cn", type: "customer-name" },
    {
      id: "t1",
      type: "text",
      content:
        "Chúng tôi đã xác nhận đơn hàng của bạn và đang chuẩn bị hàng để giao.",
    },
    { id: "oi", type: "order-info" },
    { id: "pt", type: "product-table" },
    { id: "ts", type: "timestamp" },
    {
      id: "btn",
      type: "button",
      text: "Theo dõi đơn hàng",
      bgColor: "#7c3aed",
      url: "https://example.com/orders",
    },
  ],
  shipping: [
    {
      id: "h1",
      type: "header",
      content: "Đơn hàng đang trên đường giao!",
      level: 2,
      color: "#1d4ed8",
    },
    { id: "cn", type: "customer-name" },
    {
      id: "t1",
      type: "text",
      content:
        "Đơn hàng của bạn đã được bàn giao cho đơn vị vận chuyển và đang trên đường đến tay bạn.",
    },
    { id: "oi", type: "order-info" },
    { id: "ts", type: "timestamp" },
    {
      id: "btn",
      type: "button",
      text: "Theo dõi đơn hàng",
      bgColor: "#1d4ed8",
      url: "https://example.com/tracking",
    },
  ],
  delivered: [
    {
      id: "h1",
      type: "header",
      content: "Đơn hàng đã giao thành công!",
      level: 2,
      color: "#15803d",
    },
    { id: "cn", type: "customer-name" },
    {
      id: "t1",
      type: "text",
      content:
        "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã tin tưởng mua sắm!",
    },
    { id: "pt", type: "product-table" },
    { id: "d1", type: "divider" },
    {
      id: "t2",
      type: "text",
      content: "Hãy để lại đánh giá để giúp chúng tôi cải thiện dịch vụ nhé!",
    },
    {
      id: "btn",
      type: "button",
      text: "Đánh giá ngay",
      bgColor: "#15803d",
      url: "https://example.com/review",
    },
  ],
  cancelled: [
    {
      id: "h1",
      type: "header",
      content: "Đơn hàng đã bị hủy",
      level: 2,
      color: "#dc2626",
    },
    { id: "cn", type: "customer-name" },
    {
      id: "t1",
      type: "text",
      content:
        "Rất tiếc, đơn hàng của bạn đã bị hủy. Nếu đã thanh toán, tiền sẽ được hoàn lại trong 3-5 ngày làm việc.",
    },
    { id: "oi", type: "order-info" },
    { id: "ts", type: "timestamp" },
    { id: "d1", type: "divider" },
    {
      id: "btn",
      type: "button",
      text: "Đặt hàng lại",
      bgColor: "#dc2626",
      url: "https://example.com/shop",
    },
  ],
  welcome: [
    {
      id: "h1",
      type: "header",
      content: "Chào mừng bạn đến với cửa hàng!",
      level: 2,
      color: "#c8490c",
    },
    { id: "cn", type: "customer-name" },
    {
      id: "t1",
      type: "text",
      content:
        "Tài khoản của bạn đã được tạo thành công. Khám phá hàng ngàn sản phẩm độc đáo ngay hôm nay!",
    },
    { id: "sp", type: "spacer", height: 16 },
    {
      id: "btn",
      type: "button",
      text: "Mua sắm ngay",
      bgColor: "#c8490c",
      url: "https://example.com/shop",
    },
  ],
  contact_reply: [
    {
      id: "h1",
      type: "header",
      content: "Cảm ơn bạn đã liên hệ!",
      level: 2,
      color: "#0891b2",
    },
    { id: "cn", type: "customer-name" },
    {
      id: "t1",
      type: "text",
      content:
        "Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng 24 giờ làm việc.",
    },
    { id: "d1", type: "divider" },
    {
      id: "btn",
      type: "button",
      text: "Về trang chủ",
      bgColor: "#0891b2",
      url: "https://example.com",
    },
  ],
  custom: [
    {
      id: "h1",
      type: "header",
      content: "Tiêu đề email",
      level: 2,
      color: "#c8490c",
    },
    { id: "t1", type: "text", content: "Nội dung email của bạn..." },
    {
      id: "btn",
      type: "button",
      text: "Xem thêm",
      bgColor: "#c8490c",
      url: "https://example.com",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   GENERATE HTML PREVIEW
═══════════════════════════════════════════════════════════════════════════ */
const generateHtml = (blocks) => {
  const rows = blocks
    .map((b) => {
      switch (b.type) {
        case "header": {
          const sz = b.level === 1 ? 30 : b.level === 3 ? 20 : 26;
          return `<h${b.level || 2} style="color:${b.color || "#c8490c"};font-family:'Cormorant Garamond',Georgia,serif;font-size:${sz}px;margin:20px 0 10px;line-height:1.2;">${b.content || ""}</h${b.level || 2}>`;
        }
        case "text":
          return `<p style="font-size:14px;line-height:1.8;margin:10px 0;color:#1c1917;">${b.content || ""}</p>`;
        case "image":
          return `<div style="margin:14px 0;"><img src="${b.url || "https://placehold.co/600x200/f4f2ee/78716c?text=No+Image"}" alt="${b.alt || "Image"}" style="width:100%;max-width:600px;border-radius:10px;display:block;" /></div>`;
        case "button":
          return `<div style="margin:18px 0;"><a href="${b.url || "#"}" style="display:inline-block;background:${b.bgColor || "#c8490c"};color:white;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:-.2px;">${b.text || "Click me"}</a></div>`;
        case "divider":
          return `<hr style="border:none;border-top:1px solid #e2ded6;margin:22px 0;" />`;
        case "spacer":
          return `<div style="height:${b.height || 20}px;"></div>`;
        case "product-table":
          return `<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
          <thead><tr style="border-bottom:2px solid #c8490c;">
            <th style="padding:10px 8px;text-align:left;font-weight:700;">Sản phẩm</th>
            <th style="padding:10px 8px;text-align:center;font-weight:700;">SL</th>
            <th style="padding:10px 8px;text-align:right;font-weight:700;">Giá</th>
          </tr></thead>
          <tbody><tr style="border-bottom:1px solid #e2ded6;">
            <td style="padding:10px 8px;">{{product_name}}</td>
            <td style="padding:10px 8px;text-align:center;">{{product_qty}}</td>
            <td style="padding:10px 8px;text-align:right;">{{product_price}}</td>
          </tr></tbody>
          <tfoot><tr>
            <td colspan="2" style="padding:10px 8px;text-align:right;font-weight:700;">Tổng cộng:</td>
            <td style="padding:10px 8px;text-align:right;font-weight:700;color:#c8490c;">{{total_amount}}</td>
          </tr></tfoot>
        </table>`;
        case "order-info":
          return `<div style="background:#f9f9f7;padding:14px 16px;border-radius:10px;border-left:4px solid #c8490c;margin:14px 0;font-size:14px;line-height:1.9;">
          <p style="margin:0 0 4px;"><strong>Mã đơn:</strong> {{order_number}}</p>
          <p style="margin:0 0 4px;"><strong>Địa chỉ:</strong> {{shipping_address}}</p>
          <p style="margin:0 0 4px;"><strong>SĐT:</strong> {{phone_number}}</p>
          <p style="margin:0;"><strong>Thanh toán:</strong> {{payment_method}}</p>
        </div>`;
        case "customer-name":
          return `<p style="font-size:14px;margin:10px 0;">Xin chào <strong>{{customer_name}}</strong>,</p>`;
        case "timestamp":
          return `<p style="font-size:12px;color:#78716c;margin:8px 0;font-family:monospace;">Ngày đặt hàng: <strong>{{order_date}}</strong></p>`;
        default:
          return "";
      }
    })
    .join("\n");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;600&display=swap');
  body { font-family:'DM Sans',Arial,sans-serif; margin:0; padding:20px; background:#f4f2ee; }
  .wrap { max-width:560px; margin:0 auto; background:#fff; border-radius:14px; border:0.5px solid #e2ded6; padding:28px 32px; }
</style></head>
<body><div class="wrap">${rows}</div></body></html>`;
};

/* ═══════════════════════════════════════════════════════════════════════════
   PREVIEW TEXT
═══════════════════════════════════════════════════════════════════════════ */
const previewText = (b) => {
  switch (b.type) {
    case "header":
      return b.content || "Tiêu đề";
    case "text":
      return b.content || "Văn bản";
    case "image":
      return b.url ? `🖼 ${b.url}` : "🖼 Chưa có URL hình ảnh";
    case "button":
      return `🔘 ${b.text || "Nút bấm"}${b.url ? ` → ${b.url}` : ""}`;
    case "divider":
      return "── Đường kẻ ngang ──";
    case "spacer":
      return `↕ Khoảng trắng ${b.height || 20}px`;
    case "product-table":
      return "📊 Bảng sản phẩm (tự động từ đơn hàng)";
    case "order-info":
      return "📋 Thông tin đơn hàng (tự động)";
    case "customer-name":
      return "👤 {{customer_name}}";
    case "timestamp":
      return "🕐 {{order_date}}";
    default:
      return b.type;
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS POPUP
═══════════════════════════════════════════════════════════════════════════ */
const PropsPopup = ({ block, onUpdate, onDelete, onClose }) => {
  if (!block) return null;
  const upd = (patch) => onUpdate(block.id, patch);
  return (
    <>
      <div className="eb-backdrop" onClick={onClose} />
      <div className="eb-popup" onClick={(e) => e.stopPropagation()}>
        <div className="eb-popup-hd">
          <div className="eb-dot" style={{ background: "#c8490c" }} />
          <span className="eb-popup-title">Thuộc tính khối</span>
          <span className="eb-popup-tag">{block.type}</span>
          <button className="eb-popup-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="eb-popup-body">
          {block.type === "header" && (
            <>
              <div className="eb-prop-g">
                <label className="eb-prop-lbl">Nội dung tiêu đề</label>
                <textarea
                  className="eb-prop-ta"
                  value={block.content || ""}
                  onChange={(e) => upd({ content: e.target.value })}
                />
              </div>
              <div className="eb-prop-row">
                <div className="eb-prop-g">
                  <label className="eb-prop-lbl">Kích cỡ</label>
                  <select
                    className="eb-prop-sel"
                    value={block.level || 2}
                    onChange={(e) => upd({ level: parseInt(e.target.value) })}
                  >
                    <option value="1">H1 — Lớn</option>
                    <option value="2">H2 — Vừa</option>
                    <option value="3">H3 — Nhỏ</option>
                  </select>
                </div>
                <div className="eb-prop-g">
                  <label className="eb-prop-lbl">Màu sắc</label>
                  <input
                    type="color"
                    className="eb-prop-color"
                    value={block.color || "#c8490c"}
                    onChange={(e) => upd({ color: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
          {block.type === "text" && (
            <div className="eb-prop-g">
              <label className="eb-prop-lbl">Nội dung</label>
              <textarea
                className="eb-prop-ta"
                style={{ minHeight: 100 }}
                value={block.content || ""}
                onChange={(e) => upd({ content: e.target.value })}
              />
            </div>
          )}
          {block.type === "image" && (
            <>
              <div className="eb-prop-g">
                <label className="eb-prop-lbl">URL hình ảnh</label>
                <input
                  className="eb-prop-inp"
                  value={block.url || ""}
                  onChange={(e) => upd({ url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="eb-prop-g">
                <label className="eb-prop-lbl">Alt text</label>
                <input
                  className="eb-prop-inp"
                  value={block.alt || ""}
                  onChange={(e) => upd({ alt: e.target.value })}
                  placeholder="Mô tả hình ảnh..."
                />
              </div>
              {block.url && (
                <img
                  src={block.url}
                  alt="preview"
                  style={{
                    width: "100%",
                    borderRadius: 6,
                    border: "0.5px solid var(--border)",
                    marginTop: 4,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </>
          )}
          {block.type === "button" && (
            <>
              <div className="eb-prop-g">
                <label className="eb-prop-lbl">Text nút</label>
                <input
                  className="eb-prop-inp"
                  value={block.text || ""}
                  onChange={(e) => upd({ text: e.target.value })}
                  placeholder="Xem đơn hàng"
                />
              </div>
              <div className="eb-prop-g">
                <label className="eb-prop-lbl">Link URL</label>
                <input
                  className="eb-prop-inp"
                  value={block.url || ""}
                  onChange={(e) => upd({ url: e.target.value })}
                  placeholder="https://example.com/orders"
                />
              </div>
              <div className="eb-prop-g">
                <label className="eb-prop-lbl">Màu nền</label>
                <input
                  type="color"
                  className="eb-prop-color"
                  value={block.bgColor || "#c8490c"}
                  onChange={(e) => upd({ bgColor: e.target.value })}
                />
              </div>
              <hr className="eb-prop-sep" />
              <button
                className="eb-prop-btn-prev"
                style={{ background: block.bgColor || "#c8490c" }}
              >
                {block.text || "Preview nút"}
              </button>
            </>
          )}
          {block.type === "spacer" && (
            <div className="eb-prop-g">
              <label className="eb-prop-lbl">Chiều cao (px)</label>
              <input
                type="number"
                className="eb-prop-inp"
                min={4}
                max={120}
                value={block.height || 20}
                onChange={(e) =>
                  upd({ height: parseInt(e.target.value) || 20 })
                }
              />
            </div>
          )}
          {[
            "product-table",
            "order-info",
            "customer-name",
            "timestamp",
          ].includes(block.type) && (
            <div className="eb-prop-hint">
              ⚡ Khối này tự động lấy dữ liệu thực tế từ đơn hàng khi gửi email.
              Không cần chỉnh sửa thủ công.
            </div>
          )}
          {block.type === "divider" && (
            <div className="eb-prop-hint">
              Đường kẻ ngang phân cách các phần trong email.
            </div>
          )}
        </div>
        <div className="eb-popup-footer">
          <button
            className="eb-del-btn"
            onClick={() => {
              onDelete(block.id);
              onClose();
            }}
          >
            <FaTrash style={{ fontSize: 10 }} /> Xóa khối
          </button>
          <button className="eb-done-btn" onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ICON STRIP
═══════════════════════════════════════════════════════════════════════════ */
const CatStrip = ({ onAdd }) => (
  <div className="eb-cat-strip">
    {["Nội dung", "Bố cục", "Động"].map((cat, ci) => (
      <React.Fragment key={cat}>
        {ci > 0 && <div className="eb-cat-line" />}
        <span className="eb-cat-label">{cat.slice(0, 2)}</span>
        {CATALOGUE.filter((b) => b.cat === cat).map((b) => (
          <button key={b.id} className="eb-cat-btn" onClick={() => onAdd(b.id)}>
            {b.icon}
            <span className="eb-cat-tip">{b.label}</span>
          </button>
        ))}
      </React.Fragment>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════════════════════ */
const Skeleton = () => (
  <>
    {[80, 56, 96, 56, 72].map((h, i) => (
      <div
        key={i}
        className="eb-skeleton"
        style={{ height: h, marginBottom: 8 }}
      />
    ))}
  </>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
const EmailBuilder = () => {
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [templateName, setTemplateName] = useState("Đặt hàng thành công");
  const [templateType, setTemplateType] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true); // loading khi mount / đổi type
  const [fromDb, setFromDb] = useState(false); // true nếu blocks đến từ DB
  const [isDirty, setIsDirty] = useState(false);

  const selected = blocks.find((b) => b.id === selectedId);
  const previewHtml = generateHtml(blocks);

  /* ── helper: load preset local ── */
  const loadPreset = (type, opt) => {
    const preset = PRESETS[type] || PRESETS.custom;
    setBlocks(preset.map((b) => ({ ...b, id: `${b.id}-${Date.now()}` })));
    setTemplateName(opt?.label || type);
    setFromDb(false);
    setIsDirty(false);
  };

  /* ── helper: fetch DB theo type ── */
  const fetchByType = async (type) => {
    try {
      const res = await fetch(`${API_BASE}/templates?type=${type}`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        const tpl = data.data[0];
        setBlocks(tpl.blocks.map((b) => ({ ...b })));
        setTemplateName(tpl.name);
        setFromDb(true);
        setIsDirty(false);
        return true;
      }
    } catch {
      /* network error → fallback preset */
    }
    return false;
  };

  /* ── mount: fetch DB cho type mặc định (pending) ── */
  useEffect(() => {
    const init = async () => {
      setFetching(true);
      const found = await fetchByType("pending");
      if (!found) loadPreset("pending", TEMPLATE_OPTIONS[0]);
      setFetching(false);
    };
    init();
  }, []); // chỉ chạy 1 lần khi mount

  /* ── mark dirty khi blocks/name thay đổi (sau lần init xong) ── */
  useEffect(() => {
    if (!fetching) setIsDirty(true);
  }, [blocks, templateName]); // eslint-disable-line

  /* ── đổi type ── */
  const handleTypeChange = async (e) => {
    const val = e.target.value;
    const opt = TEMPLATE_OPTIONS.find((o) => o.value === val);
    setTemplateType(val);
    setSelectedId(null);
    setFetching(true);

    const found = await fetchByType(val);
    if (!found) {
      loadPreset(val, opt);
      toast(`Dùng preset: ${opt?.label}`, { icon: "📋" });
    } else {
      toast.success(`Đã load từ DB: ${opt?.label}`);
    }
    setFetching(false);
  };

  /* ── thêm block ── */
  const addBlock = (type) => {
    const id = `${type}-${Date.now()}`;
    const defs = {
      header: { content: "Tiêu đề mới", level: 2, color: "#c8490c" },
      text: { content: "Nội dung văn bản mới..." },
      image: { url: "", alt: "" },
      button: { text: "Xem thêm", bgColor: "#c8490c", url: "" },
      divider: {},
      spacer: { height: 24 },
      "product-table": {},
      "order-info": {},
      "customer-name": {},
      timestamp: {},
    };
    setBlocks((p) => [...p, { id, type, ...defs[type] }]);
    setSelectedId(id);
  };

  /* ── xóa ── */
  const delBlock = (id, e) => {
    e?.stopPropagation();
    setBlocks((p) => p.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  /* ── di chuyển ── */
  const moveBlock = (id, dir, e) => {
    e?.stopPropagation();
    setBlocks((p) => {
      const i = p.findIndex((b) => b.id === id);
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const a = [...p];
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
  };

  /* ── update props ── */
  const update = (id, patch) =>
    setBlocks((p) => p.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  /* ── SAVE: POST upsert by type ── */
  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Vui lòng nhập tên template!");
      return;
    }
    if (blocks.length === 0) {
      toast.error("Template cần ít nhất 1 khối!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: templateName.trim(),
        description: `Template email: ${templateType}`,
        type: templateType,
        blocks: blocks.map(
          ({ id, type, content, level, color, url, bgColor, text, height }) =>
            Object.fromEntries(
              Object.entries({
                id,
                type,
                content,
                level,
                color,
                url,
                bgColor,
                text,
                height,
              }).filter(([, v]) => v !== undefined && v !== ""),
            ),
        ),
        emailConfig: {},
      };

      const res = await fetch(`${API_BASE}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setFromDb(true);
        setIsDirty(false);
        toast.success(`Đã lưu "${templateName}"!`);
      } else {
        toast.error(data.message || "Lỗi lưu template");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Không thể kết nối tới server");
    } finally {
      setSaving(false);
    }
  };

  /* ── export HTML ── */
  const handleExport = () => {
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateName || "email-template"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã export HTML!");
  };

  const currentOpt = TEMPLATE_OPTIONS.find((o) => o.value === templateType);

  return (
    <div className="eb-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {selected && (
        <PropsPopup
          block={selected}
          onUpdate={update}
          onDelete={delBlock}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* ── PAGE HEADER ── */}
      <div className="eb-page-header">
        <div>
          <h2 className="eb-page-title">Email Builder</h2>
          <p className="eb-page-sub">
            <span>
              {blocks.length} khối · {currentOpt?.label}
            </span>
            {fetching && (
              <span className="eb-badge eb-badge-loading">
                <FaSync className="eb-spin" style={{ fontSize: 9 }} /> Đang
                tải...
              </span>
            )}
            {!fetching && fromDb && !isDirty && (
              <span className="eb-badge eb-badge-db">
                <FaDatabase style={{ fontSize: 9 }} /> Đã đồng bộ DB
              </span>
            )}
            {!fetching && isDirty && (
              <span className="eb-badge eb-badge-dirty">
                <FaExclamationCircle style={{ fontSize: 9 }} /> Chưa lưu
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="eb-toolbar-btn"
            onClick={handleExport}
            disabled={fetching}
          >
            <FaDownload style={{ fontSize: 11 }} /> Export HTML
          </button>
          <button
            className="eb-save-btn"
            onClick={handleSave}
            disabled={saving || fetching}
          >
            {saving ? (
              <>
                <FaSync className="eb-spin" style={{ fontSize: 11 }} /> Đang
                lưu...
              </>
            ) : (
              <>
                <FaSave style={{ fontSize: 11 }} /> Lưu template
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="eb-toolbar">
        <input
          className="eb-name-inp"
          type="text"
          placeholder="Tên template..."
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        <select
          className="eb-select"
          value={templateType}
          onChange={handleTypeChange}
          disabled={fetching}
        >
          {TEMPLATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} ({o.sub})
            </option>
          ))}
        </select>
      </div>

      {/* ── 3-COLUMN ── */}
      <div className="eb-builder">
        {/* COL 1: ICON STRIP */}
        <div className="eb-cat-col">
          <CatStrip onAdd={addBlock} />
        </div>

        {/* COL 2: CANVAS */}
        <div className="eb-canvas-panel">
          <div className="eb-panel-hd">
            <div className="eb-dot" style={{ background: "#1d4ed8" }} />
            <span className="eb-panel-name">Canvas</span>
            <span className="eb-panel-count">{blocks.length} khối</span>
            <span
              style={{
                fontSize: 11,
                color: "var(--subtle)",
                marginLeft: "auto",
              }}
            >
              Click khối để chỉnh sửa
            </span>
          </div>
          <div className="eb-canvas-body">
            {fetching ? (
              <Skeleton />
            ) : blocks.length === 0 ? (
              <div className="eb-canvas-empty">
                <div className="eb-canvas-empty-icon">
                  <FaEnvelope />
                </div>
                <span>
                  Chưa có khối — chọn loại template hoặc thêm từ thanh bên trái
                </span>
              </div>
            ) : (
              blocks.map((block) => (
                <div
                  key={block.id}
                  className={`eb-block-card${selectedId === block.id ? " eb-sel" : ""}`}
                  onClick={() =>
                    setSelectedId((p) => (p === block.id ? null : block.id))
                  }
                >
                  <div className="eb-card-top">
                    <span className="eb-card-tag">{block.type}</span>
                    <div
                      className="eb-card-btns"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="eb-card-btn"
                        title="Lên"
                        onClick={(e) => moveBlock(block.id, -1, e)}
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        className="eb-card-btn"
                        title="Xuống"
                        onClick={(e) => moveBlock(block.id, 1, e)}
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        className="eb-card-btn del"
                        title="Xóa"
                        onClick={(e) => delBlock(block.id, e)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="eb-card-preview">{previewText(block)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COL 3: PREVIEW */}
        <div className="eb-preview-col">
          <div className="eb-preview-panel">
            <div className="eb-preview-hd">
              <div className="eb-dot" style={{ background: "#22c55e" }} />
              <span className="eb-panel-name">Preview Email</span>
              <span className="eb-panel-count">{blocks.length} khối</span>
              <FaEye
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.4)",
                  marginLeft: "auto",
                }}
              />
            </div>
            <div className="eb-browser-bar">
              <div className="eb-bdot" style={{ background: "#ef4444" }} />
              <div className="eb-bdot" style={{ background: "#f59e0b" }} />
              <div className="eb-bdot" style={{ background: "#22c55e" }} />
              <div className="eb-browser-url">
                email-preview · {templateName}
              </div>
            </div>
            <iframe
              className="eb-preview-iframe"
              srcDoc={previewHtml}
              title="Email Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailBuilder;
