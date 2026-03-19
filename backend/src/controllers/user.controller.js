import * as userService from "../services/user.service.js";

const getUserId = (req) => {
  return req.user?.userId || req.user?.id;
};

// --- GET ALL USERS ---
export const getAllUsers = async (req, res, next) => {
  try {
    // ← Thêm "roles" vào destructure, mặc định rỗng = lấy tất cả
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "All",
      roles = "",
    } = req.query;

    const { users, count } = await userService.findUsers({
      page: +page,
      limit: +limit,
      search,
      status,
      roles, // ← truyền xuống service
    });

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: +page,
      totalUsers: count,
    });
  } catch (err) {
    next(err);
  }
};

// --- GET USER BY ID --- (không đổi)
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// --- TOGGLE STATUS --- (không đổi)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatusById(req.params.id);
    res.json({
      success: true,
      message: `User is now ${user.status === 1 ? "Active" : "Locked"}`,
    });
  } catch (err) {
    next(err);
  }
};

// --- DELETE USER --- (không đổi)
export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUserById(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// --- ADDRESS --- (không đổi)
export const addAddress = async (req, res, next) => {
  try {
    const addresses = await userService.addUserAddress(
      getUserId(req),
      req.body,
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
      req.body,
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
      req.params.addressId,
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
      req.params.addressId,
    );
    res.json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
};

// --- WISHLIST --- (không đổi)
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
      req.body.productId,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// --- CREATE USER --- (không đổi)
export const createUser = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo tài khoản thành công!",
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
};
