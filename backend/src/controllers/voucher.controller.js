import Voucher from "../models/voucher.model.js";
import User from "../models/user.js";
import Role from "../models/role.js";

const uid = (req) => req.user?.userId || req.user?.id;

/* ── ADMIN: list all ── */
export const getAllVouchers = async (req, res, next) => {
  try {
    const vouchers = await Voucher.find()
      .populate("assignedTo", "name email avatarUrl")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, vouchers });
  } catch (e) {
    next(e);
  }
};

/* ── ADMIN: create ── */
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
      createdBy: uid(req),
    });

    res.status(201).json({ success: true, voucher });
  } catch (e) {
    if (e.code === 11000)
      return res.status(400).json({ message: "Mã voucher đã tồn tại!" });
    next(e);
  }
};

/* ── ADMIN: generate random batch ──
   Body: { count, type, minOrder_min, minOrder_max, expiryDate }
   Tạo count mã ngẫu nhiên, minOrder random trong [minOrder_min, minOrder_max]
*/
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
      if (type === "percent") v = rand(5, 30); // 5–30%
      if (type === "fixed") v = rand(5, 20) * 50_000; // 250k–1tr
      docs.push({
        code: randCode(),
        description: `Voucher giảm ${type === "percent" ? `${v}%` : type === "fixed" ? `${v.toLocaleString("vi-VN")}đ` : "miễn ship"} cho đơn từ ${minOrder.toLocaleString("vi-VN")}đ`,
        type,
        value: value !== undefined ? Number(value) : v,
        maxDiscount: Number(maxDiscount),
        minOrder,
        expiryDate: new Date(expiryDate),
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

/* ── ADMIN: update ── */
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

/* ── ADMIN: delete ── */
export const deleteVoucher = async (req, res, next) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

/* ── ADMIN: assign to users ── */
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
    res.json({ success: true, voucher: v });
  } catch (e) {
    next(e);
  }
};

/* ── ADMIN: revoke from one user ── */
export const revokeVoucher = async (req, res, next) => {
  try {
    const v = await Voucher.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignedTo: req.params.userId } },
      { new: true },
    ).populate("assignedTo", "name email avatarUrl");
    if (!v) return res.status(404).json({ message: "Không tìm thấy voucher" });
    res.json({ success: true, voucher: v });
  } catch (e) {
    next(e);
  }
};

/* ── ADMIN: eligible customers for this voucher ── */
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

/* ── CLIENT: my vouchers ── */
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

/* ── CLIENT: validate at checkout ── */
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
    // freeship → discount = 0, xử lý riêng ở checkout

    res.json({
      success: true,
      voucher: {
        _id: v._id,
        code: v.code,
        description: v.description,
        type: v.type,
        value: v.value,
      },
      discount,
      finalAmount: Math.max(0, orderAmount - discount),
    });
  } catch (e) {
    next(e);
  }
};

/* ── Util: mark used — gọi từ order.service ── */
export const markVoucherUsed = (voucherId, userId) =>
  Voucher.findByIdAndUpdate(voucherId, { $addToSet: { usedBy: userId } });
