import React, { useState, useEffect, useMemo } from "react";
import { Card, Badge } from "react-bootstrap";
import { FaRegHeart, FaEye, FaBolt, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../assets/styles/products.css";
import AddToCartBtn from "../cart/AddToCartBtn";
import { useWishlist } from "../../hooks/useWishlist";

const ProductCard = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product._id || product.id);

  const [currentImage, setCurrentImage] = useState(product.image || "");
  const [isHovering, setIsHovering] = useState(false);

  // === LOGIC GIỮ NGUYÊN HOÀN TOÀN ===
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
        const currentIndex = images.indexOf(prev);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex] || images[0];
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isHovering, images]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  // ================== BỐ CỤC MỚI - LUXURY TCG ==================
  return (
    <Card className="h-100 border-0 luxury-product-card overflow-hidden">
      {/* IMAGE CONTAINER - chiếm phần lớn, sang trọng hơn */}
      <div
        className="product-img-container position-relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setCurrentImage(product.image || "");
        }}
      >
        {/* Sale Badge - thiết kế mới */}
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

        {/* Ảnh chính */}
        <img
          src={currentImage || product.image || "/images/placeholder.jpg"}
          alt={product.name}
          className="img-fluid w-100 h-100 object-fit-cover luxury-img"
          style={{ transition: "transform 0.6s ease, opacity 0.4s ease" }}
          onError={(e) => {
            e.target.src = "/images/placeholder.jpg";
          }}
        />

        {/* Overlay mới - kính mờ + nút tinh tế */}
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
              onQuickView
                ? onQuickView(product)
                : alert("Tính năng xem nhanh đang phát triển!");
            }}
          >
            <FaBolt /> Xem nhanh
          </button>
        </div>

        {/* Wishlist - thiết kế mới (vòng vàng + scale) */}
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

        {/* Số ảnh (giữ nguyên) */}
        {images.length > 1 && isHovering && (
          <div className="position-absolute bottom-0 end-0 m-3 px-3 py-1 bg-black bg-opacity-75 text-white rounded-pill small">
            {images.indexOf(currentImage) + 1} / {images.length}
          </div>
        )}
      </div>

      {/* INFO SECTION - bố cục mới gọn gàng, premium */}
      <Card.Body className="p-4 d-flex flex-column">
        {/* Category - badge vàng sang trọng */}
        <div className="text-gold small fw-bold text-uppercase mb-2 tracking-widest">
          {typeof product.categoryId === "object" && product.categoryId?.name
            ? product.categoryId.name
            : "Sản phẩm"}
        </div>

        {/* Tên sản phẩm - hover gold */}
        <Card.Title className="fs-5 fw-bold mb-3">
          <Link
            to={`/product/${product.slug}`}
            className="text-white text-decoration-none luxury-name"
          >
            {product.name}
          </Link>
        </Card.Title>

        {/* Giá - thiết kế mới */}
        <div className="mt-auto d-flex align-items-baseline gap-2 mb-3">
          <span className="fw-bold fs-4 text-aler">
            {product.salePrice
              ? product.salePrice.toLocaleString()
              : product.price.toLocaleString()}{" "}
            đ
          </span>
          {product.salePrice && (
            <span className="text-muted text-decoration-line-through fs-6">
              {product.price.toLocaleString()} đ
            </span>
          )}
        </div>

        {/* Nút thêm giỏ - full width, gradient gold */}
        <AddToCartBtn
          productId={product.id || product._id}
          className="w-100 rounded-pill fw-bold py-2.5 luxury-add-btn"
          variant="outline-light"
        >
          Thêm vào giỏ
        </AddToCartBtn>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
