import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaMinus,
  FaPlus,
  FaTimes,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaCheckCircle,
  FaBoxOpen,
  FaExternalLinkAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import AddToCartBtn from "../cart/AddToCartBtn";
import { useWishlist } from "../../hooks/useWishlist";

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  /* ── OVERLAY — dark ambient (thay thế hoàn toàn ảnh sản phẩm) ── */
  .qv-overlay {
    position: fixed; inset: 0; z-index: 1055;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    background: rgba(8, 6, 4, 0.94);
    animation: qvOverlayIn .24s ease both;
    overflow: hidden;
  }
  @keyframes qvOverlayIn { from { opacity:0 } to { opacity:1 } }

  /* ── LIQUID GLASS BACKGROUND — animated color orbs ── */
  .qv-liquid-bg {
    position: absolute; inset: 0; overflow: hidden; pointer-events: none;
  }

  /* Glass shimmer layer */
  .qv-liquid-bg::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 15% 20%, rgba(200,73,12,.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 70% at 85% 75%, rgba(26,107,60,.14) 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 50% 50%, rgba(29,78,216,.08) 0%, transparent 70%);
    animation: qvGlassShimmer 20s ease-in-out infinite alternate;
  }
  @keyframes qvGlassShimmer {
    0%   { opacity: .7; transform: scale(1)    rotate(0deg); }
    33%  { opacity: 1;  transform: scale(1.04) rotate(.8deg); }
    66%  { opacity: .8; transform: scale(.97)  rotate(-.5deg); }
    100% { opacity: .9; transform: scale(1.02) rotate(.3deg); }
  }

  /* Orb 1 — warm orange/rust */
  .qv-orb-1 {
    position: absolute;
    width: 70vw; height: 70vw; max-width: 700px; max-height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 38%,
      rgba(200,73,12,.32) 0%,
      rgba(200,73,12,.10) 35%,
      transparent 70%
    );
    top: -25%; left: -20%;
    filter: blur(80px);
    animation: qvOrb1 18s ease-in-out infinite;
  }
  @keyframes qvOrb1 {
    0%,100% { transform: translate(0,0)      scale(1);    }
    30%     { transform: translate(40px,-30px) scale(1.07); }
    60%     { transform: translate(-25px,20px) scale(.94); }
    80%     { transform: translate(15px,35px)  scale(1.03); }
  }

  /* Orb 2 — deep green */
  .qv-orb-2 {
    position: absolute;
    width: 55vw; height: 55vw; max-width: 560px; max-height: 560px;
    border-radius: 50%;
    background: radial-gradient(circle at 60% 60%,
      rgba(26,107,60,.28) 0%,
      rgba(26,107,60,.08) 40%,
      transparent 70%
    );
    bottom: -20%; right: -15%;
    filter: blur(90px);
    animation: qvOrb2 22s ease-in-out infinite;
  }
  @keyframes qvOrb2 {
    0%,100% { transform: translate(0,0)       scale(1);    }
    25%     { transform: translate(-30px,25px) scale(1.05); }
    55%     { transform: translate(20px,-20px) scale(.93); }
    80%     { transform: translate(-10px,30px) scale(1.04); }
  }

  /* Orb 3 — midnight blue (subtle) */
  .qv-orb-3 {
    position: absolute;
    width: 40vw; height: 40vw; max-width: 420px; max-height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 50%,
      rgba(29,78,216,.2) 0%,
      rgba(29,78,216,.05) 40%,
      transparent 70%
    );
    top: 35%; left: 40%;
    filter: blur(110px);
    animation: qvOrb3 25s ease-in-out infinite;
  }
  @keyframes qvOrb3 {
    0%,100% { transform: translate(-50%,-50%) scale(1);    }
    40%     { transform: translate(-50%,-50%) scale(1.1) translate(20px,-15px); }
    70%     { transform: translate(-50%,-50%) scale(.9)  translate(-15px,20px); }
  }

  /* Orb 4 — amber accent */
  .qv-orb-4 {
    position: absolute;
    width: 35vw; height: 35vw; max-width: 360px; max-height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle at 45% 55%,
      rgba(180,83,9,.2) 0%,
      rgba(180,83,9,.04) 40%,
      transparent 70%
    );
    top: 10%; right: 5%;
    filter: blur(100px);
    animation: qvOrb4 28s ease-in-out infinite reverse;
  }
  @keyframes qvOrb4 {
    0%,100% { transform: translate(0,0)       scale(1);    }
    35%     { transform: translate(25px,-20px) scale(1.06); }
    65%     { transform: translate(-20px,15px) scale(.92); }
  }

  /* Glass grain texture overlay */
  .qv-liquid-grain {
    position: absolute; inset: 0; pointer-events: none;
    opacity: .04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px;
  }

  /* ── MODAL CARD — liquid glass surface ── */
  .qv-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 920px;
    /* Liquid glass card surface */
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(56px) saturate(2.2) brightness(1.05);
    -webkit-backdrop-filter: blur(56px) saturate(2.2) brightness(1.05);
    border: 1px solid rgba(255,255,255,.55);
    border-radius: 22px;
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,.2),
      0 8px 32px rgba(0,0,0,.22),
      0 32px 80px rgba(0,0,0,.28),
      0 80px 160px rgba(0,0,0,.2),
      inset 0 1px 0 rgba(255,255,255,.95),
      inset 0 -1px 0 rgba(255,255,255,.25);
    overflow: hidden;
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    max-height: 92vh;
    animation: qvCardIn .42s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes qvCardIn {
    from { opacity:0; transform:scale(.94) translateY(24px); }
    to   { opacity:1; transform:scale(1)   translateY(0); }
  }

  /* Accent line on top of card */
  .qv-card::before {
    content: '';
    position: absolute; top: 0; left: 24px; right: 24px; height: 2px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(200,73,12,.7) 20%,
      rgba(200,73,12,.9) 50%,
      rgba(180,83,9,.6) 80%,
      transparent 100%
    );
    border-radius: 0 0 2px 2px; z-index: 2;
  }

  /* Inner glass reflection */
  .qv-card::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 50%;
    background: linear-gradient(180deg,
      rgba(255,255,255,.12) 0%,
      transparent 100%
    );
    pointer-events: none; z-index: 0; border-radius: 22px 22px 0 0;
  }

  /* ── CLOSE BTN ── */
  .qv-close {
    position: absolute; top: 14px; right: 14px; z-index: 20;
    width: 34px; height: 34px; border-radius: 10px;
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(28,25,23,.1);
    color: #6b6560; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
    transition: background .12s, color .12s, border-color .12s;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  .qv-close:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }

  /* ════════════ LEFT: IMAGE PANEL ════════════ */
  .qv-img-panel {
    position: relative; overflow: hidden;
    background: linear-gradient(150deg, #f0ece6 0%, #e4dfd8 100%);
    display: flex; flex-direction: column;
    min-height: 420px;
  }

  .qv-img-stage {
    flex: 1; position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    min-height: 0;
  }
  .qv-img {
    width: 100%; height: 100%;
    max-height: calc(92vh - 100px);
    object-fit: contain; padding: 24px;
    transition: opacity .25s ease, transform .25s ease;
    display: block;
  }
  .qv-img.switching { opacity: 0; transform: scale(.95) translateX(10px); }

  .qv-sale-badge {
    position: absolute; top: 14px; left: 14px; z-index: 3;
    background: #c8490c; color: #fff;
    font-family: 'Fraunces', serif; font-size: 13px; font-weight: 700;
    padding: 4px 11px; border-radius: 20px;
    box-shadow: 0 4px 14px rgba(200,73,12,.4);
  }

  .qv-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,.9); border: 1px solid rgba(28,25,23,.1);
    color: #1c1917; cursor: pointer; z-index: 5;
    display: flex; align-items: center; justify-content: center; font-size: 11px;
    box-shadow: 0 2px 8px rgba(0,0,0,.12);
    transition: background .14s, box-shadow .14s;
    opacity: 0; pointer-events: none;
  }
  .qv-img-panel:hover .qv-arrow { opacity: 1; pointer-events: auto; }
  .qv-arrow:hover { background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.18); }
  .qv-arrow-l { left: 10px; }
  .qv-arrow-r { right: 10px; }
  .qv-arrow:disabled { opacity: .25 !important; cursor: default; }

  .qv-dots {
    position: absolute; bottom: 78px; left: 0; right: 0;
    display: flex; justify-content: center; gap: 5px; pointer-events: none;
  }
  .qv-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(28,25,23,.18);
    transition: background .18s, transform .18s;
  }
  .qv-dot.act { background: #c8490c; transform: scale(1.35); }

  .qv-thumbs {
    height: 76px; flex-shrink: 0;
    display: flex; gap: 6px; padding: 10px 14px;
    border-top: 1px solid rgba(226,222,214,.5);
    background: rgba(255,255,255,.6);
    overflow-x: auto; align-items: center;
    scrollbar-width: none;
  }
  .qv-thumbs::-webkit-scrollbar { display: none; }
  .qv-thumb {
    width: 52px; height: 52px; border-radius: 10px; flex-shrink: 0;
    overflow: hidden; cursor: pointer;
    border: 2px solid transparent;
    background: #fff; transition: border-color .14s, transform .14s, box-shadow .14s;
  }
  .qv-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .qv-thumb:hover { transform: scale(1.07); box-shadow: 0 3px 10px rgba(0,0,0,.12); }
  .qv-thumb.act { border-color: #c8490c; box-shadow: 0 0 0 2px rgba(200,73,12,.22); }

  /* ════════════ RIGHT: INFO PANEL ════════════ */
  .qv-info-panel {
    padding: 26px 24px 20px;
    display: flex; flex-direction: column;
    overflow-y: auto;
  }
  .qv-info-panel::-webkit-scrollbar { width: 4px; }
  .qv-info-panel::-webkit-scrollbar-thumb { background: #e0dbd4; border-radius: 2px; }

  .qv-cat {
    display: inline-block; font-size: 10px; font-weight: 600;
    letter-spacing: .12em; text-transform: uppercase;
    color: #c8490c; background: rgba(200,73,12,.07);
    border: 1px solid rgba(200,73,12,.2);
    border-radius: 20px; padding: 3px 10px; margin-bottom: 10px;
    align-self: flex-start;
  }

  .qv-name {
    font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700;
    line-height: 1.22; color: #1c1917; margin: 0 0 10px;
    letter-spacing: -.025em;
  }

  .qv-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
  .qv-stock-ok {
    display: flex; align-items: center; gap: 4px;
    color: #15803d; font-weight: 600; font-size: 11.5px;
    background: rgba(21,128,61,.07); border: 1px solid rgba(21,128,61,.2);
    border-radius: 20px; padding: 3px 9px;
  }
  .qv-stock-no {
    display: flex; align-items: center; gap: 4px;
    color: #b91c1c; font-weight: 600; font-size: 11.5px;
    background: rgba(185,28,28,.06); border: 1px solid rgba(185,28,28,.2);
    border-radius: 20px; padding: 3px 9px;
  }
  .qv-sku {
    color: #a8a29e; font-family: 'DM Mono', monospace; font-size: 10.5px;
    background: rgba(168,162,158,.08); border-radius: 6px; padding: 2px 7px;
  }

  /* Price block */
  .qv-price-blk {
    background: linear-gradient(130deg, #1c1917 0%, #2c2522 100%);
    border-radius: 13px; padding: 14px 18px; margin-bottom: 16px;
    position: relative; overflow: hidden;
    display: flex; align-items: baseline; gap: 14px;
  }
  .qv-price-blk::after {
    content: ''; position: absolute; top: -30px; right: -30px;
    width: 90px; height: 90px;
    background: radial-gradient(circle, rgba(200,73,12,.32), transparent 70%);
    border-radius: 50%; pointer-events: none;
  }
  .qv-price-main { display: flex; flex-direction: column; }
  .qv-price-lbl { font-size: 9px; font-weight: 600; letter-spacing: .11em; text-transform: uppercase; color: #6b6560; margin-bottom: 2px; }
  .qv-price-val {
    font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700;
    color: #fff; line-height: 1; letter-spacing: -.025em;
  }
  .qv-price-orig {
    font-family: 'DM Mono', monospace; font-size: 13px;
    color: #6b6560; text-decoration: line-through; line-height: 1;
  }
  .qv-price-save-badge {
    background: rgba(200,73,12,.22); border: 1px solid rgba(200,73,12,.32);
    color: #fb923c; font-size: 10.5px; font-weight: 600;
    border-radius: 6px; padding: 2px 8px;
  }

  .qv-div { height: 1px; background: linear-gradient(90deg, transparent, #e2ded6 40%, #e2ded6 60%, transparent); margin: 14px 0; }

  /* ── VARIANT GROUPS ── */
  .qv-var-group { margin-bottom: 14px; }
  .qv-var-group-header { display: flex; align-items: baseline; gap: 7px; margin-bottom: 8px; }
  .qv-var-key { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #44403c; }
  .qv-var-selected { font-size: 11.5px; color: #c8490c; font-weight: 500; }
  .qv-var-chips { display: flex; flex-wrap: wrap; gap: 6px; }

  .qv-chip-color {
    width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
    border: 2.5px solid transparent;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.12);
    transition: transform .14s, box-shadow .14s, border-color .14s;
    flex-shrink: 0;
  }
  .qv-chip-color:hover { transform: scale(1.14); }
  .qv-chip-color.act {
    border-color: #c8490c;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), 0 0 0 3.5px rgba(200,73,12,.28);
  }

  .qv-chip-text {
    font-size: 12px; font-weight: 500; padding: 5px 14px;
    border-radius: 8px; border: 1.5px solid #e2ded6;
    background: transparent; color: #44403c; cursor: pointer;
    transition: all .14s; font-family: 'DM Sans', sans-serif;
    min-width: 38px; text-align: center;
  }
  .qv-chip-text:hover { border-color: #c8490c; color: #c8490c; background: rgba(200,73,12,.04); }
  .qv-chip-text.act {
    border-color: #c8490c; background: #c8490c; color: #fff;
    box-shadow: 0 3px 10px rgba(200,73,12,.28);
  }
  .qv-chip-text:disabled { opacity: .35; cursor: not-allowed; text-decoration: line-through; }

  /* ── QUANTITY + ACTIONS ── */
  .qv-qty-label {
    font-size: 10px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: #78716c; margin-bottom: 8px;
  }
  .qv-action-row {
    display: grid; grid-template-columns: auto 1fr auto;
    gap: 8px; align-items: center; margin-bottom: 4px;
  }
  .qv-qty {
    display: flex; align-items: center;
    border: 1.5px solid #e2ded6; border-radius: 10px; overflow: hidden;
    background: #fafaf9; transition: border-color .12s;
  }
  .qv-qty:focus-within { border-color: #c8490c; }
  .qv-qbtn {
    width: 36px; height: 42px; background: transparent; border: none;
    color: #78716c; cursor: pointer; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
    transition: background .12s, color .12s;
  }
  .qv-qbtn:hover:not(:disabled) { background: #f5f3ef; color: #1c1917; }
  .qv-qbtn:disabled { opacity: .35; cursor: not-allowed; }
  .qv-qinput {
    width: 40px; text-align: center; border: none;
    border-left: 1px solid #e2ded6; border-right: 1px solid #e2ded6;
    background: transparent; font-family: 'DM Mono', monospace;
    font-size: 14px; font-weight: 500; color: #1c1917; height: 42px; outline: none;
  }

  .qv-cart-btn {
    flex: 1; height: 42px;
    border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: .04em;
    transition: all .2s; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .qv-cart-btn.available {
    background: linear-gradient(135deg, #c8490c, #b45309);
    color: #fff; box-shadow: 0 4px 16px rgba(200,73,12,.3);
  }
  .qv-cart-btn.available:hover {
    background: linear-gradient(135deg, #b94108, #a34008);
    box-shadow: 0 6px 22px rgba(200,73,12,.4); transform: translateY(-1px);
  }
  .qv-cart-btn.unavailable { background: #e8e4de; color: #a09890; cursor: not-allowed; }

  .qv-wish {
    width: 42px; height: 42px; border-radius: 10px;
    border: 1.5px solid #e2ded6; background: #fafaf9;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: all .14s; color: #78716c; flex-shrink: 0;
  }
  .qv-wish:hover { border-color: #e11d48; color: #e11d48; background: rgba(225,29,72,.05); }
  .qv-wish.liked { border-color: #e11d48; color: #e11d48; background: rgba(225,29,72,.08); }

  /* ── POLICY ── */
  .qv-policy {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-top: 14px;
  }
  .qv-pol-item {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 10px 4px; border-radius: 10px;
    background: rgba(245,243,239,.9); border: 1px solid #eeebe5; text-align: center;
  }
  .qv-pol-icon { font-size: 14px; color: #c8490c; }
  .qv-pol-title { font-size: 10.5px; font-weight: 600; color: #44403c; }
  .qv-pol-sub { font-size: 9.5px; color: #a8a29e; line-height: 1.4; }

  .qv-detail-link {
    display: inline-flex; align-items: center; gap: 6px; margin-top: 14px;
    font-size: 11.5px; font-weight: 600; color: #6b6560;
    text-decoration: none; transition: color .12s;
  }
  .qv-detail-link:hover { color: #c8490c; }

  @media (max-width: 640px) {
    .qv-card { grid-template-columns: 1fr; max-height: 96vh; }
    .qv-img-panel { min-height: 200px; max-height: 42vh; }
    .qv-overlay { padding: 0; align-items: flex-end; }
    .qv-card { border-radius: 20px 20px 0 0; max-width: 100%; }
    .qv-img { max-height: 42vh; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function parseVariantGroups(variants = []) {
  if (!variants.length) return [];
  const hasAttrs = variants.some(
    (v) =>
      v.attributes &&
      typeof v.attributes === "object" &&
      Object.keys(v.attributes).length > 0,
  );
  if (!hasAttrs) {
    return [
      {
        key: "Phân loại",
        type: "text",
        options: variants.map((v) => ({
          label: v.name || "Mặc định",
          value: v._id,
        })),
      },
    ];
  }
  const groupMap = {};
  variants.forEach((v) => {
    Object.entries(v.attributes || {}).forEach(([k, val]) => {
      if (!groupMap[k]) groupMap[k] = [];
      if (!groupMap[k].includes(val)) groupMap[k].push(val);
    });
  });
  const COLOR_KEYS = ["màu", "color", "colour", "màu sắc"];
  return Object.entries(groupMap).map(([key, values]) => ({
    key,
    type: COLOR_KEYS.includes(key.toLowerCase()) ? "color" : "text",
    options: values.map((val) => ({ label: val, value: val })),
  }));
}

function matchVariant(variants, selectedAttrs) {
  if (!variants?.length) return null;
  const hasAttrs = variants.some(
    (v) =>
      v.attributes &&
      typeof v.attributes === "object" &&
      Object.keys(v.attributes).length > 0,
  );
  if (!hasAttrs) {
    // Fallback: selectedAttrs = { "Phân loại": variantId }
    const id = Object.values(selectedAttrs)[0];
    return variants.find((v) => v._id === id) || variants[0];
  }
  return (
    variants.find((v) =>
      Object.entries(selectedAttrs).every(
        ([k, val]) => v.attributes?.[k] === val,
      ),
    ) || null
  );
}

const COLOR_MAP = {
  đỏ: "#ef4444",
  red: "#ef4444",
  xanh: "#3b82f6",
  blue: "#3b82f6",
  "xanh lá": "#22c55e",
  green: "#22c55e",
  "xanh navy": "#1e3a8a",
  navy: "#1e3a8a",
  vàng: "#eab308",
  yellow: "#eab308",
  đen: "#111827",
  black: "#111827",
  trắng: "#f9fafb",
  white: "#f9fafb",
  hồng: "#ec4899",
  pink: "#ec4899",
  tím: "#a855f7",
  purple: "#a855f7",
  cam: "#f97316",
  orange: "#f97316",
  nâu: "#92400e",
  brown: "#92400e",
  xám: "#6b7280",
  gray: "#6b7280",
  grey: "#6b7280",
  kem: "#fef3c7",
  beige: "#f5f0e8",
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const QuickViewModal = ({ show, handleClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgSwitching, setImgSwitching] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = product ? isInWishlist(product._id) : false;

  // Reset khi product thay đổi
  useEffect(() => {
    if (!product) return;
    setQuantity(1);
    setCurrentImageIndex(0);

    const groups = parseVariantGroups(product.variants);
    const hasAttrs = product.variants?.some(
      (v) =>
        v.attributes &&
        typeof v.attributes === "object" &&
        Object.keys(v.attributes).length > 0,
    );
    const initAttrs = {};
    if (hasAttrs) {
      groups.forEach((g) => {
        if (g.options.length) initAttrs[g.key] = g.options[0].value;
      });
    } else if (product.variants?.length) {
      initAttrs["Phân loại"] = product.variants[0]._id;
    }
    setSelectedAttrs(initAttrs);
  }, [product?._id]);

  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const images = useMemo(() => {
    if (!product) return ["https://placehold.co/600x600?text=No+Image"];
    if (!product.images?.length) {
      return [product.image || "https://placehold.co/600x600?text=No+Image"];
    }
    return product.images
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.imageUrl || item?.url || item?.src || null,
      )
      .filter(Boolean);
  }, [product]);

  const currentImage = images[currentImageIndex] || images[0];

  const switchImage = useCallback(
    (idx) => {
      if (idx === currentImageIndex) return;
      setImgSwitching(true);
      setTimeout(() => {
        setCurrentImageIndex(idx);
        setImgSwitching(false);
      }, 200);
    },
    [currentImageIndex],
  );

  const prevImage = () =>
    switchImage((currentImageIndex - 1 + images.length) % images.length);
  const nextImage = () => switchImage((currentImageIndex + 1) % images.length);

  if (!show || !product) return null;

  const variantGroups = parseVariantGroups(product.variants);
  const selectedVariant = matchVariant(product.variants, selectedAttrs);

  const currentPrice = selectedVariant?.price_cents ?? product.price_cents;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0; // Ưu tiên stock biến thể, rồi đến stock sản phẩm gốc, cuối cùng là 0
  const currentSku = selectedVariant?.sku ?? product.sku;

  // Sửa thêm điều kiện salePercent để tránh chia cho 0 hoặc lỗi undefined:
  const salePercent =
    product.salePrice && product.price_cents
      ? Math.round(
          ((product.price_cents - product.salePrice) / product.price_cents) *
            100,
        )
      : null;

 

  const selectAttr = (key, value) => {
    setSelectedAttrs((prev) => ({ ...prev, [key]: value }));
    setQuantity(1);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="qv-overlay" onClick={handleClose}>
        {/* ── LIQUID GLASS BACKGROUND ── */}
        <div className="qv-liquid-bg" onClick={(e) => e.stopPropagation()}>
          <div className="qv-orb-1" />
          <div className="qv-orb-2" />
          <div className="qv-orb-3" />
          <div className="qv-orb-4" />
          <div className="qv-liquid-grain" />
        </div>

        {/* ── MODAL CARD ── */}
        <div className="qv-card" onClick={(e) => e.stopPropagation()}>
          <button className="qv-close" onClick={handleClose}>
            <FaTimes />
          </button>

          {/* ── LEFT: IMAGE ── */}
          <div className="qv-img-panel">
            <div className="qv-img-stage">
              {salePercent && (
                <div className="qv-sale-badge">-{salePercent}%</div>
              )}

              <img
                src={currentImage}
                alt={product.name}
                className={`qv-img${imgSwitching ? " switching" : ""}`}
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x600?text=No+Image";
                }}
              />

              {images.length > 1 && (
                <>
                  <button className="qv-arrow qv-arrow-l" onClick={prevImage}>
                    <FaChevronLeft />
                  </button>
                  <button className="qv-arrow qv-arrow-r" onClick={nextImage}>
                    <FaChevronRight />
                  </button>
                  <div className="qv-dots">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`qv-dot${idx === currentImageIndex ? " act" : ""}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="qv-thumbs">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`qv-thumb${idx === currentImageIndex ? " act" : ""}`}
                    onClick={() => switchImage(idx)}
                  >
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: INFO ── */}
          <div className="qv-info-panel">
            <div className="qv-cat">
              {product.categoryId?.name || "Sản phẩm"}
            </div>
            <h2 className="qv-name">{product.name}</h2>

            {/* Stock + SKU */}
            <div className="qv-meta">
              {currentStock > 0 ? (
                <span className="qv-stock-ok">
                  <FaCheckCircle size={9} /> Còn hàng ({currentStock})
                </span>
              ) : (
                <span className="qv-stock-no">
                  <FaBoxOpen size={9} /> Hết hàng
                </span>
              )}
              {currentSku && <span className="qv-sku">SKU: {currentSku}</span>}
            </div>

            {/* Price */}
            <div className="qv-price-blk">
              <div className="qv-price-main">
                <div className="qv-price-lbl">Giá bán</div>
                <div className="qv-price-val">
                  {currentPrice?.toLocaleString("vi-VN")} đ
                </div>
              </div>
              {product.salePrice && (
                <>
                  <span className="qv-price-orig">
                    {product.price_cents?.toLocaleString("vi-VN")} đ
                  </span>
                  <span className="qv-price-save-badge">-{salePercent}%</span>
                </>
              )}
            </div>

            <div className="qv-div" />

            {/* ── VARIANT GROUPS ── */}
            {variantGroups.map((group) => (
              <div className="qv-var-group" key={group.key}>
                <div className="qv-var-group-header">
                  <span className="qv-var-key">{group.key}:</span>
                  <span className="qv-var-selected">
                    {selectedAttrs[group.key] || "—"}
                  </span>
                </div>
                <div className="qv-var-chips">
                  {group.options.map((opt) => {
                    const isActive = selectedAttrs[group.key] === opt.value;
                    if (group.type === "color") {
                      const bg = COLOR_MAP[opt.value.toLowerCase()] || "#999";
                      return (
                        <button
                          key={opt.value}
                          className={`qv-chip-color${isActive ? " act" : ""}`}
                          style={{ background: bg }}
                          title={opt.label}
                          onClick={() => selectAttr(group.key, opt.value)}
                        />
                      );
                    }
                    return (
                      <button
                        key={opt.value}
                        className={`qv-chip-text${isActive ? " act" : ""}`}
                        onClick={() => selectAttr(group.key, opt.value)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {variantGroups.length > 0 && <div className="qv-div" />}

            {/* Qty + Cart + Wish */}
            <div className="qv-qty-label">Số lượng</div>
            <div className="qv-action-row">
              <div className="qv-qty">
                <button
                  className="qv-qbtn"
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                  disabled={quantity <= 1}
                >
                  <FaMinus size={9} />
                </button>
                <input
                  type="text"
                  className="qv-qinput"
                  value={quantity}
                  readOnly
                />
                <button
                  className="qv-qbtn"
                  onClick={() =>
                    currentStock > quantity && setQuantity((q) => q + 1)
                  }
                  disabled={currentStock <= 0 || quantity >= currentStock}
                >
                  <FaPlus size={9} />
                </button>
              </div>

              {/*
                Truyền variantId và variantData đầy đủ để CartPage
                hiển thị đúng thông tin biến thể (tên, attributes, giá, stock)
              */}
              {/* ➔ SỬA THÀNH (Đổi productId thành product): */}
              <AddToCartBtn
                product={product} // Truyền toàn bộ object chứa name, images, slug...
                variantId={selectedVariant?._id || null}
                variantData={selectedVariant || null}
                quantity={quantity}
                disabled={
                  currentStock <= 0 ||
                  (product.variants?.length > 0 && !selectedVariant)
                }
                showIcon={false}
                className={`qv-cart-btn ${currentStock > 0 ? "available" : "unavailable"}`}
              >
                {currentStock <= 0
                  ? "Hết hàng"
                  : product.variants?.length > 0 && !selectedVariant
                    ? "Chọn biến thể"
                    : "Thêm vào giỏ"}
              </AddToCartBtn>

              <button
                className={`qv-wish${isLiked ? " liked" : ""}`}
                onClick={() => toggleWishlist(product)}
                title={isLiked ? "Bỏ yêu thích" : "Thêm yêu thích"}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <div className="qv-div" />

            {/* Policy */}
            <div className="qv-policy">
              <div className="qv-pol-item">
                <FaTruck className="qv-pol-icon" />
                <span className="qv-pol-title">Miễn phí ship</span>
                <span className="qv-pol-sub">Từ 300.000 đ</span>
              </div>
              <div className="qv-pol-item">
                <FaShieldAlt className="qv-pol-icon" />
                <span className="qv-pol-title">Chính hãng</span>
                <span className="qv-pol-sub">Cam kết 100%</span>
              </div>
              <div className="qv-pol-item">
                <FaUndo className="qv-pol-icon" />
                <span className="qv-pol-title">Đổi trả</span>
                <span className="qv-pol-sub">Trong 7 ngày</span>
              </div>
            </div>

            <Link
              to={`/product/${product.slug}`}
              className="qv-detail-link"
              onClick={handleClose}
            >
              <FaExternalLinkAlt size={10} />
              Xem trang chi tiết đầy đủ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;
