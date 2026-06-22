import React, { useState, useEffect, useMemo } from "react";
import { Card, Badge } from "react-bootstrap";
import {
  FaRegHeart,
  FaEye,
  FaShoppingCart,
  FaBolt,
  FaHeart,
  FaLayerGroup,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../assets/styles/products.css";
import { useWishlist } from "../../hooks/useWishlist";

/*
  Thay đổi chính:
  - Nút "Thêm vào giỏ" giờ mở QuickViewModal thay vì add trực tiếp.
    Lý do: sản phẩm có biến thể → user cần chọn biến thể trước.
  - Hiển thị badge số biến thể nếu > 1.
  - Giữ nguyên 100% logic hover ảnh, wishlist.
*/
const ProductCard = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product._id || product.id);

  const [currentImage, setCurrentImage] = useState(
    product.images?.[0]?.imageUrl || product.image || "",
  );
  const [isHovering, setIsHovering] = useState(false);

  const images = useMemo(() => {
    if (
      !product.images ||
      !Array.isArray(product.images) ||
      product.images.length === 0
    ) {
      return [product.image].filter(Boolean);
    }
    return product.images
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return (
            item.url ||
            item.imageUrl ||
            item.secure_url ||
            item.src ||
            item.path ||
            item.original ||
            null
          );
        }
        return null;
      })
      .filter(Boolean);
  }, [product.images, product.image]);

  useEffect(() => {
    if (!isHovering || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => {
        const idx = images.indexOf(prev);
        return images[(idx + 1) % images.length] || images[0];
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isHovering, images]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  // Mở QuickView để user chọn biến thể trước khi add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const variantCount = product.variants?.length || 0;

  return (
    <Card className="h-100 border-0 luxury-product-card overflow-hidden">
      {/* IMAGE CONTAINER */}
      <div
        className="product-img-container position-relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setCurrentImage(product.images?.[0]?.imageUrl || product.image || "");
        }}
      >
        {/* Sale Badge */}
        {product.salePrice && (
          <Badge
            bg="danger"
            className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-lg"
            style={{ zIndex: 3, fontSize: "0.85rem", letterSpacing: "0.5px" }}
          >
            -
            {Math.round(
              ((product.price - product.salePrice) / product.price) * 100,
            )}
            %
          </Badge>
        )}

        {/* Variant count badge */}
        {variantCount > 1 && (
          <div
            className="position-absolute top-0 start-0 m-3"
            style={{
              zIndex: 4,
              marginTop: product.salePrice ? "50px" : undefined,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,.9)",
                background: "rgba(0,0,0,.45)",
                backdropFilter: "blur(8px)",
                borderRadius: 20,
                padding: "2px 8px",
                border: "1px solid rgba(255,255,255,.15)",
              }}
            >
              <FaLayerGroup size={8} />
              {variantCount} loại
            </span>
          </div>
        )}

        {/* Main image */}
        <img
          src={currentImage || "/images/placeholder.jpg"}
          alt={product.name}
          className="img-fluid w-100 h-100 object-fit-cover luxury-img"
          style={{ transition: "transform 0.6s ease, opacity 0.4s ease" }}
          onError={(e) => {
            e.target.src = "/images/placeholder.jpg";
          }}
        />

        {/* Overlay actions */}
        <div className="card-actions-overlay luxury-overlay">
          <Link
            to={`/product/${product.slug}`}
            className="action-btn luxury-btn"
          >
            <FaEye /> Chi tiết
          </Link>
          <button
            className="action-btn luxury-btn"
            onClick={(e) => {
              e.preventDefault();
              onQuickView ? onQuickView(product) : null;
            }}
          >
            <FaBolt /> Xem nhanh
          </button>
        </div>

        {/* Wishlist */}
        <button
          className="position-absolute top-0 end-0 m-3 wishlist-btn"
          style={{ zIndex: 5 }}
          onClick={handleWishlistClick}
        >
          {isLiked ? (
            <FaHeart size={22} className="text-danger" />
          ) : (
            <FaRegHeart size={22} className="text-white" />
          )}
        </button>

        {/* Image counter */}
        {images.length > 1 && isHovering && (
          <div className="position-absolute bottom-0 end-0 m-3 px-3 py-1 bg-black bg-opacity-75 text-white rounded-pill small">
            {images.indexOf(currentImage) + 1} / {images.length}
          </div>
        )}
      </div>

      {/* INFO SECTION */}
      <Card.Body className="p-4 d-flex flex-column">
        {/* Category */}
        <div className="text-gold small fw-bold text-uppercase mb-2 tracking-widest">
          {typeof product.categoryId === "object" && product.categoryId?.name
            ? product.categoryId.name
            : "Sản phẩm"}
        </div>

        {/* Tên sản phẩm */}
        <Card.Title className="fs-5 fw-bold mb-3">
          <Link
            to={`/product/${product.slug}`}
            className="text-white text-decoration-none luxury-name"
          >
            {product.name}
          </Link>
        </Card.Title>

        {/* Giá */}
        <div className="mt-auto d-flex align-items-baseline gap-2 mb-3">
          <span className="fw-bold fs-4 text-aler">
            {product.salePrice
              ? product.salePrice.toLocaleString()
              : (
                  product.price_cents ||
                  product.price ||
                  0
                ).toLocaleString()}{" "}
            đ
          </span>
          {product.salePrice && (
            <span className="text-muted text-decoration-line-through fs-6">
              {(product.price || 0).toLocaleString()} đ
            </span>
          )}
        </div>

        {/*
          Nút "Thêm vào giỏ" → mở QuickViewModal để user chọn biến thể
          (không add trực tiếp vì cần chọn variant trước)
        */}
        <button
          className="w-100 rounded-pill fw-bold luxury-add-btn d-flex align-items-center justify-content-center gap-2"
          style={{
            padding: "10px 0",
            fontSize: 13,
            letterSpacing: ".04em",
            border: "1.5px solid rgba(255,255,255,.35)",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
            transition: "all .2s",
          }}
          onClick={handleAddToCart}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,.12)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(255,255,255,.35)";
          }}
        >
          <FaShoppingCart size={13} />
          {variantCount > 1 ? "Chọn sản phẩm" : "Thêm vào giỏ"}
        </button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
