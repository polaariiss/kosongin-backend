import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as query from '../query/dashboard_insight.query.js';
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
      dailyTrendResults,
      weeklyTrendResults,
      wishlistValue,
      active_challengeValue,
    ] = await Promise.all([
      query.getUniqueConsumptionDates(userId),
      query.getConsumptionSummary(userId, sevenDaysAgo),
      query.getConsumptionSummary(userId, thirtyDaysAgo),
      query.getDailyConsumptionTrend(userId, sevenDaysAgo),
      query.getWeeklyConsumptionTrend(userId),
      query.getActiveWishlistCount(userId),
      query.getActiveChallengeCount(userId),
    ]);

    // Format daily trend (ensure all 7 days are present)
    const daily_trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const found = dailyTrendResults.find(r => {
        // Ambil bagian YYYY-MM-DD dari string atau Date
        // Cast ke any untuk menghindari error TS2358 saat build
        const rDateRaw = r.date as any;
        const rDate = (rDateRaw instanceof Date) 
          ? rDateRaw.toISOString().split('T')[0] 
          : String(rDateRaw).split('T')[0]; 
        return rDate === dateStr;
      });
      
      daily_trend.push({
        date: dateStr,
        total: found ? Number(found.total) : 0
      });
    }

    // Format weekly trend (last 4 weeks)
    const weekly_trend = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - (i * 7));
      
      // Get ISO week string (YYYY-WW)
      const year = d.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const days = Math.floor((d.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
      const weekStr = `${year}-${String(weekNum).padStart(2, '0')}`;

      const found = weeklyTrendResults.find(r => String(r.week) === weekStr);
      
      weekly_trend.push({
        label: i === 0 ? "Minggu Ini" : `${i} Minggu Lalu`,
        week: weekStr,
        total: found ? Number(found.total) : 0
      });
    }

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
      daily_trend,
      weekly_trend,
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
  'perawatan diri',
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
