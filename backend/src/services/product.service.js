// src/services/product.service.js
import Product from "../models/product.js";
import Category from "../models/category.js"; // <--- Cần nhập kho Category để kiểm tra
import Brand from "../models/brand.js"; // <--- Thêm Brand import

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

    // 3. Nếu Category và Brand OK, thì mới tạo Product
    // Mongoose sẽ tự chạy hook tạo slug và sku như ta đã định nghĩa trong Model
    const newProduct = await Product.create(data);

    // 4. Populate category và brand để trả lại data đầy đủ cho frontend
    await newProduct.populate("categoryId", "_id name slug");
    await newProduct.populate("brand", "_id name slug imageUrl");

    return newProduct;
};

// Chúng ta cũng cần hàm lấy danh sách sản phẩm để tí nữa test
export const getAllProductsService = async () => {
    // 1. LOGIC ẨN SẢN PHẨM KHI DANH MỤC BỊ ẨN
    // Tìm ID của các danh mục đang set isActive: false
    const hiddenCategories = await Category.find({ isActive: false }).select('_id');
    const hiddenIds = hiddenCategories.map(c => c._id);

    // Tạo query: Nếu có danh mục ẩn thì loại bỏ sản phẩm thuộc danh mục đó
    const query = {};
    if (hiddenIds.length > 0) {
        query.categoryId = { $nin: hiddenIds }; // $nin = Không nằm trong
    }

    // 2. LẤY DỮ LIỆU (Trả về Array như cũ)
    // Không dùng .limit() hay .skip() để Frontend tự xử lý phân trang
    return await Product.find(query)
        .populate("categoryId", "_id name slug") // Populate để lấy tên danh mục
        .populate("brand", "_id name slug imageUrl") // Populate để lấy thông tin thương hiệu
        .sort({ createdAt: -1 });
};

export const getProductBySlugService = async (slug) => {
    // Tìm sản phẩm theo slug, populate category và brand để lấy tên danh mục và thương hiệu
    const product = await Product.findOne({ slug: slug })
        .populate("categoryId", "_id name slug")
        .populate("brand", "_id name slug imageUrl");

    return product;
};

// Lấy sản phẩm liên quan
export const getRelatedProductsService = async (categoryId, currentProductId) => {
    return await Product.find({
        categoryId: categoryId,       // Cùng danh mục
        _id: { $ne: currentProductId } // Loại trừ ID hiện tại ($ne = not equal)
    })
    .limit(4) // Chỉ lấy 4 sản phẩm
    .populate("categoryId", "_id name slug"); // Populate để lấy thông tin đẹp
};

// --- UPDATE PRODUCT ---
export const updateProductService = async (id, data) => {
    // Tìm và update, trả về dữ liệu mới sau khi update
    const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!updatedProduct) throw new Error("Product not found");
    
    // Populate category và brand để trả lại data đầy đủ
    await updatedProduct.populate("categoryId", "_id name slug");
    await updatedProduct.populate("brand", "_id name slug imageUrl");
    
    return updatedProduct;
};

// --- DELETE PRODUCT ---
export const deleteProductService = async (id) => {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) throw new Error("Product not found");
    return deletedProduct;
};