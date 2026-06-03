// src/controllers/product.controller.js
import { 
    getAllProductsService, 
    createProductService,
    getProductBySlugService,
    getRelatedProductsService,
    updateProductService, 
    deleteProductService
} from "../services/product.service.js";

// Lấy danh sách sản phẩm (đã có từ trước)
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await getAllProductsService();

        res.status(200).json({
            success: true,
            data: products,
            message: "Get products successfully",
        });
    } catch (error) {
        next(error);
    }
};

// --- THÊM HÀM TẠO SẢN PHẨM ---
export const createProduct = async (req, res, next) => {
    try {
        // 1. Lấy các dữ liệu cần thiết từ request
        // Lưu ý: KHÔNG lấy slug hay sku vì Model tự tạo
        const { 
            name, 
            categoryId, 
            brand,
            price_cents, 
            variants, 
            images, 
            description,
            shortDescription 
        } = req.body;

        // 2. Gọi Service xử lý
        const product = await createProductService({
            name,
            categoryId,
            brand,
            price_cents,
            variants,
            images,
            description,
            shortDescription
        });

        // 3. Trả về kết quả
        res.status(201).json({
            success: true,
            data: product,
            message: "Product created successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const product = await getProductBySlugService(slug);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({
            success: true,
            data: product,
            message: "Get product detail successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getRelatedProducts = async (req, res, next) => {
    try {
        const { categoryId, currentProductId } = req.query; // Lấy tham số từ Query String

        if (!categoryId || !currentProductId) {
            return res.status(400).json({ success: false, message: "Missing params" });
        }

        const products = await getRelatedProductsService(categoryId, currentProductId);

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};


// --- UPDATE ---
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await updateProductService(id, req.body);
        res.status(200).json({ success: true, data: product, message: "Cập nhật thành công" });
    } catch (error) {
        next(error);
    }
};

// --- DELETE ---
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteProductService(id);
        res.status(200).json({ success: true, message: "Xóa thành công" });
    } catch (error) {
        next(error);
    }
};