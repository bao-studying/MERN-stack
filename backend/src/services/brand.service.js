import Brand from "../models/brand.js";
import slugify from "slugify";

// 1. Lấy danh sách
export const getBrandsService = async ({ page, limit, search, onlyActive }) => {
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    // Nếu có cờ active thì chỉ lấy isActive: true
    if (onlyActive) {
        query.isActive = true;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const brands = await Brand.find(query)
        .limit(limit * 1)
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Brand.countDocuments(query);

    return {
        brands,
        totalPages: Math.ceil(total / limit),
        totalBrands: total
    };
};

// 2. Tạo mới
export const createBrandService = async (data) => {
    const { name, description, imageUrl, isActive } = data;

    // Check trùng tên
    const exists = await Brand.findOne({ name });
    if (exists) {
        throw new Error("Tên thương hiệu đã tồn tại");
    }

    // Slug sẽ tự tạo nhờ middleware pre('save') trong Model của bạn
    const newBrand = await Brand.create({
        name,
        description,
        imageUrl,
        isActive: isActive === undefined ? true : isActive // Default true nếu ko truyền
    });

    return newBrand;
};

// 3. Cập nhật
export const updateBrandService = async (id, data) => {
    const brand = await Brand.findById(id);
    if (!brand) {
        throw new Error("Thương hiệu không tồn tại");
    }

    // Check trùng tên (nếu tên thay đổi)
    if (data.name && data.name !== brand.name) {
        const exists = await Brand.findOne({ name: data.name });
        if (exists) {
            throw new Error("Tên thương hiệu đã tồn tại");
        }
    }

    // Cập nhật
    Object.assign(brand, data);
    await brand.save();

    return brand;
};

// 4. Xóa
export const deleteBrandService = async (id) => {
    const brand = await Brand.findById(id);
    if (!brand) {
        throw new Error("Thương hiệu không tồn tại");
    }

    await Brand.findByIdAndDelete(id);
};