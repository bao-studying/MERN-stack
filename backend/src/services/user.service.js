import User from "../models/user.js";
import Role from "../models/role.js";
import bcrypt from "bcrypt";
export const createUser = async (userData) => {
  const { name, email, phone, password, role } = userData;

  // 1. Kiểm tra email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email này đã được sử dụng!");
    error.statusCode = 400;
    throw error;
  }

  // 2. Tìm Role ID từ tên role (manager/employee)
  const roleDoc = await Role.findOne({ name: role.toLowerCase() });
  if (!roleDoc) {
    const error = new Error("Vai trò không hợp lệ!");
    error.statusCode = 400;
    throw error;
  }

  // 3. Hash mật khẩu
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Tạo User mới
  const newUser = new User({
    name,
    email,
    phone,
    password_hash: hashedPassword, // Khớp với trường trong DB của bạn
    role: roleDoc._id,
    status: 1, // Mặc định là Active
  });

  return await newUser.save();
};
// ===== USER =====
export const findUsers = async ({ page, limit, search, status }) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (status !== "All") {
    query.status = status === "Active" ? 1 : 0;
  }

  const users = await User.find(query)
    .populate("role", "name")
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  return { users, count };
};

export const findUserById = async (id) => {
  return await User.findById(id).populate("role", "name");
};

export const toggleUserStatusById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  user.status = user.status === 1 ? 0 : 1;
  await user.save();

  return user;
};

export const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};

// ===== ADDRESS =====
export const addUserAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (addressData.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push({
    ...addressData,
    country: "Vietnam",
    isDefault: addressData.isDefault || user.addresses.length === 0,
  });

  await user.save();
  return user.addresses;
};

export const updateUserAddress = async (userId, addressId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new Error("Address not found");

  if (data.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, data);
  await user.save();

  return user.addresses;
};

export const deleteUserAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new Error("Address not found");

  const wasDefault = address.isDefault;
  user.addresses.pull({ _id: addressId });

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return user.addresses;
};

export const setDefaultUserAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const address = user.addresses.id(addressId);
  if (!address) throw new Error("Address not found");

  user.addresses.forEach((addr) => (addr.isDefault = false));
  address.isDefault = true;

  await user.save();
  return user.addresses;
};

// ===== WISHLIST =====
export const getUserWishlist = async (userId) => {
  const user = await User.findById(userId).populate("wishlist");
  if (!user) throw new Error("User not found");
  return user.wishlist || [];
};

export const toggleUserWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const index = user.wishlist.findIndex((id) => id.toString() === productId);

  let type = "";
  if (index === -1) {
    user.wishlist.push(productId);
    type = "added";
  } else {
    user.wishlist.splice(index, 1);
    type = "removed";
  }

  await user.save();
  return { wishlist: user.wishlist, type };
};
