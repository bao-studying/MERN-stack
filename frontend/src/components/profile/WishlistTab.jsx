import React from "react";
import { Button } from "react-bootstrap";
import { FaTrash, FaShoppingCart, FaHeart, FaBoxOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useWishlist } from "../../hooks/useWishlist";
import AddToCartBtn from "../cart/AddToCartBtn";

const WishlistTab = () => {
  const { wishlist, toggleWishlist } = useWishlist();

  return (
    <div className="animate-fade-in">
      <h4 className="fw-bold mb-4 pb-3 border-bottom text-danger">
        <FaHeart className="me-2" />
        Sản phẩm yêu thích
      </h4>

      {wishlist.length > 0 ? (
        wishlist.map((item) => {
          const image =
            item.images?.[0]?.imageUrl || "https://placehold.co/100";
          const price = item.price_cents || 0;
          const isStock = (item.variants?.[0]?.stock || item.stock || 0) > 0;

          return (
            <div
              key={item._id}
              className="d-flex align-items-center border-bottom py-3 hover-bg-light transition-all rounded px-2"
            >
              <img
                src={image}
                alt={item.name}
                className="rounded border"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
              <div className="ms-3 flex-grow-1">
                <Link
                  to={`/product/${item.slug}`}
                  className="fw-bold text-dark text-decoration-none hover-green fs-6"
                >
                  {item.name}
                </Link>
                <div className="text-success fw-bold">
                  {price.toLocaleString()} đ
                </div>
                <div
                  className={`small ${isStock ? "text-primary" : "text-danger"}`}
                >
                  {isStock ? "Còn hàng" : "Hết hàng"}
                </div>
              </div>
              <div className="d-flex flex-column gap-2 ms-3">
                <AddToCartBtn
                  productId={item._id}
                  className="rounded-pill px-3 btn-sm"
                  disabled={!isStock}
                >
                  Thêm
                </AddToCartBtn>

                <Button
                  variant="outline-danger"
                  size="sm"
                  className="rounded-pill px-3"
                  onClick={() => toggleWishlist(item)}
                >
                  <FaTrash className="me-1" /> Xóa
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-5 text-muted">
          <FaBoxOpen size={40} className="mb-3 opacity-50" />
          <p>Danh sách yêu thích trống.</p>
          <Link
            to="/products"
            className="btn btn-outline-danger rounded-pill px-4"
          >
            Khám phá ngay
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistTab;
