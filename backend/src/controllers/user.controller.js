import * as userService from "../services/user.service.js";

// Helper để lấy ID an toàn từ req.user (do middleware verifyToken trả về decoded token)
const getUserId = (req) => {
    return req.user?.userId || req.user?.id;
};

// --- GET ALL USERS ---
export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "", status = "All" } = req.query;

        const { users, count } = await userService.findUsers({
            page: +page,
            limit: +limit,
            search,
            status
        });

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: +page,
            totalUsers: count
        });
    } catch (err) {
        next(err);
    }
};

// --- GET USER ---
export const getUserById = async (req, res, next) => {
    try {
        const user = await userService.findUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// --- TOGGLE STATUS ---
export const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await userService.toggleUserStatusById(req.params.id);
        res.json({
            success: true,
            message: `User is now ${user.status === 1 ? "Active" : "Locked"}`
        });
    } catch (err) {
        next(err);
    }
};

// --- DELETE USER ---
export const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUserById(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// --- ADDRESS ---
export const addAddress = async (req, res, next) => {
    try {
        // Sử dụng hàm getUserId để an toàn
        const addresses = await userService.addUserAddress(
            getUserId(req), 
            req.body
        );
        res.status(201).json({ success: true, data: addresses });
    } catch (err) {
        next(err);
    }
};

export const updateAddress = async (req, res, next) => {
    try {
        const addresses = await userService.updateUserAddress(
            getUserId(req),
            req.params.addressId,
            req.body
        );
        res.json({ success: true, data: addresses });
    } catch (err) {
        next(err);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        const addresses = await userService.deleteUserAddress(
            getUserId(req),
            req.params.addressId
        );
        res.json({ success: true, data: addresses });
    } catch (err) {
        next(err);
    }
};

export const setDefaultAddress = async (req, res, next) => {
    try {
        const addresses = await userService.setDefaultUserAddress(
            getUserId(req),
            req.params.addressId
        );
        res.json({ success: true, data: addresses });
    } catch (err) {
        next(err);
    }
};

// --- WISHLIST ---
export const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await userService.getUserWishlist(getUserId(req));
        res.json({ success: true, data: wishlist });
    } catch (err) {
        next(err);
    }
};

export const toggleWishlist = async (req, res, next) => {
    try {
        const result = await userService.toggleUserWishlist(
            getUserId(req),
            req.body.productId
        );
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};
// --- CREATE USER (Thêm mới nhân viên/quản lý) ---
export const createUser = async (req, res, next) => {
    try {
        // Lấy data từ body (khớp với newUserData ở Frontend)
        const userData = req.body; 
        
        const newUser = await userService.createUser(userData);

        res.status(201).json({
            success: true,
            message: "Tạo tài khoản thành công!",
            user: newUser
        });
    } catch (err) {
        // Nếu trùng email hoặc lỗi nghiệp vụ, Service sẽ ném lỗi và rơi vào đây
        next(err); 
    }
};