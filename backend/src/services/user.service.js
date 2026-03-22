import User from "../models/user.js";
import Role from "../models/role.js";
import bcrypt from "bcrypt";

// ===== USER =====

export const findUsers = async ({
  page,
  limit,
  search,
  status,
  roles = "",
  sort = "newest",
}) => {
  const matchStage = {};

  // 1. Tìm kiếm theo tên / email / phone
  if (search) {
    matchStage.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  // 2. Lọc theo trạng thái
  if (status !== "All") {
    matchStage.status = status === "Active" ? 1 : 0;
  }

  // 3. Lọc theo role names
  if (roles) {
    const roleNames = roles
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    if (roleNames.length > 0) {
      const roleDocs = await Role.find({ name: { $in: roleNames } }).select(
        "_id",
      );
      const roleIds = roleDocs.map((r) => r._id);
      matchStage.role = { $in: roleIds };
    }
  }

  // 4. Sort stage — map sort key → MongoDB sort
  const SORT_MAP = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    spending_desc: { totalSpend: -1 },
    spending_asc: { totalSpend: 1 },
    orders_desc: { orderCount: -1 },
    name_asc: { name: 1 },
  };
  const sortStage = SORT_MAP[sort] || { createdAt: -1 };

  // 5. Aggregate: match → lookup Orders → tính totalSpend (chỉ đơn delivered) + orderCount → sort → paginate
  const pipeline = [
    { $match: matchStage },

    // Join với collection orders
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "userId",
        as: "orders",
      },
    },

    // Tính totalSpend (chỉ đơn delivered) và orderCount (tất cả đơn)
    {
      $addFields: {
        totalSpend: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$orders",
                  as: "o",
                  cond: { $eq: ["$$o.status", "delivered"] },
                },
              },
              as: "o",
              in: "$$o.totalAmount_cents",
            },
          },
        },
        orderCount: { $size: "$orders" },
      },
    },

    // Bỏ mảng orders thô (nặng, không cần trả về)
    { $unset: "orders" },

    // Populate role — lookup Role collection
    {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "roleData",
      },
    },
    {
      $addFields: {
        role: { $arrayElemAt: ["$roleData", 0] },
      },
    },
    { $unset: "roleData" },

    // Sort
    { $sort: sortStage },
  ];

  // Count tổng (không paginate)
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await User.aggregate(countPipeline);
  const count = countResult[0]?.total || 0;

  // Paginate
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  const users = await User.aggregate(pipeline);

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

export const createUser = async (userData) => {
  const { name, email, phone, password, role } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email này đã được sử dụng!");
    error.statusCode = 400;
    throw error;
  }

  const roleDoc = await Role.findOne({ name: role.toLowerCase() });
  if (!roleDoc) {
    const error = new Error("Vai trò không hợp lệ!");
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name,
    email,
    phone,
    password_hash: hashedPassword,
    role: roleDoc._id,
    status: 1,
  });

  return await newUser.save();
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
