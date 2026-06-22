// backend/src/services/cart.service.js
import Cart from "../models/cart.js";
import Product from "../models/product.js";

// Helper: Tạo khóa duy nhất cho item (productId + variantId)
const getItemKey = (productId, variantId = null) =>
  `${productId}__${variantId || "default"}`;

// Lấy giỏ hàng (Có logic tự dọn dẹp item rác)
export const getCartService = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "name price_cents images slug is_active variants",
  });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
    return cart;
  }

  // Lọc bỏ các sản phẩm bị null (đã xóa khỏi DB Product)
  // Dùng filter javascript thông thường vì ta đang cần trả về dữ liệu hiển thị
  const validItems = cart.items.filter((item) => item.productId !== null);

  // Nếu có sự thay đổi (có rác), cập nhật lại DB bằng updateOne (tránh dùng save() để ko lỗi version)
  if (validItems.length !== cart.items.length) {
    await Cart.updateOne({ _id: cart._id }, { items: validItems });
    cart.items = validItems; // Cập nhật lại biến cục bộ để trả về
  }

  return cart;
};

// Thêm vào giỏ (Hỗ trợ cả với và không có variantId)
export const addToCartService = async (
  userId,
  productId,
  quantity = 1,
  variantId = null,
  variantData = null,
) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // Tạo mới nếu chưa có
    cart = await Cart.create({
      userId,
      items: [{ productId, quantity, variantId, variant: variantData }],
    });
  } else {
    // Kiểm tra item đã tồn tại với cùng variant chưa
    const itemIndex = cart.items.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        (p.variantId?.toString() === variantId ||
          (p.variantId == null && variantId == null)),
    );

    if (itemIndex > -1) {
      // Cộng dồn số lượng (Atomic update)
      const query = {
        userId,
        "items.productId": productId,
        "items.variantId": variantId || null,
      };
      await Cart.findOneAndUpdate(query, {
        $inc: { "items.$.quantity": quantity },
      });
    } else {
      // Thêm mới (Atomic update)
      await Cart.findOneAndUpdate(
        { userId },
        {
          $push: {
            items: { productId, variantId, variant: variantData, quantity },
          },
        },
      );
    }
  }

  // Trả về cart mới nhất đã populate
  return await getCartService(userId);
};

// Cập nhật số lượng (Hỗ trợ cập nhật per-variant)
export const updateCartItemService = async (
  userId,
  productId,
  quantity,
  variantId = null,
) => {
  if (quantity <= 0) {
    // Nếu số lượng <= 0 thì gọi hàm xóa
    return await removeCartItemService(userId, productId, variantId);
  }

  // Tìm item với cả productId và variantId
  const query = {
    userId,
    "items.productId": productId,
  };

  // Thêm điều kiện variantId nếu cung cấp
  if (variantId) {
    query["items.variantId"] = variantId;
  } else {
    query["items.variantId"] = null;
  }

  const updatedCart = await Cart.findOneAndUpdate(
    query,
    { $set: { "items.$.quantity": quantity } },
    { new: true },
  );

  if (!updatedCart) throw new Error("Cart or Product not found");

  return await getCartService(userId);
};

// Xóa sản phẩm (Hỗ trợ xóa per-variant hoặc toàn bộ sản phẩm)
export const removeCartItemService = async (
  userId,
  productId,
  variantId = null,
) => {
  const pullCondition = { productId: productId };

  // Nếu có variantId, chỉ xóa variant đó; nếu không, xóa tất cả variant của sản phẩm
  if (variantId) {
    pullCondition.variantId = variantId;
  }

  await Cart.findOneAndUpdate({ userId }, { $pull: { items: pullCondition } });

  return await getCartService(userId);
};
