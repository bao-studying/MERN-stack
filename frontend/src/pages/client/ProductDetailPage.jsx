import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Tabs,
  Tab,
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

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States tương tác
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Gallery states (nâng cấp)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHoveringGallery, setIsHoveringGallery] = useState(false);

  // Quick View
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] =
    useState(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = product ? isInWishlist(product._id) : false;

  // ================== EXTRACT IMAGES (giữ nguyên logic nâng cấp) ==================
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

  // Auto chuyển ảnh khi hover gallery (giống ProductCard)
  useEffect(() => {
    if (!isHoveringGallery || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [isHoveringGallery, images]);

  // Fetch data
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await productApi.getBySlug(slug);
        const productData = response.data;
        setProduct(productData);

        if (productData.variants?.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }

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

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleQuickView = (prod) => {
    setSelectedQuickViewProduct(prod);
    setShowQuickView(true);
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
      </div>
    );
  if (error || !product)
    return (
      <Container className="py-5 text-center">
        <h3>{error}</h3>
      </Container>
    );

  const currentPrice = selectedVariant
    ? selectedVariant.price_cents
    : product.price_cents;
  const currentStock = selectedVariant ? selectedVariant.stock : 100;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

  return (
    <div className="bg-dark text-white pb-5" style={{ minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div className="bg-light py-3">
        <Container>
          <Breadcrumb className="m-0 small">
            <Breadcrumb.Item linkAs={Link} to="/">
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} to="/products">
              Sản phẩm
            </Breadcrumb.Item>
            <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
          </Breadcrumb>
        </Container>
      </div>

      <Container className="pt-4">
        <Row className="g-5">
          {/* ================== GALLERY PHÍA TRÁI - LUXURY ================== */}
          <Col lg={7}>
            <div
              className="product-gallery position-relative rounded-4 overflow-hidden shadow-lg"
              style={{ height: "520px", background: "#111" }}
              onMouseEnter={() => setIsHoveringGallery(true)}
              onMouseLeave={() => {
                setIsHoveringGallery(false);
                setCurrentImageIndex(0); // reset về ảnh đầu
              }}
            >
              <img
                src={currentImage}
                alt={product.name}
                className="w-100 h-100 object-fit-contain p-4 transition-all"
                style={{ transition: "transform 0.6s ease" }}
              />

              {/* Sale badge */}
              {product.salePrice && (
                <Badge
                  bg="danger"
                  className="position-absolute top-4 start-4 px-4 py-2 fs-5 rounded-pill"
                >
                  -
                  {Math.round(
                    ((product.price_cents - product.salePrice) /
                      product.price_cents) *
                      100,
                  )}
                  %
                </Badge>
              )}

              {/* Indicator */}
              {images.length > 1 && (
                <div className="position-absolute bottom-4 end-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-pill small">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* THUMBNAILS - Ô LỰA CHỌN ẢNH */}
            {images.length > 1 && (
              <div className="d-flex gap-3 mt-4 justify-content-center flex-wrap">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumbnail cursor-pointer rounded-3 overflow-hidden border-3 shadow-sm ${idx === currentImageIndex ? "border-gold active" : "border-transparent"}`}
                    style={{ width: 90, height: 90 }}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </Col>

          {/* ================== THÔNG TIN SẢN PHẨM BÊN PHẢI ================== */}
          <Col lg={5}>
            <Badge bg="success" className="mb-3">
              {product.categoryId?.name || "Sản phẩm"}
            </Badge>
            <h1 className="fw-bold display-5 mb-3 text-gold">{product.name}</h1>

            <div className="d-flex gap-3 mb-4 align-items-center">
              {currentStock > 0 ? (
                <span className="text-success fw-bold">
                  <FaCheckCircle /> Còn hàng
                </span>
              ) : (
                <span className="text-danger fw-bold">
                  <FaBoxOpen /> Hết hàng
                </span>
              )}
              <span className="text-muted">SKU: {currentSku}</span>
            </div>

            <div className="fs-1 fw-bold text-success mb-4">
              {currentPrice?.toLocaleString()} đ
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-4">
                <label className="fw-bold mb-2">Phân loại</label>
                <div className="d-flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Button
                      key={v._id}
                      variant={
                        selectedVariant?._id === v._id
                          ? "success"
                          : "outline-light"
                      }
                      className="rounded-pill px-4"
                      onClick={() => handleVariantChange(v)}
                    >
                      {v.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart + Wishlist */}
            <div className="d-flex gap-3 align-items-center mb-5">
              <div
                className="input-group border border-gold rounded-pill"
                style={{ width: 160 }}
              >
                <Button
                  variant="link"
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                >
                  <FaMinus />
                </Button>
                <input
                  type="text"
                  className="form-control text-center bg-transparent text-white fw-bold"
                  value={quantity}
                  readOnly
                />
                <Button
                  variant="link"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <FaPlus />
                </Button>
              </div>

              <AddToCartBtn
                productId={product._id}
                quantity={quantity}
                className="flex-grow-1 rounded-pill fw-bold py-3 shadow-gold"
                variant="success"
                size="lg"
                disabled={currentStock <= 0}
              >
                Thêm vào giỏ hàng
              </AddToCartBtn>

              <Button
                variant={isLiked ? "danger" : "outline-light"}
                className="rounded-circle p-3 border-2"
                onClick={() => toggleWishlist(product)}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
              </Button>
            </div>

            {/* Policy */}
            <div className="d-flex justify-content-between text-center small">
              <div>
                <FaTruck className="text-gold mb-1 d-block fs-3" /> Free Ship từ
                300k
              </div>
              <div>
                <FaShieldAlt className="text-gold mb-1 d-block fs-3" /> Chính
                hãng 100%
              </div>
              <div>
                <FaUndo className="text-gold mb-1 d-block fs-3" /> Đổi trả 7
                ngày
              </div>
            </div>
          </Col>
        </Row>

        {/* TABS & RELATED PRODUCTS (giữ nguyên) */}
        {/* ... (Tabs + Related Products giữ nguyên như code cũ của bạn) ... */}

        {relatedProducts.length > 0 && (
          <div className="mt-5">
            <h3 className="text-center fw-bold text-gold mb-4">
              Sản phẩm tương tự
            </h3>
            <Row xs={2} md={4} className="g-4">
              {relatedProducts.map((p) => (
                <Col key={p.id}>
                  <ProductCard product={p} onQuickView={handleQuickView} />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>

      <QuickViewModal
        show={showQuickView}
        handleClose={() => setShowQuickView(false)}
        product={selectedQuickViewProduct}
      />
    </div>
  );
};

export default ProductDetailPage;
