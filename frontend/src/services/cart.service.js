import axiosClient from "./axiosClient";

const cartApi = {
  getCart: () => {
    return axiosClient.get("/cart");
  },
  addToCart: (data) => {
    // data: { productId, quantity, variantId, variant }
    return axiosClient.post("/cart/add", data);
  },
  updateQuantity: (data) => {
    // data: { productId, quantity, variantId }
    return axiosClient.put("/cart/update", data);
  },
  removeItem: (productId, variantId = null) => {
    // Support remove per-variant or entire product
    const params = variantId ? `?variantId=${variantId}` : "";
    return axiosClient.delete(`/cart/remove/${productId}${params}`);
  },
};

export default cartApi;
