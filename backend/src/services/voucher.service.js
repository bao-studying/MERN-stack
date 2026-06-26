import Voucher from "../models/voucher.model.js";
import VoucherUsageLog from "../models/voucherUsageLog.model.js";
import User from "../models/user.js";
import Order from "../models/order.js";

/**
 * Tính segment của 1 khách NGAY LẬP TỨC, dựa trên đơn hàng thật trong collection Order.
 * Dùng để admin xem TRƯỚC khi tặng voucher, hoặc để Dashboard hiển thị nhóm khách —
 * không phụ thuộc VoucherUsageLog (khác với cách tính cũ chỉ chạy sau khi order
 * vừa hoàn tất và ghi log).
 *
 * Lưu ý quan trọng: Order model dùng status "delivered" (không phải "completed"
 * như bản cũ), và field tiền là totalAmount_cents (không phải "total").
 * Bản cũ dùng sai cả hai field này nên luôn trả về "new" cho mọi khách.
 *
 * Trả về: "new" | "loyal" | "one-time" | "at-risk" | "high-value"
 */
export const getUserSegment = async (userId) => {
  try {
    const orders = await Order.find({
      userId,
      status: "delivered",
    }).select("totalAmount_cents createdAt");

    if (orders.length === 0) return "new";

    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter((o) => o.createdAt > sixtyDaysAgo);
    const veryRecentOrders = orders.filter((o) => o.createdAt > thirtyDaysAgo);

    // NEW: chỉ 1 đơn, mua trong 30 ngày gần nhất
    if (orders.length === 1 && veryRecentOrders.length === 1) {
      return "new";
    }

    // AT-RISK: từng mua ≥3 đơn nhưng im hơn 60 ngày
    if (orders.length >= 3 && recentOrders.length === 0) {
      return "at-risk";
    }

    // LOYAL: ≥5 đơn trong 60 ngày gần nhất
    if (recentOrders.length >= 5) {
      return "loyal";
    }

    // HIGH-VALUE: tổng chi tiêu > 50 triệu
    const totalSpent = orders.reduce(
      (sum, o) => sum + (o.totalAmount_cents || 0),
      0,
    );
    if (totalSpent > 50_000_000) {
      return "high-value";
    }

    // ONE-TIME: chỉ đúng 1 đơn (và không rơi vào "new" ở trên)
    if (orders.length === 1) {
      return "one-time";
    }

    // DEFAULT
    return "loyal";
  } catch (e) {
    console.error("getUserSegment error:", e);
    return "new";
  }
};

/**
 * Gắn segment cho danh sách users (dùng cho getEligibleUsers).
 * Chạy song song để không chậm khi danh sách dài.
 */
export const attachSegmentsToUsers = async (users) => {
  const segments = await Promise.all(users.map((u) => getUserSegment(u._id)));
  return users.map((u, i) => ({
    ...(u.toObject ? u.toObject() : u),
    segment: segments[i],
  }));
};

/**
 * Nhãn hiển thị tiếng Việt cho từng segment — dùng chung FE/BE nếu cần.
 */
export const SEGMENT_LABELS = {
  new: "Khách mới",
  loyal: "Khách thân thiết",
  "one-time": "Mua 1 lần",
  "at-risk": "Có nguy cơ rời bỏ",
  "high-value": "Khách VIP (chi tiêu cao)",
};

/**
 * Mark voucher as used + log vào VoucherUsageLog
 * Gọi từ order service khi order thành công
 */
export const markVoucherAsUsed = async (
  voucherId,
  userId,
  orderId,
  discountAmount,
  orderTotal,
  orderTotalAfter,
) => {
  try {
    // 1. Tìm user segment (dùng hàm mới, chuẩn theo Order model thật)
    const segment = await getUserSegment(userId);

    // 2. Log vào VoucherUsageLog
    const log = await VoucherUsageLog.create({
      voucherId,
      userId,
      orderId,
      discountAmount,
      orderTotal,
      orderTotalAfter,
      userSegment: segment,
      usedAt: new Date(),
    });

    // 3. Update Voucher stats
    await updateVoucherStats(voucherId);

    return log;
  } catch (e) {
    console.error("markVoucherAsUsed error:", e);
    throw e;
  }
};

/**
 * @deprecated Dùng getUserSegment thay thế (chuẩn theo Order model thật:
 * status "delivered", field totalAmount_cents). Giữ lại để không vỡ code cũ
 * nếu còn nơi khác import tên này.
 */
export const calculateUserSegment = async (userId) => {
  return getUserSegment(userId);
};

/**
 * Update Voucher stats từ VoucherUsageLog
 */
export const updateVoucherStats = async (voucherId) => {
  try {
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) return;

    // 1. Tính stats từ VoucherUsageLog
    const logs = await VoucherUsageLog.find({ voucherId });

    const timesUsed = logs.length;
    const totalRevenueImpact = logs.reduce(
      (sum, log) => sum + log.discountAmount,
      0,
    );
    const totalOrdersGenerated = logs.reduce(
      (sum, log) => sum + log.orderTotal,
      0,
    );

    // 2. Breakdown theo segment
    const bySegment = {
      new: { count: 0, discount: 0 },
      loyal: { count: 0, discount: 0 },
      oneTime: { count: 0, discount: 0 },
      atRisk: { count: 0, discount: 0 },
      highValue: { count: 0, discount: 0 },
    };

    logs.forEach((log) => {
      const seg = log.userSegment || "new";
      const key =
        seg === "one-time"
          ? "oneTime"
          : seg === "at-risk"
            ? "atRisk"
            : seg === "high-value"
              ? "highValue"
              : seg;
      if (bySegment[key]) {
        bySegment[key].count += 1;
        bySegment[key].discount += log.discountAmount;
      }
    });

    // 3. Update Voucher
    const timesGiven = voucher.assignedTo?.length || 0;
    const usageRate = timesGiven > 0 ? timesUsed / timesGiven : 0;

    await Voucher.findByIdAndUpdate(voucherId, {
      $set: {
        "stats.timesGiven": timesGiven,
        "stats.timesUsed": timesUsed,
        "stats.usageRate": usageRate,
        "stats.totalRevenueImpact": totalRevenueImpact,
        "stats.totalOrdersGenerated": totalOrdersGenerated,
        "stats.bySegment": bySegment,
        "stats.lastUsedAt":
          logs.length > 0 ? logs[logs.length - 1].usedAt : null,
      },
    });
  } catch (e) {
    console.error("updateVoucherStats error:", e);
  }
};

/**
 * Calculate tất cả user segments (cron job) — giữ nguyên, chỉ đổi sang hàm mới.
 */
export const recalculateAllUserSegments = async () => {
  try {
    const users = await User.find({}, "_id");
    for (const user of users) {
      await getUserSegment(user._id);
    }
    console.log(`Recalculated segments for ${users.length} users`);
  } catch (e) {
    console.error("recalculateAllUserSegments error:", e);
  }
};

/**
 * Get analytics data cho dashboard
 */
export const getAnalyticsData = async () => {
  try {
    const vouchers = await Voucher.find({ isActive: true });

    const totalSpent = vouchers.reduce(
      (sum, v) => sum + v.stats.totalRevenueImpact,
      0,
    );
    const totalCost = vouchers.reduce((sum, v) => sum + v.costToProduce, 0);
    const roi = totalCost > 0 ? ((totalSpent / totalCost) * 100).toFixed(2) : 0;

    const topVouchers = vouchers
      .sort((a, b) => b.stats.totalRevenueImpact - a.stats.totalRevenueImpact)
      .slice(0, 5);

    const vouchersNeedAttention = vouchers
      .filter((v) => v.stats.usageRate < 0.3 && v.stats.timesGiven > 0)
      .slice(0, 5);

    return {
      kpi: {
        totalSpent,
        totalCost,
        roi,
        activeVouchers: vouchers.filter((v) => v.isActive).length,
      },
      topVouchers,
      vouchersNeedAttention,
    };
  } catch (e) {
    console.error("getAnalyticsData error:", e);
    throw e;
  }
};
