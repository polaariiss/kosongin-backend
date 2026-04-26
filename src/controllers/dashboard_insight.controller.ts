import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware';
import * as query from '../query/dashboard_insight.query';
import NodeCache from 'node-cache';

// Inisialisasi Cache
// stdTTL: 30 detik data akan kadaluarsa
// checkperiod: 90 detik untuk membersihkan data lama secara berkala
// deleteOnExpire: true (otomatis hapus saat expired)
// useClone: false untuk performa (mengembalikan referensi asli)
const dashboardCache = new NodeCache({
  stdTTL: 30,
  checkperiod: 90,
  deleteOnExpire: true,
  useClones: false,
});

export const getPersonalInsightData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user.id;
  const cacheKey = `dashboard_${userId}`;

  try {
    // 1. Cek Cache
    const cachedData = dashboardCache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: 'data berhasil diambil (cached)',
        data: cachedData,
      });
    }

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [
      logs,
      weeklyResults,
      monthlyResults,
      wishlistValue,
      active_challengeValue,
    ] = await Promise.all([
      query.getUniqueConsumptionDates(userId),
      query.getConsumptionSummary(userId, sevenDaysAgo),
      query.getConsumptionSummary(userId, thirtyDaysAgo),
      query.getActiveWishlistCount(userId),
      query.getActiveChallengeCount(userId),
    ]);

    let streakValue = 0;
    if (logs.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const latestLogDate = new Date(logs[0]!.date);
      latestLogDate.setHours(0, 0, 0, 0);

      if (latestLogDate >= yesterday) {
        streakValue = 1;
        for (let i = 0; i < logs.length - 1; i++) {
          const current = new Date(logs[i]!.date);
          const nextDate = new Date(logs[i + 1]!.date);
          current.setHours(0, 0, 0, 0);
          nextDate.setHours(0, 0, 0, 0);

          const diffInTime = current.getTime() - nextDate.getTime();
          const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));

          if (diffInDays === 1) {
            streakValue++;
          } else {
            break;
          }
        }
      }
    }

    const formatted_weekly_summary = formatSummary(weeklyResults);
    const formatted_monthly_summary = formatSummary(monthlyResults);

    const data = {
      streak: streakValue,
      weekly_summary: formatted_weekly_summary,
      monthly_summary: formatted_monthly_summary,
      wishlist_count: wishlistValue,
      active_challenge: active_challengeValue,
    };

    dashboardCache.set(cacheKey, data);

    return res.status(200).json({
      success: true,
      message: 'data berhasil diambil',
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

///////////////////////////////
// Helper
//////////////////////////////

const allConsumptionCategory = [
  'makanan & minuman',
  'fashion',
  'elektronik',
  'hiburan',
  'lainnya',
];

const formatSummary = (dbResults: any[]) => {
  return allConsumptionCategory.map((cat) => {
    const found = dbResults.find((res) => res.category === cat);
    return {
      category: cat,
      total: found ? Number(found.total) : 0,
    };
  });
};
