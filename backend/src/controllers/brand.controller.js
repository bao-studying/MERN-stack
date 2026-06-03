import {
    getBrandsService,
    createBrandService,
    updateBrandService,
    deleteBrandService
} from "../services/brand.service.js";

export const getBrands = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "", is_active } = req.query;
        const result = await getBrandsService({ page, limit, search, onlyActive: is_active === 'true'});
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const createBrand = async (req, res, next) => {
    try {
        // req.body chứa: name, description, imageUrl, isActive
        const brand = await createBrandService(req.body);
        res.status(201).json({ success: true, message: "Tạo thương hiệu thành công", brand });
    } catch (error) {
        next(error);
    }
};

export const updateBrand = async (req, res, next) => {
    try {
        const brand = await updateBrandService(req.params.id, req.body);
        res.json({ success: true, message: "Cập nhật thành công", brand });
    } catch (error) {
        next(error);
    }
};

export const deleteBrand = async (req, res, next) => {
    try {
        await deleteBrandService(req.params.id);
        res.json({ success: true, message: "Đã xóa thương hiệu" });
    } catch (error) {
        next(error);
    }
};