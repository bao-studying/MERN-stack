import Voucher from "../models/voucher.model.js";
import VoucherUsageLog from "../models/voucherUsageLog.model.js";
import User from "../models/user.js";

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
    // 1. Tìm user segment
    const segment = await calculateUserSegment(userId);

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
 * Calculate user segment dựa trên purchase history
 * "new" | "loyal" | "one-time" | "at-risk" | "high-value"
 */
export const calculateUserSegment = async (userId) => {
  try {
    // Giả sử Order model có structure: {userId, total, createdAt, status: "completed"}
    // Adjust theo thực tế của bạn
    const orders = await (
      await import("../models/order.model.js")
    ).default.find({ userId, status: "completed" });

    if (orders.length === 0) return "new";

    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter((o) => o.createdAt > sixtyDaysAgo);
    const veryRecentOrders = orders.filter((o) => o.createdAt > thirtyDaysAgo);

    // NEW: purchased < 30 days
    if (veryRecentOrders.length === 1 && veryRecentOrders[0]) {
      return "new";
    }

    // AT-RISK: 3+ purchases nhưng không mua 60 ngày
    if (orders.length >= 3 && recentOrders.length === 0) {
      return "at-risk";
    }

    // LOYAL: 5+ purchases trong 60 ngày
    if (recentOrders.length >= 5) {
      return "loyal";
    }

    // HIGH-VALUE: tổng tiền > 50 triệu
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    if (totalSpent > 50_000_000) {
      return "high-value";
    }

    // ONE-TIME: chỉ 1 purchase
    if (orders.length === 1) {
      return "one-time";
    }

    // DEFAULT
    return "loyal";
  } catch (e) {
    console.error("calculateUserSegment error:", e);
    return "new";
  }
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
 * Calculate tất cả user segments (cron job)
 * Chạy mỗi đêm để refresh segmentation
 */
export const recalculateAllUserSegments = async () => {
  try {
    const users = await User.find({}, "_id");
    for (const user of users) {
      await calculateUserSegment(user._id);
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
