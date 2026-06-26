import Voucher from "../models/voucher.model.js";
import VoucherUsageLog from "../models/voucherUsageLog.model.js";
import User from "../models/user.js";
import Role from "../models/role.js";
import {
  markVoucherAsUsed,
  updateVoucherStats,
  getAnalyticsData,
  calculateUserSegment,
} from "../services/voucher.service.js";

const uid = (req) => req.user?.userId || req.user?.id;

/* ────────────────────── ADMIN: list all ────────────────────── */
export const getAllVouchers = async (req, res, next) => {
  try {
    const {
      search = "",
      type = "",
      status = "all", // all | active | expired | inactive
      page = 1,
      limit = 20,
    } = req.query;

    const now = new Date();
    let query = {};

    // Search by code hoặc description
    if (search) {
      query.$or = [
        { code: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by status
    if (status === "active") {
      query.isActive = true;
      query.expiryDate = { $gt: now };
    } else if (status === "expired") {
      query.expiryDate = { $lte: now };
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Voucher.countDocuments(query);

    const vouchers = await Voucher.find(query)
      .populate("assignedTo", "name email avatarUrl")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      vouchers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: create ────────────────────── */
export const createVoucher = async (req, res, next) => {
  try {
    const {
      code,
      description,
      type,
      value,
      maxDiscount,
      minOrder,
      expiryDate,
      costToProduce = 0,
      maxBudget = 0,
    } = req.body;

    if (minOrder < 1_000_000 || minOrder > 20_000_000)
      return res
        .status(400)
        .json({ message: "minOrder phải từ 1.000.000đ đến 20.000.000đ" });

    const voucher = await Voucher.create({
      code: code.toUpperCase().trim(),
      description,
      type,
      value: Number(value) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      minOrder: Number(minOrder),
      expiryDate: new Date(expiryDate),
      costToProduce: Number(costToProduce),
      maxBudget: Number(maxBudget),
      createdBy: uid(req),
    });

    res.status(201).json({ success: true, voucher });
  } catch (e) {
    if (e.code === 11000)
      return res.status(400).json({ message: "Mã voucher đã tồn tại!" });
    next(e);
  }
};

/* ────────────────────── ADMIN: generate random batch ────────────────────── */
export const generateVouchers = async (req, res, next) => {
  try {
    const {
      count = 5,
      type = "percent",
      value,
      maxDiscount = 0,
      minOrder_min = 1_000_000,
      minOrder_max = 20_000_000,
      expiryDate,
      prefix = "POKE",
      costToProduce = 0,
    } = req.body;

    if (
      minOrder_min < 1_000_000 ||
      minOrder_max > 20_000_000 ||
      minOrder_min > minOrder_max
    )
      return res
        .status(400)
        .json({ message: "Khoảng minOrder không hợp lệ (1tr–20tr)" });

    const rand = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const randCode = () =>
      `${prefix}${Date.now().toString(36).toUpperCase().slice(-4)}${Math.random().toString(36).toUpperCase().slice(2, 5)}`;

    const docs = [];
    for (let i = 0; i < Math.min(count, 20); i++) {
      const minOrder =
        Math.round(rand(minOrder_min, minOrder_max) / 100_000) * 100_000;
      let v = 0;
      if (type === "percent") v = rand(5, 30);
      if (type === "fixed") v = rand(5, 20) * 50_000;
      docs.push({
        code: randCode(),
        description: `Voucher giảm ${type === "percent" ? `${v}%` : type === "fixed" ? `${v.toLocaleString("vi-VN")}đ` : "miễn ship"} cho đơn từ ${minOrder.toLocaleString("vi-VN")}đ`,
        type,
        value: value !== undefined ? Number(value) : v,
        maxDiscount: Number(maxDiscount),
        minOrder,
        expiryDate: new Date(expiryDate),
        costToProduce: Number(costToProduce),
        createdBy: uid(req),
      });
    }

    const created = await Voucher.insertMany(docs, { ordered: false });
    res
      .status(201)
      .json({ success: true, count: created.length, vouchers: created });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: update ────────────────────── */
export const updateVoucher = async (req, res, next) => {
  try {
    const { minOrder } = req.body;
    if (minOrder && (minOrder < 1_000_000 || minOrder > 20_000_000))
      return res
        .status(400)
        .json({ message: "minOrder phải từ 1.000.000đ đến 20.000.000đ" });

    const v = await Voucher.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate("assignedTo", "name email avatarUrl");

    if (!v) return res.status(404).json({ message: "Không tìm thấy voucher" });
    res.json({ success: true, voucher: v });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: delete ────────────────────── */
export const deleteVoucher = async (req, res, next) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    // Cũng xóa logs
    await VoucherUsageLog.deleteMany({ voucherId: req.params.id });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: assign to users ────────────────────── */
export const assignVoucher = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || !userIds.length)
      return res.status(400).json({ message: "Cần cung cấp danh sách userId" });

    const v = await Voucher.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: { $each: userIds } } },
      { new: true },
    ).populate("assignedTo", "name email avatarUrl");

    if (!v) return res.status(404).json({ message: "Không tìm thấy voucher" });

    // Update stats
    await updateVoucherStats(v._id);

    res.json({ success: true, voucher: v });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: revoke from one user ────────────────────── */
export const revokeVoucher = async (req, res, next) => {
  try {
    const v = await Voucher.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignedTo: req.params.userId } },
      { new: true },
    ).populate("assignedTo", "name email avatarUrl");
    if (!v) return res.status(404).json({ message: "Không tìm thấy voucher" });

    // Update stats
    await updateVoucherStats(v._id);

    res.json({ success: true, voucher: v });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: eligible customers for this voucher ────────────────────── */
export const getEligibleUsers = async (req, res, next) => {
  try {
    const v = await Voucher.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Không tìm thấy voucher" });

    const customerRole = await Role.findOne({ name: "customer" });
    const excluded = [...v.assignedTo, ...v.usedBy].map(String);

    const users = await User.find({
      role: customerRole?._id,
      status: 1,
      _id: { $nin: excluded },
    })
      .select("name email avatarUrl createdAt")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, users });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: analytics dashboard ────────────────────── */
export const getAnalytics = async (req, res, next) => {
  try {
    const data = await getAnalyticsData();
    res.json({ success: true, ...data });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: voucher usage history ────────────────────── */
export const getVoucherUsageHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const voucher = await Voucher.findById(id);
    if (!voucher)
      return res.status(404).json({ message: "Không tìm thấy voucher" });

    // Get usage logs
    const logs = await VoucherUsageLog.find({ voucherId: id })
      .populate("userId", "name email avatarUrl")
      .sort({ usedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VoucherUsageLog.countDocuments({ voucherId: id });

    // Stats by segment
    const logsBySegment = await VoucherUsageLog.aggregate([
      { $match: { voucherId: id } },
      {
        $group: {
          _id: "$userSegment",
          count: { $sum: 1 },
          totalDiscount: { $sum: "$discountAmount" },
          avgDiscount: { $avg: "$discountAmount" },
        },
      },
    ]);

    res.json({
      success: true,
      voucher,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      statistics: {
        bySegment: logsBySegment,
      },
    });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── ADMIN: list customers by segment ────────────────────── */
export const getCustomersBySegment = async (req, res, next) => {
  try {
    const { segment } = req.params;
    const valid = ["new", "loyal", "one-time", "at-risk", "high-value"];
    if (!valid.includes(segment)) {
      return res.status(400).json({ message: "Segment không hợp lệ" });
    }

    // Map one-time → oneTime, at-risk → atRisk, high-value → highValue
    const segmentMap = {
      "one-time": "oneTime",
      "at-risk": "atRisk",
      "high-value": "highValue",
    };
    const dbSegment = segmentMap[segment] || segment;

    const logs = await VoucherUsageLog.find({ userSegment: segment })
      .populate("userId", "name email avatarUrl createdAt")
      .sort({ usedAt: -1 });

    // Group by user và tính stats
    const userStats = {};
    logs.forEach((log) => {
      const userId = log.userId._id.toString();
      if (!userStats[userId]) {
        userStats[userId] = {
          user: log.userId,
          usageCount: 0,
          totalDiscount: 0,
          lastUsedAt: log.usedAt,
        };
      }
      userStats[userId].usageCount += 1;
      userStats[userId].totalDiscount += log.discountAmount;
      userStats[userId].lastUsedAt = new Date(
        Math.max(new Date(userStats[userId].lastUsedAt), new Date(log.usedAt)),
      );
    });

    const customers = Object.values(userStats).sort(
      (a, b) => b.usageCount - a.usageCount,
    );

    res.json({ success: true, segment, customers });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── INTERNAL: mark used (from order service) ────────────────────── */
export const markVoucherUsedHandler = async (req, res, next) => {
  try {
    const {
      voucherId,
      userId,
      orderId,
      discountAmount,
      orderTotal,
      orderTotalAfter,
    } = req.body;

    const log = await markVoucherAsUsed(
      voucherId,
      userId,
      orderId,
      discountAmount,
      orderTotal,
      orderTotalAfter,
    );

    res.json({ success: true, log });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── CLIENT: my vouchers ────────────────────── */
export const getMyVouchers = async (req, res, next) => {
  try {
    const me = uid(req);
    const now = new Date();

    const all = await Voucher.find({ assignedTo: me, isActive: true }).sort({
      expiryDate: 1,
    });

    const active = all.filter(
      (v) =>
        new Date(v.expiryDate) > now &&
        !v.usedBy.map(String).includes(String(me)),
    );
    const used = all.filter((v) => v.usedBy.map(String).includes(String(me)));
    const expired = all.filter(
      (v) =>
        new Date(v.expiryDate) <= now &&
        !v.usedBy.map(String).includes(String(me)),
    );

    res.json({ success: true, active, used, expired });
  } catch (e) {
    next(e);
  }
};

/* ────────────────────── CLIENT: validate at checkout ────────────────────── */
export const validateVoucher = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const me = uid(req);

    const v = await Voucher.findOne({ code: code.toUpperCase().trim() });
    if (!v || !v.isActive)
      return res.status(400).json({ message: "Mã voucher không hợp lệ" });
    if (!v.assignedTo.map(String).includes(String(me)))
      return res.status(400).json({ message: "Bạn không có mã voucher này" });
    if (v.usedBy.map(String).includes(String(me)))
      return res.status(400).json({ message: "Mã đã được sử dụng" });
    if (new Date(v.expiryDate) < new Date())
      return res.status(400).json({ message: "Mã đã hết hạn" });
    if (orderAmount < v.minOrder)
      return res.status(400).json({
        message: `Đơn tối thiểu ${v.minOrder.toLocaleString("vi-VN")}đ`,
      });

    let discount = 0;
    if (v.type === "percent") {
      discount = Math.floor((orderAmount * v.value) / 100);
      if (v.maxDiscount > 0) discount = Math.min(discount, v.maxDiscount);
    } else if (v.type === "fixed") {
      discount = v.value;
    }

    res.json({
      success: true,
      voucher: {
        _id: v._id,
        code: v.code,
        description: v.description,
        type: v.type,
        value: v.value,
        minOrder: v.minOrder,
      },
      discount,
      finalAmount: Math.max(0, orderAmount - discount),
    });
  } catch (e) {
    next(e);
  }
};
