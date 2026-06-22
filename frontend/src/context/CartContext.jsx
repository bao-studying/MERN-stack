import { useState, createContext, useContext } from "react";

export const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // SỬA: Thay đổi productId thành productData (nhận nguyên Object sản phẩm từ nút bấm)
  const addToCart = (
    productData,
    quantity,
    variantId = null,
    variantData = null,
  ) => {
    return new Promise((resolve, reject) => {
      try {
        // Trích xuất ID để so sánh tiện lợi
        const targetProductId = productData?._id || productData;

        setCartItems((prevItems) => {
          // Check trùng sản phẩm & trùng đúng biến thể (nếu có)
          const existingItemIndex = prevItems.findIndex(
            (item) =>
              (item.productId?._id === targetProductId ||
                item.productId === targetProductId) &&
              item.variantId === variantId,
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex].quantity += quantity;
            return updatedItems;
          } else {
            // Lưu ĐẦY ĐỦ cấu trúc Object để CartPage.jsx đọc mượt mà
            return [
              ...prevItems,
              {
                productId:
                  typeof productData === "object"
                    ? productData
                    : { _id: productData }, // Đảm bảo luôn là Object
                quantity,
                variantId,
                variant: variantData, // Đầy đủ thông tin cấu trúc giá, stock, attributes...
              },
            ];
          }
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Nhớ bổ sung thêm các hàm updateQuantity và removeFromCart nếu CartPage đang gọi từ đây
  const updateQuantity = (productId, quantity, variantId = null) => {
    setCartItems((prev) =>
      prev.map((item) =>
        (item.productId?._id === productId || item.productId === productId) &&
        item.variantId === variantId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId, variantId = null) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            (item.productId?._id === productId ||
              item.productId === productId) &&
            item.variantId === variantId
          ),
      ),
    );
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
