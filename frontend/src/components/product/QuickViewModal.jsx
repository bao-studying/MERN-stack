import React, { useState, useMemo, useEffect } from "react";
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
} from "react-icons/fa";
import AddToCartBtn from "../cart/AddToCartBtn";
import { useWishlist } from "../../hooks/useWishlist";

/* ─────────────────────────────────────────────────────────────
   STYLES — Twin DNA với ProductDetailPage (Concept 05)
   Fraunces + DM Sans + DM Mono | palette #f5f2ed / #1c1917 / #c8490c
───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  /* ── OVERLAY ── */
  .qv-overlay {
    position: fixed; inset: 0; z-index: 1055;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: qvOverlayIn .22s ease both;
  }
  @keyframes qvOverlayIn { from{opacity:0} to{opacity:1} }

  /* ── FULL-BLEED BG (product image) ── */
  .qv-bg {
    position: absolute; inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transition: background-image .5s ease;
  }
  .qv-bg-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      105deg,
      rgba(10,8,5,.45) 0%,
      rgba(10,8,5,.6)  40%,
      rgba(10,8,5,.82) 100%
    );
  }
  .qv-bg-grain {
    position: absolute; inset: 0; opacity: .07; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  /* ── MODAL CARD ── */
  .qv-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 860px;
    background: rgba(255,255,255,.92);
    backdrop-filter: blur(40px) saturate(1.8);
    -webkit-backdrop-filter: blur(40px) saturate(1.8);
    border: 1px solid rgba(226,222,214,.7);
    border-radius: 24px;
    box-shadow:
      0 2px 4px rgba(28,25,23,.03),
      0 16px 48px rgba(28,25,23,.18),
      0 56px 120px rgba(28,25,23,.22),
      inset 0 1px 0 rgba(255,255,255,.95);
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-height: 90vh;
    animation: qvCardIn .4s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes qvCardIn {
    from { opacity:0; transform:scale(.96) translateY(16px); }
    to   { opacity:1; transform:scale(1)  translateY(0); }
  }
  .qv-card::before {
    content: '';
    position: absolute; top: 0; left: 32px; right: 32px; height: 2px;
    background: linear-gradient(90deg, #c8490c 0%, #b45309 55%, transparent 100%);
    border-radius: 0 0 2px 2px; z-index: 2;
  }

  /* ── CLOSE BTN ── */
  .qv-close {
    position: absolute; top: 14px; right: 14px; z-index: 10;
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(28,25,23,.08); border: 1px solid rgba(28,25,23,.1);
    color: #6b6560; cursor: pointer; display: flex;
    align-items: center; justify-content: center; font-size: 14px;
    transition: background .12s, color .12s, border-color .12s;
  }
  .qv-close:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }

  /* ── LEFT: IMAGE PANEL ── */
  .qv-img-panel {
    position: relative; overflow: hidden;
    background: linear-gradient(145deg, #f0ece6, #e8e4de);
    min-height: 360px;
    display: flex; flex-direction: column;
  }
  .qv-img-main {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 24px; position: relative; overflow: hidden;
  }
  .qv-img {
    width: 100%; height: 100%; max-height: 340px;
    object-fit: contain;
    transition: transform .5s cubic-bezier(.22,1,.36,1), opacity .3s;
  }
  .qv-img.switching { opacity: 0; transform: scale(.95); }

  /* Sale badge on image */
  .qv-sale-badge {
    position: absolute; top: 14px; left: 14px;
    background: #c8490c; color: #fff;
    font-family: 'Fraunces', serif; font-size: 13px; font-weight: 700;
    padding: 4px 10px; border-radius: 20px;
    box-shadow: 0 4px 12px rgba(200,73,12,.35);
  }

  /* Thumbnail strip */
  .qv-thumbs {
    display: flex; gap: 7px; padding: 12px 16px;
    border-top: 1px solid rgba(226,222,214,.5);
    background: rgba(255,255,255,.6); overflow-x: auto;
    scrollbar-width: none;
  }
  .qv-thumbs::-webkit-scrollbar { display: none; }
  .qv-thumb {
    width: 48px; height: 48px; border-radius: 9px; flex-shrink: 0;
    overflow: hidden; cursor: pointer;
    border: 2px solid transparent;
    background: #fff;
    transition: border-color .14s, transform .14s;
  }
  .qv-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .qv-thumb:hover { transform: scale(1.07); }
  .qv-thumb.act { border-color: #c8490c; box-shadow: 0 0 0 2px rgba(200,73,12,.18); }

  /* ── RIGHT: INFO PANEL ── */
  .qv-info-panel {
    padding: 28px 26px 22px;
    display: flex; flex-direction: column; gap: 0;
    overflow-y: auto;
  }
  .qv-info-panel::-webkit-scrollbar { width: 3px; }
  .qv-info-panel::-webkit-scrollbar-thumb { background: #e8e4de; border-radius: 2px; }

  /* Category */
  .qv-cat {
    display: inline-block; font-size: 10px; font-weight: 600;
    letter-spacing: .11em; text-transform: uppercase;
    color: #c8490c; background: rgba(200,73,12,.07);
    border: 1px solid rgba(200,73,12,.18);
    border-radius: 20px; padding: 3px 10px; margin-bottom: 10px;
  }

  /* Name */
  .qv-name {
    font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700;
    line-height: 1.22; color: #1c1917; margin: 0 0 10px;
    letter-spacing: -.02em;
  }

  /* Meta */
  .qv-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .qv-stock-ok { display: flex; align-items: center; gap: 4px; color: #15803d; font-weight: 600; font-size: 11px; }
  .qv-stock-no { display: flex; align-items: center; gap: 4px; color: #b91c1c; font-weight: 600; font-size: 11px; }
  .qv-sku { color: #a8a29e; font-family: 'DM Mono', monospace; font-size: 10px; }

  /* Price block */
  .qv-price-blk {
    background: linear-gradient(130deg, #1c1917 0%, #292524 100%);
    border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;
    position: relative; overflow: hidden;
  }
  .qv-price-blk::after {
    content: ''; position: absolute; top: -24px; right: -24px;
    width: 64px; height: 64px;
    background: radial-gradient(circle, rgba(200,73,12,.35), transparent 70%);
    border-radius: 50%; pointer-events: none;
  }
  .qv-price-lbl { font-size: 9px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: #78716c; margin-bottom: 2px; }
  .qv-price-val {
    font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700;
    color: #fff; line-height: 1; letter-spacing: -.02em;
  }
  .qv-price-save { font-size: 11px; color: #fb923c; margin-top: 3px; }

  /* Divider */
  .qv-div { height: 1px; background: linear-gradient(90deg, transparent, #e2ded6, transparent); margin: 13px 0; }

  /* Section label */
  .qv-lbl { font-size: 10px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: #78716c; margin-bottom: 8px; }

  /* Variants */
  .qv-vars { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .qv-var {
    font-size: 11px; font-weight: 500; padding: 5px 12px;
    border-radius: 8px; border: 1.5px solid #e2ded6;
    background: transparent; color: #1c1917; cursor: pointer;
    transition: all .14s; font-family: 'DM Sans', sans-serif;
  }
  .qv-var:hover { border-color: #c8490c; color: #c8490c; }
  .qv-var.act { border-color: #c8490c; background: #c8490c; color: #fff; box-shadow: 0 2px 8px rgba(200,73,12,.25); }

  /* Qty row */
  .qv-qty-row { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
  .qv-qty {
    display: flex; align-items: center;
    border: 1.5px solid #e2ded6; border-radius: 10px; overflow: hidden; background: #fafaf9;
  }
  .qv-qbtn {
    width: 34px; height: 40px; background: transparent; border: none;
    color: #78716c; cursor: pointer; font-size: 11px;
    display: flex; align-items: center; justify-content: center; transition: background .12s;
  }
  .qv-qbtn:hover { background: #f5f3ef; color: #1c1917; }
  .qv-qinput {
    width: 38px; text-align: center; border: none;
    border-left: 1px solid #e2ded6; border-right: 1px solid #e2ded6;
    background: transparent; font-family: 'DM Mono', monospace;
    font-size: 13px; font-weight: 500; color: #1c1917; height: 40px; outline: none;
  }

  /* Wish btn */
  .qv-wish {
    width: 40px; height: 40px; border-radius: 10px;
    border: 1.5px solid #e2ded6; background: #fafaf9;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 14px; transition: all .14s; color: #78716c; flex-shrink: 0;
  }
  .qv-wish:hover { border-color: #e11d48; color: #e11d48; background: rgba(225,29,72,.05); }
  .qv-wish.liked { border-color: #e11d48; color: #e11d48; background: rgba(225,29,72,.07); }

  /* Policy strip */
  .qv-policy {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-top: 14px;
  }
  .qv-pol-item {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 8px 4px; border-radius: 10px;
    background: rgba(245,243,239,.9); border: 1px solid #f0ede8; text-align: center;
  }
  .qv-pol-icon { font-size: 13px; color: #c8490c; }
  .qv-pol-txt { font-size: 9px; font-weight: 500; color: #78716c; line-height: 1.4; }

  /* View detail link */
  .qv-detail-link {
    display: inline-flex; align-items: center; gap: 6px; margin-top: 14px;
    font-size: 11px; font-weight: 600; color: #6b6560;
    text-decoration: none; letter-spacing: .03em;
    transition: color .12s;
  }
  .qv-detail-link:hover { color: #c8490c; }

  /* Responsive */
  @media (max-width: 640px) {
    .qv-card { grid-template-columns: 1fr; max-height: 95vh; }
    .qv-img-panel { min-height: 220px; }
    .qv-overlay { padding: 10px; align-items: flex-end; }
    .qv-card { border-radius: 20px 20px 0 0; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const QuickViewModal = ({ show, handleClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgSwitching, setImgSwitching] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = product ? isInWishlist(product._id) : false;

  // Reset khi product thay đổi
  useEffect(() => {
    if (!product) return;
    setQuantity(1);
    setCurrentImageIndex(0);
    setSelectedVariant(product.variants?.[0] || null);
  }, [product?._id]);

  // Lock scroll khi mở
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // ESC để đóng
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const images = useMemo(() => {
    if (!product) return ["https://placehold.co/600x600?text=No+Image"];
    if (
      !product.images ||
      !Array.isArray(product.images) ||
      product.images.length === 0
    ) {
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

  const switchImage = (idx) => {
    if (idx === currentImageIndex) return;
    setImgSwitching(true);
    setTimeout(() => {
      setCurrentImageIndex(idx);
      setImgSwitching(false);
    }, 180);
  };

  if (!show || !product) return null;

  const currentPrice = selectedVariant
    ? selectedVariant.price_cents
    : product.price_cents;
  const currentStock = selectedVariant ? selectedVariant.stock : 100;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const salePercent = product.salePrice
    ? Math.round(
        ((product.price_cents - product.salePrice) / product.price_cents) * 100,
      )
    : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="qv-overlay" onClick={handleClose}>
        {/* Full-bleed background = current product image */}
        <div
          className="qv-bg"
          style={{ backgroundImage: `url(${currentImage})` }}
        />
        <div className="qv-bg-overlay" />
        <div className="qv-bg-grain" />

        {/* Modal card — stop propagation */}
        <div className="qv-card" onClick={(e) => e.stopPropagation()}>
          {/* Close */}
          <button className="qv-close" onClick={handleClose}>
            <FaTimes />
          </button>

          {/* ── LEFT: IMAGE ── */}
          <div className="qv-img-panel">
            <div className="qv-img-main">
              {salePercent && (
                <div className="qv-sale-badge">-{salePercent}%</div>
              )}
              <img
                src={currentImage}
                alt={product.name}
                className={`qv-img${imgSwitching ? " switching" : ""}`}
              />
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
            {/* Category */}
            <div className="qv-cat">
              {product.categoryId?.name || "Sản phẩm"}
            </div>

            {/* Name */}
            <h2 className="qv-name">{product.name}</h2>

            {/* Stock + SKU */}
            <div className="qv-meta">
              {currentStock > 0 ? (
                <span className="qv-stock-ok">
                  <FaCheckCircle size={9} /> Còn hàng
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
              <div className="qv-price-lbl">Giá bán</div>
              <div className="qv-price-val">
                {currentPrice?.toLocaleString("vi-VN")} đ
              </div>
              {product.salePrice && (
                <div className="qv-price-save">
                  Tiết kiệm{" "}
                  {(product.price_cents - product.salePrice).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  đ
                </div>
              )}
            </div>

            <div className="qv-div" />

            {/* Variants */}
            {product.variants?.length > 0 && (
              <>
                <div className="qv-lbl">Phân loại</div>
                <div className="qv-vars">
                  {product.variants.map((v) => (
                    <button
                      key={v._id}
                      className={`qv-var${selectedVariant?._id === v._id ? " act" : ""}`}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Qty + Cart + Wish */}
            <div className="qv-lbl">Số lượng</div>
            <div className="qv-qty-row">
              <div className="qv-qty">
                <button
                  className="qv-qbtn"
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
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
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <FaPlus size={9} />
                </button>
              </div>

              <AddToCartBtn
                productId={product._id}
                quantity={quantity}
                disabled={currentStock <= 0}
                style={{
                  flex: 1,
                  height: 40,
                  background:
                    currentStock <= 0
                      ? "#e2ded6"
                      : "linear-gradient(135deg,#c8490c,#b45309)",
                  border: "none",
                  borderRadius: 10,
                  color: currentStock <= 0 ? "#a09890" : "#fff",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: ".04em",
                  cursor: currentStock <= 0 ? "not-allowed" : "pointer",
                  boxShadow:
                    currentStock <= 0
                      ? "none"
                      : "0 4px 14px rgba(200,73,12,.26)",
                  transition: "all .2s",
                }}
              >
                {currentStock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
              </AddToCartBtn>

              <button
                className={`qv-wish${isLiked ? " liked" : ""}`}
                onClick={() => toggleWishlist(product)}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <div className="qv-div" />

            {/* Policy */}
            <div className="qv-policy">
              <div className="qv-pol-item">
                <FaTruck className="qv-pol-icon" />
                <span className="qv-pol-txt">Free Ship từ 300k</span>
              </div>
              <div className="qv-pol-item">
                <FaShieldAlt className="qv-pol-icon" />
                <span className="qv-pol-txt">Chính hãng 100%</span>
              </div>
              <div className="qv-pol-item">
                <FaUndo className="qv-pol-icon" />
                <span className="qv-pol-txt">Đổi trả 7 ngày</span>
              </div>
            </div>

            {/* Link to full detail page */}
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
