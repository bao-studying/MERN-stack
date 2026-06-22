import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import cartApi from "../services/cart.service";
import { useAuth } from "../hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";
import { CartContext } from "./CartContext";

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        const validItems = (res.data.items || []).filter(
          (item) => item.productId !== null,
        );
        setCartItems(validItems);
      }
    } catch {
      console.error("Lỗi tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // --- MỚI: HÀM XÓA GIỎ HÀNG (Dùng sau khi Checkout thành công) ---
  const clearCart = useCallback(() => {
    setCartItems([]); // Xóa ngay lập tức trên giao diện
  }, []);

  const addToCart = async (
    productId,
    quantity = 1,
    variantId = null,
    variantData = null,
  ) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập!");
      navigate("/login");
      return;
    }
    try {
      const existingItem = cartItems.find((item) => {
        const pid = item.productId?._id || item.productId;
        const vid = item.variant?._id || item.variantId || null;
        return (
          pid === productId &&
          (vid === variantId || (vid == null && variantId == null))
        );
      });

      // Forward variant info to API so backend can persist variant selection
      const res = await cartApi.addToCart({
        productId,
        quantity,
        variantId,
        variant: variantData,
      });

      if (res.success) {
        const validItems = (res.data.items || []).filter(
          (item) => item.productId !== null,
        );
        setCartItems(validItems);

        if (existingItem) toast.success("Đã cập nhật số lượng!");
        else toast.success("Đã thêm vào giỏ hàng!");
      }
    } catch {
      toast.error("Lỗi khi thêm vào giỏ hàng.");
    }
  };

  const updateQuantity = async (productId, newQuantity, variantId = null) => {
    if (newQuantity < 1) return;
    try {
      const res = await cartApi.updateQuantity({
        productId,
        quantity: newQuantity,
        variantId,
      });
      if (res.success) {
        const validItems = (res.data.items || []).filter(
          (item) => item.productId !== null,
        );
        setCartItems(validItems);
      }
    } catch {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const removeFromCart = async (productId, variantId = null) => {
    try {
      const res = await cartApi.removeItem(productId, variantId);
      if (res.success) {
        const validItems = (res.data.items || []).filter(
          (item) => item.productId !== null,
        );
        setCartItems(validItems);
        toast.success("Đã xóa sản phẩm");
      }
    } catch {
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart: fetchCart,
        clearCart, // Export hàm này để CheckoutPage dùng
        loading,
      }}
    >
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            marginTop: "50px",
            zIndex: 9999,
          },
        }}
      />
    </CartContext.Provider>
  );
};
