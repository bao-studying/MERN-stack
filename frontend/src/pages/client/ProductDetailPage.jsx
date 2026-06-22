import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import {
  FaHeart,
  FaMinus,
  FaPlus,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaCheckCircle,
  FaBoxOpen,
  FaRegHeart,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import ProductCard from "../../components/product/ProductCard";
import QuickViewModal from "../../components/product/QuickViewModal";
import productApi from "../../services/product.service";
import "../../assets/styles/products.css";
import AddToCartBtn from "../../components/cart/AddToCartBtn";
import { useWishlist } from "../../hooks/useWishlist";

/* ─────────────────────────────────────────────────────────────
   HELPERS: variant groups (reuse logic từ QuickViewModal)
───────────────────────────────────────────────────────────── */
function parseVariantGroups(variants = []) {
  if (!variants.length) return [];
  const hasAttrs = variants.some(
    (v) => v.attributes && typeof v.attributes === "object",
  );
  if (!hasAttrs) {
    return [
      {
        key: "Phân loại",
        type: "text",
        options: variants.map((v) => ({ label: v.name, value: v._id })),
      },
    ];
  }
  const groupMap = {};
  variants.forEach((v) => {
    Object.entries(v.attributes).forEach(([k, val]) => {
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
    (v) => v.attributes && typeof v.attributes === "object",
  );
  if (!hasAttrs) {
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
  trắng: "#f8fafc",
  white: "#f8fafc",
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
  kem: "#fef3c7",
  beige: "#f5f0e8",
};

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  /* ═══════════════════════════════════
     ROOT / SHELL
  ═══════════════════════════════════ */
  .pdp-root {
    font-family: 'DM Sans', sans-serif;
    color: #1c1917;
    min-height: 100vh;
    background: #f5f2ed;
  }

  /* ── BREADCRUMB ── */
  .pdp-crumb {
    background: rgba(245,242,237,.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(28,25,23,.08);
    padding: 12px 0;
    position: sticky; top: 0; z-index: 50;
  }
  .pdp-crumb .breadcrumb { margin: 0; font-size: 12px; }
  .pdp-crumb .breadcrumb-item a { color: #78716c; text-decoration: none; transition: color .12s; }
  .pdp-crumb .breadcrumb-item a:hover { color: #c8490c; }
  .pdp-crumb .breadcrumb-item.active { color: #1c1917; font-weight: 500; }
  .pdp-crumb .breadcrumb-item + .breadcrumb-item::before { color: #c4b9af; }

  /* ═══════════════════════════════════
     HERO — 2-column grid
  ═══════════════════════════════════ */
  .pdp-hero {
    display: grid;
    grid-template-columns: 1fr 480px;
    min-height: calc(100vh - 45px);
    max-height: calc(100vh - 45px);
    overflow: hidden;
  }

  /* ═══════════════════════════════════
     LEFT: GALLERY
  ═══════════════════════════════════ */
  .pdp-gallery {
    position: relative;
    background: #1a1714;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Main image */
  .pdp-gallery-stage {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-in;
  }
  .pdp-gallery-img {
    width: 100%; height: 100%;
    object-fit: contain;
    padding: 32px;
    transition: opacity .3s ease, transform .3s ease;
    display: block;
  }
  .pdp-gallery-img.fade { opacity: 0; transform: scale(.97); }

  /* Grain overlay on image */
  .pdp-gallery-grain {
    position: absolute; inset: 0; pointer-events: none;
    opacity: .05;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  /* Sale badge */
  .pdp-sale-badge {
    position: absolute; top: 20px; left: 20px; z-index: 5;
    background: #c8490c; color: #fff;
    font-family: 'Fraunces', serif; font-size: 14px; font-weight: 700;
    padding: 5px 13px; border-radius: 20px;
    box-shadow: 0 4px 16px rgba(200,73,12,.45);
  }

  /* Arrow buttons */
  .pdp-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.2);
    color: #fff; cursor: pointer; z-index: 5;
    display: flex; align-items: center; justify-content: center; font-size: 12px;
    transition: background .14s, border-color .14s;
    opacity: 0; pointer-events: none;
  }
  .pdp-gallery:hover .pdp-arrow { opacity: 1; pointer-events: auto; }
  .pdp-arrow:hover { background: rgba(255,255,255,.22); }
  .pdp-arrow-l { left: 16px; }
  .pdp-arrow-r { right: 16px; }

  /* Dot strip */
  .pdp-dots {
    position: absolute; bottom: 82px; left: 0; right: 0;
    display: flex; justify-content: center; gap: 5px;
    pointer-events: none;
  }
  .pdp-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,.35);
    transition: background .18s, transform .18s;
  }
  .pdp-dot.act { background: #fff; transform: scale(1.4); }

  /* Thumb strip */
  .pdp-thumbs {
    height: 80px; flex-shrink: 0;
    display: flex; align-items: center; gap: 7px;
    padding: 0 16px;
    border-top: 1px solid rgba(255,255,255,.08);
    background: rgba(0,0,0,.35);
    overflow-x: auto; scrollbar-width: none;
  }
  .pdp-thumbs::-webkit-scrollbar { display: none; }
  .pdp-thumb {
    width: 54px; height: 54px; flex-shrink: 0;
    border-radius: 10px; overflow: hidden; cursor: pointer;
    border: 2px solid transparent;
    background: rgba(255,255,255,.08);
    transition: border-color .14s, transform .14s;
  }
  .pdp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pdp-thumb:hover { transform: scale(1.07); }
  .pdp-thumb.act { border-color: #c8490c; box-shadow: 0 0 0 2px rgba(200,73,12,.3); }
  .pdp-img-counter {
    position: absolute; bottom: 88px; right: 16px;
    font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(255,255,255,.4);
    pointer-events: none;
  }

  /* ═══════════════════════════════════
     RIGHT: INFO PANEL
  ═══════════════════════════════════ */
  .pdp-info {
    background: #fff;
    border-left: 1px solid rgba(28,25,23,.08);
    overflow-y: auto;
    display: flex; flex-direction: column;
    padding: 32px 28px 28px;
    scrollbar-width: thin;
    scrollbar-color: #e8e4de transparent;
  }
  .pdp-info::-webkit-scrollbar { width: 4px; }
  .pdp-info::-webkit-scrollbar-thumb { background: #e8e4de; border-radius: 2px; }

  /* Accent line at top of panel */
  .pdp-info::before {
    content: '';
    display: block; height: 3px;
    background: linear-gradient(90deg, #c8490c 0%, #b45309 55%, transparent 100%);
    border-radius: 0 0 3px 3px;
    margin: -32px -28px 28px;
  }

  /* Category */
  .pdp-cat {
    display: inline-block; align-self: flex-start;
    font-size: 10px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
    color: #c8490c; background: rgba(200,73,12,.07); border: 1px solid rgba(200,73,12,.2);
    border-radius: 20px; padding: 3px 11px; margin-bottom: 12px;
  }

  /* Name */
  .pdp-name {
    font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700;
    line-height: 1.2; color: #1c1917; margin: 0 0 12px; letter-spacing: -.025em;
  }

  /* Meta */
  .pdp-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
  .pdp-stock-ok {
    display: flex; align-items: center; gap: 4px; color: #15803d; font-weight: 600; font-size: 11.5px;
    background: rgba(21,128,61,.07); border: 1px solid rgba(21,128,61,.18); border-radius: 20px; padding: 3px 9px;
  }
  .pdp-stock-no {
    display: flex; align-items: center; gap: 4px; color: #b91c1c; font-weight: 600; font-size: 11.5px;
    background: rgba(185,28,28,.06); border: 1px solid rgba(185,28,28,.18); border-radius: 20px; padding: 3px 9px;
  }
  .pdp-sku {
    font-family: 'DM Mono', monospace; font-size: 10px; color: #a8a29e;
    background: rgba(168,162,158,.1); border-radius: 6px; padding: 3px 7px;
  }

  /* Price block */
  .pdp-price-blk {
    background: linear-gradient(130deg, #1c1917 0%, #292524 100%);
    border-radius: 14px; padding: 16px 20px; margin-bottom: 20px;
    display: flex; align-items: baseline; gap: 14px;
    position: relative; overflow: hidden;
  }
  .pdp-price-blk::after {
    content: ''; position: absolute; top: -30px; right: -30px;
    width: 90px; height: 90px;
    background: radial-gradient(circle, rgba(200,73,12,.28), transparent 70%);
    border-radius: 50%; pointer-events: none;
  }
  .pdp-price-main { display: flex; flex-direction: column; }
  .pdp-price-lbl { font-size: 9px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #6b6560; margin-bottom: 2px; }
  .pdp-price-val {
    font-family: 'Fraunces', serif; font-size: 32px; font-weight: 700;
    color: #fff; line-height: 1; letter-spacing: -.025em;
  }
  .pdp-price-orig { font-family: 'DM Mono', monospace; font-size: 13px; color: #6b6560; text-decoration: line-through; }
  .pdp-price-badge {
    background: rgba(200,73,12,.22); border: 1px solid rgba(200,73,12,.3);
    color: #fb923c; font-size: 10.5px; font-weight: 600;
    border-radius: 6px; padding: 2px 8px;
  }

  /* Divider */
  .pdp-div { height: 1px; background: linear-gradient(90deg, transparent, #e8e4de 35%, #e8e4de 65%, transparent); margin: 16px 0; }

  /* Section label */
  .pdp-lbl { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #78716c; margin-bottom: 9px; }

  /* ── VARIANT GROUPS ── */
  .pdp-var-group { margin-bottom: 16px; }
  .pdp-var-group-header { display: flex; align-items: baseline; gap: 7px; margin-bottom: 8px; }
  .pdp-var-key { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #44403c; }
  .pdp-var-selected { font-size: 12px; color: #c8490c; font-weight: 500; }
  .pdp-chips { display: flex; flex-wrap: wrap; gap: 7px; }
  .pdp-chip-color {
    width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
    border: 2.5px solid transparent;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.12);
    transition: transform .14s, box-shadow .14s;
    flex-shrink: 0;
  }
  .pdp-chip-color:hover { transform: scale(1.12); }
  .pdp-chip-color.act {
    border-color: #c8490c;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), 0 0 0 3px rgba(200,73,12,.25);
  }
  .pdp-chip-text {
    font-size: 12px; font-weight: 500; padding: 5px 14px;
    border-radius: 8px; border: 1.5px solid #e2ded6;
    background: transparent; color: #44403c; cursor: pointer;
    transition: all .14s; font-family: 'DM Sans', sans-serif;
    min-width: 38px; text-align: center;
  }
  .pdp-chip-text:hover { border-color: #c8490c; color: #c8490c; }
  .pdp-chip-text.act { border-color: #c8490c; background: #c8490c; color: #fff; box-shadow: 0 3px 10px rgba(200,73,12,.28); }

  /* ── QUANTITY + ACTIONS ── */
  .pdp-actions {
    display: grid; grid-template-columns: auto 1fr auto;
    gap: 8px; align-items: center;
  }
  .pdp-qty {
    display: flex; align-items: center;
    border: 1.5px solid #e2ded6; border-radius: 10px;
    overflow: hidden; background: #fafaf9;
  }
  .pdp-qbtn {
    width: 38px; height: 44px; background: transparent; border: none;
    color: #78716c; cursor: pointer; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
    transition: background .12s, color .12s;
  }
  .pdp-qbtn:hover:not(:disabled) { background: #f5f3ef; color: #1c1917; }
  .pdp-qbtn:disabled { opacity: .35; cursor: default; }
  .pdp-qinput {
    width: 42px; text-align: center; border: none;
    border-left: 1px solid #e2ded6; border-right: 1px solid #e2ded6;
    background: transparent; font-family: 'DM Mono', monospace;
    font-size: 14px; font-weight: 500; color: #1c1917;
    height: 44px; outline: none;
  }
  .pdp-cart-btn {
    height: 44px; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    letter-spacing: .04em; cursor: pointer; transition: all .2s;
    background: linear-gradient(135deg, #c8490c, #b45309);
    color: #fff;
    box-shadow: 0 4px 16px rgba(200,73,12,.3);
  }
  .pdp-cart-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #b94108, #a34008);
    box-shadow: 0 6px 20px rgba(200,73,12,.4);
    transform: translateY(-1px);
  }
  .pdp-cart-btn:disabled { background: #e8e4de; color: #a09890; cursor: not-allowed; box-shadow: none; transform: none; }
  .pdp-wish {
    width: 44px; height: 44px; border-radius: 10px;
    border: 1.5px solid #e2ded6; background: #fafaf9;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: all .14s; color: #78716c; flex-shrink: 0;
  }
  .pdp-wish:hover { border-color: #e11d48; color: #e11d48; background: rgba(225,29,72,.05); }
  .pdp-wish.liked { border-color: #e11d48; color: #e11d48; background: rgba(225,29,72,.08); }

  /* ── POLICY ── */
  .pdp-policy { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; margin-top: 18px; }
  .pdp-pol-item {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 11px 4px; border-radius: 10px;
    background: #faf9f7; border: 1px solid #eee9e3; text-align: center;
  }
  .pdp-pol-icon { font-size: 15px; color: #c8490c; }
  .pdp-pol-title { font-size: 10.5px; font-weight: 600; color: #44403c; }
  .pdp-pol-sub { font-size: 9.5px; color: #a8a29e; }

  /* ═══════════════════════════════════
     BELOW FOLD — related products
  ═══════════════════════════════════ */
  .pdp-below {
    background: #f5f2ed;
    border-top: 1px solid #e5e1db;
    padding: 56px 0 72px;
  }
  .pdp-rel-title {
    font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700;
    color: #1c1917; margin-bottom: 32px; letter-spacing: -.02em;
  }
  .pdp-rel-title em { color: #c8490c; font-style: italic; }

  /* ── LOADING ── */
  .pdp-loading {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #f5f2ed;
  }

  /* ═══════════════════════════════════
     RESPONSIVE
  ═══════════════════════════════════ */
  @media (max-width: 991px) {
    .pdp-hero {
      grid-template-columns: 1fr;
      min-height: auto; max-height: none;
    }
    .pdp-gallery { min-height: 60vw; max-height: 72vw; }
    .pdp-info { border-left: none; border-top: 1px solid rgba(28,25,23,.08); }
    .pdp-info::before { margin: -32px -28px 28px; }
  }
  @media (max-width: 576px) {
    .pdp-info { padding: 24px 18px 22px; }
    .pdp-info::before { margin: -24px -18px 22px; }
    .pdp-name { font-size: 22px; }
    .pdp-price-val { font-size: 26px; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgFading, setImgFading] = useState(false);

  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] =
    useState(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = product ? isInWishlist(product._id) : false;

  /* ── fetch ── */
  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true);
        const response = await productApi.getBySlug(slug);
        const p = response.data;
        setProduct(p);
        setCurrentImageIndex(0);

        // Init variant attrs
        const groups = parseVariantGroups(p.variants);
        const hasAttrs = p.variants?.some(
          (v) => v.attributes && typeof v.attributes === "object",
        );
        const init = {};
        if (hasAttrs)
          groups.forEach((g) => {
            if (g.options.length) init[g.key] = g.options[0].value;
          });
        else if (p.variants?.length) init["Phân loại"] = p.variants[0]._id;
        setSelectedAttrs(init);
        setQuantity(1);

        const catId =
          typeof p.categoryId === "object" ? p.categoryId._id : p.categoryId;
        if (catId) {
          const relRes = await productApi.getRelated(catId, p._id);
          setRelatedProducts(
            (relRes.data || []).map((item) => ({
              ...item,
              id: item._id,
              price: item.price_cents,
              salePrice: item.compareAtPriceCents || null,
              image:
                item.images?.[0]?.imageUrl || "https://placehold.co/300x300",
            })),
          );
        }
      } catch {
        setError("Không tìm thấy sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [slug]);

  /* ── images ── */
  const images = useMemo(() => {
    if (
      !product?.images ||
      !Array.isArray(product.images) ||
      !product.images.length
    ) {
      return [product?.image || "https://placehold.co/800x800?text=No+Image"];
    }
    return product.images
      .map((i) =>
        typeof i === "string" ? i : i?.imageUrl || i?.url || i?.src || null,
      )
      .filter(Boolean);
  }, [product]);

  const switchImage = useCallback(
    (idx) => {
      if (idx === currentImageIndex) return;
      setImgFading(true);
      setTimeout(() => {
        setCurrentImageIndex(idx);
        setImgFading(false);
      }, 220);
    },
    [currentImageIndex],
  );

  const prevImg = () =>
    switchImage((currentImageIndex - 1 + images.length) % images.length);
  const nextImg = () => switchImage((currentImageIndex + 1) % images.length);

  /* ── variant logic ── */
  const variantGroups = useMemo(
    () => parseVariantGroups(product?.variants),
    [product],
  );
  const selectedVariant = useMemo(
    () => matchVariant(product?.variants, selectedAttrs),
    [product, selectedAttrs],
  );

  const selectAttr = (key, value) => {
    setSelectedAttrs((prev) => ({ ...prev, [key]: value }));
    setQuantity(1);
  };

  const currentPrice = selectedVariant?.price_cents ?? product?.price_cents;
  const currentStock = selectedVariant?.stock ?? 100;
  const currentSku = selectedVariant?.sku ?? product?.sku;
  const salePercent = product?.salePrice
    ? Math.round(
        ((product.price_cents - product.salePrice) / product.price_cents) * 100,
      )
    : null;

  /* ── loading / error ── */
  if (loading)
    return (
      <div className="pdp-loading">
        <style>{STYLES}</style>
        <Spinner animation="border" style={{ color: "#c8490c" }} />
      </div>
    );
  if (error || !product)
    return (
      <div className="pdp-loading">
        <style>{STYLES}</style>
        <p>{error}</p>
      </div>
    );

  const currentImage = images[currentImageIndex] || images[0];

  return (
    <div className="pdp-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── BREADCRUMB ── */}
      <nav className="pdp-crumb">
        <Container>
          <ol className="breadcrumb mb-0" style={{ fontSize: 12 }}>
            <li className="breadcrumb-item">
              <Link to="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products">Sản phẩm</Link>
            </li>
            <li className="breadcrumb-item active">{product.name}</li>
          </ol>
        </Container>
      </nav>

      {/* ═══════════════════════════
          HERO: gallery + info
      ═══════════════════════════ */}
      <div className="pdp-hero">
        {/* ── LEFT: GALLERY ── */}
        <div className="pdp-gallery">
          <div className="pdp-gallery-stage">
            {salePercent && (
              <div className="pdp-sale-badge">-{salePercent}%</div>
            )}

            <img
              src={currentImage}
              alt={product.name}
              className={`pdp-gallery-img${imgFading ? " fade" : ""}`}
            />
            <div className="pdp-gallery-grain" />

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button className="pdp-arrow pdp-arrow-l" onClick={prevImg}>
                  <FaChevronLeft />
                </button>
                <button className="pdp-arrow pdp-arrow-r" onClick={nextImg}>
                  <FaChevronRight />
                </button>
                <div className="pdp-dots">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`pdp-dot${i === currentImageIndex ? " act" : ""}`}
                    />
                  ))}
                </div>
                <div className="pdp-img-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumb strip */}
          {images.length > 1 && (
            <div className="pdp-thumbs">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`pdp-thumb${i === currentImageIndex ? " act" : ""}`}
                  onClick={() => switchImage(i)}
                >
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: INFO PANEL ── */}
        <div className="pdp-info">
          <span className="pdp-cat">
            {product.categoryId?.name || "Sản phẩm"}
          </span>

          <h1 className="pdp-name">{product.name}</h1>

          <div className="pdp-meta">
            {currentStock > 0 ? (
              <span className="pdp-stock-ok">
                <FaCheckCircle size={9} /> Còn hàng
              </span>
            ) : (
              <span className="pdp-stock-no">
                <FaBoxOpen size={9} /> Hết hàng
              </span>
            )}
            {currentSku && <span className="pdp-sku">SKU: {currentSku}</span>}
          </div>

          {/* Price */}
          <div className="pdp-price-blk">
            <div className="pdp-price-main">
              <div className="pdp-price-lbl">Giá bán</div>
              <div className="pdp-price-val">
                {currentPrice?.toLocaleString("vi-VN")} đ
              </div>
            </div>
            {product.salePrice && (
              <>
                <span className="pdp-price-orig">
                  {product.price_cents?.toLocaleString("vi-VN")} đ
                </span>
                <span className="pdp-price-badge">-{salePercent}%</span>
              </>
            )}
          </div>

          <div className="pdp-div" />

          {/* Variant groups */}
          {variantGroups.map((group) => (
            <div className="pdp-var-group" key={group.key}>
              <div className="pdp-var-group-header">
                <span className="pdp-var-key">{group.key}:</span>
                <span className="pdp-var-selected">
                  {selectedAttrs[group.key] || "—"}
                </span>
              </div>
              <div className="pdp-chips">
                {group.options.map((opt) => {
                  const isActive = selectedAttrs[group.key] === opt.value;
                  if (group.type === "color") {
                    const bg = COLOR_MAP[opt.value.toLowerCase()] || "#999";
                    return (
                      <button
                        key={opt.value}
                        className={`pdp-chip-color${isActive ? " act" : ""}`}
                        style={{ background: bg }}
                        title={opt.label}
                        onClick={() => selectAttr(group.key, opt.value)}
                      />
                    );
                  }
                  return (
                    <button
                      key={opt.value}
                      className={`pdp-chip-text${isActive ? " act" : ""}`}
                      onClick={() => selectAttr(group.key, opt.value)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {variantGroups.length > 0 && <div className="pdp-div" />}

          {/* Qty label */}
          <div className="pdp-lbl">Số lượng</div>

          {/* Qty + Cart + Wish */}
          <div className="pdp-actions">
            <div className="pdp-qty">
              <button
                className="pdp-qbtn"
                onClick={() => setQuantity((q) => q - 1)}
                disabled={quantity <= 1}
              >
                <FaMinus size={9} />
              </button>
              <input
                type="text"
                className="pdp-qinput"
                value={quantity}
                readOnly
              />
              <button
                className="pdp-qbtn"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={currentStock <= 0}
              >
                <FaPlus size={9} />
              </button>
            </div>

            {/* ĐOẠN CODE ĐÃ SỬA: Bổ sung variantId và variantData */}
            <AddToCartBtn
              productId={product._id}
              variantId={selectedVariant?._id || null}
              variantData={
                selectedVariant
                  ? {
                      name: selectedVariant.name || "Mặc định",
                      price_cents:
                        selectedVariant.price_cents || product.price_cents || 0,
                      stock: selectedVariant.stock ?? 0,
                      attributes: selectedVariant.attributes || {},
                    }
                  : null
              }
              quantity={quantity}
              disabled={currentStock <= 0}
              className="pdp-cart-btn"
            >
              {currentStock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
            </AddToCartBtn>
            <button
              className={`pdp-wish${isLiked ? " liked" : ""}`}
              onClick={() => toggleWishlist(product)}
              title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div className="pdp-div" />

          {/* Policy */}
          <div className="pdp-policy">
            <div className="pdp-pol-item">
              <FaTruck className="pdp-pol-icon" />
              <span className="pdp-pol-title">Miễn phí ship</span>
              <span className="pdp-pol-sub">Từ 300.000 đ</span>
            </div>
            <div className="pdp-pol-item">
              <FaShieldAlt className="pdp-pol-icon" />
              <span className="pdp-pol-title">Chính hãng</span>
              <span className="pdp-pol-sub">Cam kết 100%</span>
            </div>
            <div className="pdp-pol-item">
              <FaUndo className="pdp-pol-icon" />
              <span className="pdp-pol-title">Đổi trả</span>
              <span className="pdp-pol-sub">Trong 7 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════
          BELOW FOLD
      ═══════════════════════════ */}
      {relatedProducts.length > 0 && (
        <div className="pdp-below">
          <Container>
            <h3 className="pdp-rel-title">
              Sản phẩm <em>tương tự</em>
            </h3>
            <Row xs={2} md={4} className="g-4">
              {relatedProducts.map((p) => (
                <Col key={p.id}>
                  <ProductCard
                    product={p}
                    onQuickView={(prod) => {
                      setSelectedQuickViewProduct(prod);
                      setShowQuickView(true);
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      )}

      <QuickViewModal
        show={showQuickView}
        handleClose={() => setShowQuickView(false)}
        product={selectedQuickViewProduct}
      />
    </div>
  );
};

export default ProductDetailPage;
