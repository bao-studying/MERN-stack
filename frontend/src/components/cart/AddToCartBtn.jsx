import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { FaShoppingCart, FaSpinner, FaCheck } from "react-icons/fa";
import { useCart } from "../../hooks/useCart";

const AddToCartBtn = ({
  product, // 1. Đã sửa: Nhận nguyên object product
  variantId = null,
  variantData = null,
  quantity = 1,
  className = "",
  variant = "success",
  size = "md",
  showIcon = true,
  disabled = false,
  style = {},
  children,
}) => {
  const { addToCart } = useCart();
  const [status, setStatus] = useState("idle");

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "idle" || disabled || !product) return;

    setStatus("adding");
    try {
      // 2. Đã sửa: Truyền object product vào thay vì productId chuỗi chữ cũ
      await addToCart(product, quantity, variantId, variantData);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 1400);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      setStatus("idle");
    }
  };

  const isAdding = status === "adding";
  const isDone = status === "done";

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      style={style}
      onClick={handleClick}
      disabled={isAdding || disabled}
    >
      {isAdding ? (
        <FaSpinner className="fa-spin me-2" />
      ) : isDone ? (
        <FaCheck className="me-2" style={{ color: "#22c55e" }} />
      ) : (
        showIcon && <FaShoppingCart className="me-2" />
      )}
      {children ||
        (isAdding ? "Đang thêm..." : isDone ? "Đã thêm!" : "Thêm vào giỏ")}
    </Button>
  );
};

export default AddToCartBtn;
