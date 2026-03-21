import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Breadcrumb,
  Spinner,
} from "react-bootstrap";
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
} from "react-icons/fa";
import ProductCard from "../../components/product/ProductCard";
import QuickViewModal from "../../components/product/QuickViewModal";
import productApi from "../../services/product.service";
import "../../assets/styles/products.css";
import AddToCartBtn from "../../components/cart/AddToCartBtn";
import { useWishlist } from "../../hooks/useWishlist";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .pdp5-root {
    position: relative;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    color: #1c1917;
    overflow-x: hidden;
  }

  /* ── FULL-BLEED BG ── */
  .pdp5-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
  }
  .pdp5-bg-img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: left center;
/* hoặc tinh chỉnh hơn: */
background-position: 20% center;;
    background-repeat: no-repeat;
    transition: background-image 0.7s ease;
  }
  .pdp5-bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
  105deg,
  rgba(10,8,5,.05) 0%,    /* ← số này: độ tối phía trái */
  rgba(10,8,5,.15) 35%,
  rgba(10,8,5,.55) 62%,   /* ← phía phải vẫn nên giữ tối để chữ đọc được */
  rgba(10,8,5,.75) 100%
);
  }
  .pdp5-bg-grain {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px 180px;
    pointer-events: none;
  }

  /* ── PAGE SHELL ── */
  .pdp5-page {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── BREADCRUMB ── */
  .pdp5-crumb-bar {
    padding: 13px 0;
    border-bottom: 1px solid rgba(28,25,23,0.07);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: rgba(245,243,239,0.52);
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .pdp5-crumb-bar .breadcrumb { margin: 0; font-size: 12px; letter-spacing: .02em; }
  .pdp5-crumb-bar .breadcrumb-item a { color: #78716c; text-decoration: none; transition: color .12s; }
  .pdp5-crumb-bar .breadcrumb-item a:hover { color: #c8490c; }
  .pdp5-crumb-bar .breadcrumb-item.active { color: #1c1917; font-weight: 500; }
  .pdp5-crumb-bar .breadcrumb-item + .breadcrumb-item::before { color: #a8a29e; }

  /* ── MAIN ZONE ── */
  .pdp5-main {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 44px 64px 44px 40px;
    min-height: calc(100vh - 53px);
    box-sizing: border-box;
  }

  /* ── FLOATING CARD ── */
  .pdp5-card {
    width: 430px;
    flex-shrink: 0;
    background: rgba(255,255,255,0.86);
    backdrop-filter: blur(32px) saturate(1.7);
    -webkit-backdrop-filter: blur(32px) saturate(1.7);
    border: 1px solid rgba(226,222,214,0.65);
    border-radius: 22px;
    box-shadow:
      0 2px 4px rgba(28,25,23,0.02),
      0 12px 32px rgba(28,25,23,0.09),
      0 40px 90px rgba(28,25,23,0.13),
      inset 0 1px 0 rgba(255,255,255,0.92);
    padding: 30px 28px 26px;
    position: sticky;
    top: 76px;
    align-self: flex-start;
    animation: pdp5-in 0.55s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes pdp5-in {
    from { opacity: 0; transform: translateX(28px) translateY(8px); }
    to   { opacity: 1; transform: none; }
  }
  .pdp5-card::before {
    content: '';
    position: absolute;
    top: 0; left: 28px; right: 28px;
    height: 2px;
    background: linear-gradient(90deg, #c8490c 0%, #b45309 60%, transparent 100%);
    border-radius: 0 0 2px 2px;
  }

  /* ── CAT BADGE ── */
  .pdp5-cat {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .11em;
    text-transform: uppercase;
    color: #c8490c;
    background: rgba(200,73,12,.07);
    border: 1px solid rgba(200,73,12,.18);
    border-radius: 20px;
    padding: 3px 10px;
    margin-bottom: 11px;
  }

  /* ── NAME ── */
  .pdp5-name {
    font-family: 'Fraunces', serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.22;
    color: #1c1917;
    margin-bottom: 12px;
    letter-spacing: -.02em;
  }

  /* ── META ── */
  .pdp5-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .pdp5-stock-ok { display: flex; align-items: center; gap: 5px; color: #15803d; font-weight: 600; font-size: 12px; }
  .pdp5-stock-no { display: flex; align-items: center; gap: 5px; color: #b91c1c; font-weight: 600; font-size: 12px; }
  .pdp5-sku { color: #a8a29e; font-family: 'DM Mono', monospace; font-size: 11px; }

  /* ── PRICE BLOCK ── */
  .pdp5-price-blk {
    background: linear-gradient(130deg, #1c1917 0%, #292524 100%);
    border-radius: 14px;
    padding: 15px 18px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }
  .pdp5-price-blk::after {
    content: '';
    position: absolute;
    top: -28px; right: -28px;
    width: 80px; height: 80px;
    background: radial-gradient(circle, rgba(200,73,12,.3), transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  .pdp5-price-lbl { font-size: 10px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: #78716c; margin-bottom: 3px; }
  .pdp5-price-val {
    font-family: 'Fraunces', serif;
    font-size: 30px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    letter-spacing: -.02em;
  }
  .pdp5-price-save { font-size: 12px; color: #fb923c; margin-top: 4px; }

  /* ── DIVIDER ── */
  .pdp5-div {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2ded6, transparent);
    margin: 16px 0;
  }

  /* ── SECTION LABEL ── */
  .pdp5-lbl { font-size: 10px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: #78716c; margin-bottom: 9px; }

  /* ── VARIANTS ── */
  .pdp5-vars { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 16px; }
  .pdp5-var {
    font-size: 12px; font-weight: 500; padding: 6px 13px;
    border-radius: 8px; border: 1.5px solid #e2ded6;
    background: transparent; color: #1c1917; cursor: pointer;
    transition: all .15s; font-family: 'DM Sans', sans-serif;
  }
  .pdp5-var:hover { border-color: #c8490c; color: #c8490c; }
  .pdp5-var.act { border-color: #c8490c; background: #c8490c; color: #fff; box-shadow: 0 2px 8px rgba(200,73,12,.28); }

  /* ── QTY ROW ── */
  .pdp5-qty-row { display: flex; gap: 9px; align-items: center; margin-bottom: 12px; }
  .pdp5-qty {
    display: flex; align-items: center;
    border: 1.5px solid #e2ded6; border-radius: 10px;
    overflow: hidden; background: #fafaf9;
  }
  .pdp5-qbtn {
    width: 36px; height: 42px; background: transparent; border: none;
    color: #78716c; cursor: pointer; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    transition: background .12s;
  }
  .pdp5-qbtn:hover { background: #f5f3ef; color: #1c1917; }
  .pdp5-qinput {
    width: 42px; text-align: center; border: none;
    border-left: 1px solid #e2ded6; border-right: 1px solid #e2ded6;
    background: transparent; font-family: 'DM Mono', monospace;
    font-size: 14px; font-weight: 500; color: #1c1917;
    height: 42px; outline: none;
  }
    

  /* ── WISH BTN ── */
  .pdp5-wish {
    width: 42px; height: 42px; border-radius: 10px;
    border: 1.5px solid #e2ded6; background: #fafaf9;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: all .15s; color: #78716c; flex-shrink: 0;
  }
  .pdp5-wish:hover { border-color: #e11d48; color: #e11d48; background: rgba(225,29,72,.05); }
  .pdp5-wish.liked { border-color: #e11d48; color: #e11d48; background: rgba(225,29,72,.08); }

  /* ── POLICY ── */
  .pdp5-policy { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; margin-top: 16px; }
  .pdp5-pol-item {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 9px 5px; border-radius: 10px;
    background: rgba(245,243,239,.85); border: 1px solid #f0ede8; text-align: center;
  }
  .pdp5-pol-icon { font-size: 15px; color: #c8490c; }
  .pdp5-pol-txt { font-size: 10px; font-weight: 500; color: #78716c; line-height: 1.4; }

  /* ── THUMBNAILS ── */
  .pdp5-thumbs { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; }
  .pdp5-thumb {
    width: 56px; height: 56px; border-radius: 9px; overflow: hidden;
    cursor: pointer; border: 2px solid transparent;
    background: rgba(255,255,255,.7); backdrop-filter: blur(8px);
    transition: all .15s; box-shadow: 0 2px 8px rgba(28,25,23,.08);
  }
  .pdp5-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .2s; }
  .pdp5-thumb:hover img { transform: scale(1.09); }
  .pdp5-thumb.act { border-color: #c8490c; box-shadow: 0 0 0 2px rgba(200,73,12,.2); }
  .pdp5-img-counter { font-size: 10px; color: #a8a29e; text-align: center; margin-top: 5px; font-family: 'DM Mono', monospace; }

  /* ── FLOATING SALE BADGE ── */
  .pdp5-sale-badge {
    position: fixed; top: 98px; left: 48px; z-index: 10;
    background: #c8490c; color: #fff;
    font-family: 'Fraunces', serif; font-size: 18px; font-weight: 700;
    width: 68px; height: 68px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(200,73,12,.4);
    animation: pdp5-pulse 2.5s ease-in-out infinite;
  }
  @keyframes pdp5-pulse {
    0%,100% { transform: scale(1); box-shadow: 0 8px 24px rgba(200,73,12,.4); }
    50%      { transform: scale(1.06); box-shadow: 0 12px 32px rgba(200,73,12,.55); }
  }

  /* ── BELOW FOLD ── */
  .pdp5-below {
    position: relative; z-index: 1;
    background: #f5f3ef; padding: 56px 0 40px;
    border-top: 1px solid #e2ded6;
  }
  .pdp5-rel-title {
    font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700;
    color: #1c1917; text-align: center; margin-bottom: 30px; letter-spacing: -.02em;
  }
  .pdp5-rel-title em { color: #c8490c; font-style: italic; }

  /* ── LOADING ── */
  .pdp5-loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f3ef; }

  /* ── RESPONSIVE ── */
  @media (max-width: 991px) {
    .pdp5-main {
      flex-direction: column; align-items: stretch; padding: 24px 18px 32px;
      justify-content: flex-start; min-height: auto;
    }
    .pdp5-card { width: 100%; position: relative; top: auto; }
    .pdp5-bg-overlay {
      background: linear-gradient(to bottom, rgba(245,243,239,.08) 0%, rgba(245,243,239,.94) 45%, rgba(245,243,239,.99) 100%);
    }
    .pdp5-sale-badge { display: none; }
  }
`;

/* ── COMPONENT ── */
const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States tương tác (GIỮ NGUYÊN)
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Gallery states (GIỮ NGUYÊN)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHoveringGallery, setIsHoveringGallery] = useState(false);

  // Quick View (GIỮ NGUYÊN)
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] =
    useState(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = product ? isInWishlist(product._id) : false;

  // EXTRACT IMAGES (GIỮ NGUYÊN)
  const images = useMemo(() => {
    if (
      !product?.images ||
      !Array.isArray(product.images) ||
      product.images.length === 0
    ) {
      return [product?.image || "https://placehold.co/800x800?text=No+Image"];
    }
    return product.images
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.imageUrl || item?.url || item?.src || null;
      })
      .filter(Boolean);
  }, [product]);

  const currentImage = images[currentImageIndex] || images[0];

  // Auto chuyển ảnh khi hover (GIỮ NGUYÊN)
  useEffect(() => {
    if (!isHoveringGallery || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isHoveringGallery, images]);

  // Fetch data (GIỮ NGUYÊN)
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await productApi.getBySlug(slug);
        const productData = response.data;
        setProduct(productData);
        if (productData.variants?.length > 0)
          setSelectedVariant(productData.variants[0]);
        const catId =
          typeof productData.categoryId === "object"
            ? productData.categoryId._id
            : productData.categoryId;
        if (catId) {
          const relatedRes = await productApi.getRelated(
            catId,
            productData._id,
          );
          const mapped = (relatedRes.data || []).map((item) => ({
            ...item,
            id: item._id,
            price: item.price_cents,
            salePrice: item.compareAtPriceCents || null,
            image: item.images?.[0]?.imageUrl || "https://placehold.co/300x300",
          }));
          setRelatedProducts(mapped);
        }
      } catch (err) {
        setError("Không tìm thấy sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [slug]);

  // Handlers (GIỮ NGUYÊN)
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };
  const handleQuickView = (prod) => {
    setSelectedQuickViewProduct(prod);
    setShowQuickView(true);
  };

  // Loading / Error (GIỮ NGUYÊN logic)
  if (loading)
    return (
      <div className="pdp5-loading">
        <style>{STYLES}</style>
        <Spinner animation="border" style={{ color: "#c8490c" }} />
      </div>
    );
  if (error || !product)
    return (
      <Container className="py-5 text-center">
        <style>{STYLES}</style>
        <h3>{error}</h3>
      </Container>
    );

  // Computed (GIỮ NGUYÊN)
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
    <div className="pdp5-root">
      <style>{STYLES}</style>

      {/* ── FULL-BLEED BACKGROUND ── */}
      <div
        className="pdp5-bg"
        onMouseEnter={() => setIsHoveringGallery(true)}
        onMouseLeave={() => {
          setIsHoveringGallery(false);
          setCurrentImageIndex(0);
        }}
      >
        <div
          className="pdp5-bg-img"
          style={{ backgroundImage: `url(${currentImage})` }}
        />
        <div className="pdp5-bg-overlay" />
        <div className="pdp5-bg-grain" />
      </div>

      {/* ── SALE BADGE ── */}
      {salePercent && <div className="pdp5-sale-badge">-{salePercent}%</div>}

      {/* ── PAGE CONTENT ── */}
      <div className="pdp5-page">
        {/* BREADCRUMB */}
        <div className="pdp5-crumb-bar">
          <Container>
            <Breadcrumb className="m-0 small">
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                Trang chủ
              </Breadcrumb.Item>
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products" }}>
                Sản phẩm
              </Breadcrumb.Item>
              <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
            </Breadcrumb>
          </Container>
        </div>

        {/* MAIN — floating card */}
        <div className="pdp5-main">
          <div className="pdp5-card">
            {/* Category */}
            <div className="pdp5-cat">
              {product.categoryId?.name || "Sản phẩm"}
            </div>

            {/* Name */}
            <h1 className="pdp5-name">{product.name}</h1>

            {/* Stock + SKU */}
            <div className="pdp5-meta">
              {currentStock > 0 ? (
                <span className="pdp5-stock-ok">
                  <FaCheckCircle size={10} /> Còn hàng
                </span>
              ) : (
                <span className="pdp5-stock-no">
                  <FaBoxOpen size={10} /> Hết hàng
                </span>
              )}
              <span className="pdp5-sku">SKU: {currentSku}</span>
            </div>

            {/* Price */}
            <div className="pdp5-price-blk">
              <div className="pdp5-price-lbl">Giá bán</div>
              <div className="pdp5-price-val">
                {currentPrice?.toLocaleString("vi-VN")} đ
              </div>
              {product.salePrice && (
                <div className="pdp5-price-save">
                  Tiết kiệm{" "}
                  {(product.price_cents - product.salePrice).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  đ
                </div>
              )}
            </div>

            <div className="pdp5-div" />

            {/* Qty + Cart + Wish */}
            <div className="pdp5-lbl">Số lượng</div>
            <div className="pdp5-qty-row">
              <div className="pdp5-qty">
                <button
                  className="pdp5-qbtn"
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                >
                  <FaMinus size={9} />
                </button>
                <input
                  type="text"
                  className="pdp5-qinput"
                  value={quantity}
                  readOnly
                />
                <button
                  className="pdp5-qbtn"
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
                  height: 42,
                  background: "linear-gradient(135deg,#c8490c,#b45309)",
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: ".04em",
                  cursor: currentStock <= 0 ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(200,73,12,.28)",
                  opacity: currentStock <= 0 ? 0.4 : 1,
                  transition: "all .2s",
                }}
              >
                Thêm vào giỏ
              </AddToCartBtn>

              <button
                className={`pdp5-wish ${isLiked ? "liked" : ""}`}
                onClick={() => toggleWishlist(product)}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <div className="pdp5-div" />

            {/* Policy */}
            <div className="pdp5-policy">
              <div className="pdp5-pol-item">
                <FaTruck className="pdp5-pol-icon" />
                <span className="pdp5-pol-txt">Free Ship từ 300k</span>
              </div>
              <div className="pdp5-pol-item">
                <FaShieldAlt className="pdp5-pol-icon" />
                <span className="pdp5-pol-txt">Chính hãng 100%</span>
              </div>
              <div className="pdp5-pol-item">
                <FaUndo className="pdp5-pol-icon" />
                <span className="pdp5-pol-txt">Đổi trả 7 ngày</span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <>
                <div className="pdp5-div" />
                <div className="pdp5-lbl">Xem thêm ảnh</div>
                <div className="pdp5-thumbs">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`pdp5-thumb ${idx === currentImageIndex ? "act" : ""}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
                <div className="pdp5-img-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>

        {/* BELOW FOLD */}
        <div className="pdp5-below">
          <Container>
            {relatedProducts.length > 0 && (
              <>
                <h3 className="pdp5-rel-title">
                  Sản phẩm <em>tương tự</em>
                </h3>
                <Row xs={2} md={4} className="g-4">
                  {relatedProducts.map((p) => (
                    <Col key={p.id}>
                      <ProductCard product={p} onQuickView={handleQuickView} />
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Container>
        </div>
      </div>

      <QuickViewModal
        show={showQuickView}
        handleClose={() => setShowQuickView(false)}
        product={selectedQuickViewProduct}
      />
    </div>
  );
};

export default ProductDetailPage;
