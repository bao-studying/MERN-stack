// src/services/product.service.js
import Product from "../models/product.js";
import Category from "../models/category.js"; // <--- Cần nhập kho Category để kiểm tra
import Brand from "../models/brand.js"; // <--- Thêm Brand import

/**
 * Tự sinh SKU cho 1 biến thể dựa trên SKU/tên sản phẩm + thuộc tính
 * (giống logic sinh SKU ở Model: PROD-<timestamp>, nhưng thêm index để
 * không bị trùng nhau giữa các biến thể tạo cùng lúc)
 */
const generateVariantSku = (baseSku, index) => {
  const base = baseSku ? baseSku.toUpperCase().replace(/\s+/g, "-") : "VAR";
  return `${base}-${Date.now()}-${index}`;
};

/**
 * Chuẩn hoá danh sách variants gửi lên từ client:
 * - Tự sinh SKU nếu thiếu
 * - Tự ghép "name" hiển thị từ object attributes (key: value) nếu không có name
 * - Đảm bảo stock, price_cents là số hợp lệ
 */
const normalizeVariants = (variants = [], baseSku) => {
  if (!Array.isArray(variants) || variants.length === 0) return [];

  return variants.map((v, idx) => {
    const attributes =
      v.attributes && typeof v.attributes === "object" ? v.attributes : {};

    // Tên hiển thị tự ghép từ attributes, ví dụ: "Màu: Đỏ, Size: M"
    const autoName = Object.entries(attributes)
      .filter(([, val]) => val !== undefined && val !== null && val !== "")
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ");

    return {
      sku: v.sku && v.sku.trim() ? v.sku : generateVariantSku(baseSku, idx),
      name:
        v.name && v.name.trim() ? v.name : autoName || `Phân loại ${idx + 1}`,
      price_cents: Number(v.price_cents) || 0,
      compareAtPriceCents: v.compareAtPriceCents
        ? Number(v.compareAtPriceCents)
        : undefined,
      stock: Number(v.stock) || 0,
      weightGrams: v.weightGrams ? Number(v.weightGrams) : undefined,
      attributes,
      is_active: v.is_active !== undefined ? v.is_active : true,
    };
  });
};

/**
 * Tính lại các field tổng hợp của Product dựa trên danh sách variants:
 * - price_cents (giá hiển thị mặc định) = giá của variant đầu tiên còn active
 *   (nếu không có variant nào active thì lấy variant đầu tiên)
 * - Tổng stock không lưu trực tiếp trên Product (schema không có field này),
 *   nhưng được trả về kèm response để frontend hiển thị nhất quán, và
 *   đây là nguồn tính DUY NHẤT (không phụ thuộc frontend tự cộng).
 */
const computeAggregatesFromVariants = (variants = []) => {
  const totalStock = variants.reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0,
  );

  const activeVariants = variants.filter((v) => v.is_active !== false);
  const referenceVariant = activeVariants[0] || variants[0];
  const displayPrice = referenceVariant
    ? Number(referenceVariant.price_cents) || 0
    : undefined;

  return { totalStock, displayPrice };
};

export const createProductService = async (data) => {
  // 1. Kiểm tra Category có tồn tại không
  // Lưu ý: data.categoryId là cái frontend gửi lên
  const categoryExists = await Category.findById(data.categoryId);

  if (!categoryExists) {
    throw new Error("Category not found");
  }

  // 2. Kiểm tra Brand nếu có
  if (data.brand) {
    const brandExists = await Brand.findById(data.brand);
    if (!brandExists) {
      throw new Error("Brand not found");
    }
  }

  // 3. Chuẩn hoá variants: tự sinh SKU, tự ghép tên từ attributes
  const normalizedVariants = normalizeVariants(data.variants, data.sku);

  // 4. Tính lại giá hiển thị & tổng stock từ variants (nguồn duy nhất, không tin frontend)
  const { totalStock, displayPrice } =
    computeAggregatesFromVariants(normalizedVariants);

  const payload = {
    ...data,
    variants: normalizedVariants,
    // Nếu có variant thì giá hiển thị luôn lấy từ variant đầu tiên để đồng bộ
    price_cents:
      normalizedVariants.length > 0 ? displayPrice : data.price_cents,
  };

  // 5. Tạo Product — Mongoose sẽ tự chạy hook tạo slug và sku như ta đã định nghĩa trong Model
  const newProduct = await Product.create(payload);

  // 6. Populate category và brand để trả lại data đầy đủ cho frontend
  await newProduct.populate("categoryId", "_id name slug");
  await newProduct.populate("brand", "_id name slug imageUrl");

  // 7. Trả kèm tổng stock đã tính để frontend không cần tự cộng lại
  const result = newProduct.toObject();
  result.totalStock = totalStock;

  return result;
};

// Chúng ta cũng cần hàm lấy danh sách sản phẩm để tí nữa test
export const getAllProductsService = async () => {
  // 1. LOGIC ẨN SẢN PHẨM KHI DANH MỤC BỊ ẨN
  // Tìm ID của các danh mục đang set isActive: false
  const hiddenCategories = await Category.find({ isActive: false }).select(
    "_id",
  );
  const hiddenIds = hiddenCategories.map((c) => c._id);

  // Tạo query: Nếu có danh mục ẩn thì loại bỏ sản phẩm thuộc danh mục đó
  const query = {};
  if (hiddenIds.length > 0) {
    query.categoryId = { $nin: hiddenIds }; // $nin = Không nằm trong
  }

  // 2. LẤY DỮ LIỆU (Trả về Array như cũ)
  // Không dùng .limit() hay .skip() để Frontend tự xử lý phân trang
  const products = await Product.find(query)
    .populate("categoryId", "_id name slug") // Populate để lấy tên danh mục
    .populate("brand", "_id name slug imageUrl") // Populate để lấy thông tin thương hiệu
    .sort({ createdAt: -1 });

  // 3. Gắn kèm tổng stock đã tính từ variants cho mỗi sản phẩm
  //    để frontend không cần tự cộng lại (nguồn tính duy nhất ở backend)
  return products.map((p) => {
    const obj = p.toObject();
    const { totalStock } = computeAggregatesFromVariants(obj.variants || []);
    obj.totalStock = totalStock;
    return obj;
  });
};

export const getProductBySlugService = async (slug) => {
  // Tìm sản phẩm theo slug, populate category và brand để lấy tên danh mục và thương hiệu
  const product = await Product.findOne({ slug: slug })
    .populate("categoryId", "_id name slug")
    .populate("brand", "_id name slug imageUrl");

  if (!product) return null;

  const obj = product.toObject();
  const { totalStock } = computeAggregatesFromVariants(obj.variants || []);
  obj.totalStock = totalStock;

  return obj;
};

// Lấy sản phẩm liên quan
export const getRelatedProductsService = async (
  categoryId,
  currentProductId,
) => {
  return await Product.find({
    categoryId: categoryId, // Cùng danh mục
    _id: { $ne: currentProductId }, // Loại trừ ID hiện tại ($ne = not equal)
  })
    .limit(4) // Chỉ lấy 4 sản phẩm
    .populate("categoryId", "_id name slug"); // Populate để lấy thông tin đẹp
};

// --- UPDATE PRODUCT ---
export const updateProductService = async (id, data) => {
  // 1. Nếu client gửi variants mới, chuẩn hoá lại (sinh SKU thiếu, ghép tên từ attributes)
  const updateData = { ...data };

  if (Array.isArray(data.variants)) {
    const existingProduct = await Product.findById(id).select("sku");
    const baseSku = existingProduct?.sku || data.sku;

    const normalizedVariants = normalizeVariants(data.variants, baseSku);
    const { totalStock, displayPrice } =
      computeAggregatesFromVariants(normalizedVariants);

    updateData.variants = normalizedVariants;
    // Đồng bộ lại giá hiển thị mặc định theo variant đầu tiên (nguồn duy nhất ở backend)
    updateData.price_cents =
      displayPrice !== undefined ? displayPrice : data.price_cents;

    // Tìm và update, trả về dữ liệu mới sau khi update
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedProduct) throw new Error("Product not found");

    await updatedProduct.populate("categoryId", "_id name slug");
    await updatedProduct.populate("brand", "_id name slug imageUrl");

    const result = updatedProduct.toObject();
    result.totalStock = totalStock;
    return result;
  }

  // Trường hợp không đổi variants — giữ logic update như cũ
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedProduct) throw new Error("Product not found");

  await updatedProduct.populate("categoryId", "_id name slug");
  await updatedProduct.populate("brand", "_id name slug imageUrl");

  const result = updatedProduct.toObject();
  const { totalStock } = computeAggregatesFromVariants(result.variants || []);
  result.totalStock = totalStock;

  return result;
};

// --- DELETE PRODUCT ---
export const deleteProductService = async (id) => {
  const deletedProduct = await Product.findByIdAndDelete(id);
  if (!deletedProduct) throw new Error("Product not found");
  return deletedProduct;
};
