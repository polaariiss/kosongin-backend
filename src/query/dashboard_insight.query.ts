import { db } from '../config/db.js';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';
import * as tables from '../db/schema.js';

export const getUniqueConsumptionDates = async (userId: string) => {
  return await db
    .select({
      date: sql<string>`DATE(${tables.consumptionLogs.consumedAt})`.as('date'),
    })
    .from(tables.consumptionLogs)
    .where(eq(tables.consumptionLogs.userId, userId))
    .groupBy(sql`DATE(${tables.consumptionLogs.consumedAt})`)
    .orderBy(desc(sql`DATE(${tables.consumptionLogs.consumedAt})`));
};

export const getConsumptionSummary = async (userId: string, since: Date) => {
  return await db
    .select({ category: tables.consumptionLogs.itemCategory, total: count() })
    .from(tables.consumptionLogs)
    .where(
      and(
        eq(tables.consumptionLogs.userId, userId),
        gte(tables.consumptionLogs.consumedAt, since),
      ),
    )
    .groupBy(tables.consumptionLogs.itemCategory);
};

export const getActiveWishlistCount = async (userId: string) => {
  const result = await db
    .select({ value: count() })
    .from(tables.wishlists)
    .where(
      and(
        eq(tables.wishlists.userId, userId),
        eq(tables.wishlists.whislistStatus, tables.ImpulseStatus['WAITING']),
      ),
    );
  return Number(result[0]?.value ?? 0);
};

export const getActiveChallengeCount = async (userId: string) => {
  const result = await db
    .select({ value: count() })
    .from(tables.userChallenges)
    .where(eq(tables.userChallenges.userId, userId));
  return Number(result[0]?.value ?? 0);
};

export const getDailyConsumptionTrend = async (userId: string, since: Date) => {
  return await db
    .select({
      date: sql<string>`DATE(${tables.consumptionLogs.consumedAt})`.as('date'),
      total: sql<number>`SUM(${tables.consumptionLogs.amount})`.as('total'),
    })
    .from(tables.consumptionLogs)
    .where(
      and(
        eq(tables.consumptionLogs.userId, userId),
        gte(tables.consumptionLogs.consumedAt, since),
      ),
    )
    .groupBy(sql`DATE(${tables.consumptionLogs.consumedAt})`)
    .orderBy(sql`DATE(${tables.consumptionLogs.consumedAt}) ASC`);
};

export const getWeeklyConsumptionTrend = async (userId: string) => {
  // Ambil total per minggu untuk 4 minggu terakhir
  return await db
    .select({
      week: sql<string>`TO_CHAR(${tables.consumptionLogs.consumedAt}, 'IYYY-IW')`.as('week'),
      total: sql<number>`SUM(${tables.consumptionLogs.amount})`.as('total'),
    })
    .from(tables.consumptionLogs)
    .where(
      and(
        eq(tables.consumptionLogs.userId, userId),
        gte(tables.consumptionLogs.consumedAt, sql`NOW() - INTERVAL '4 weeks'`),
      ),
    )
    .groupBy(sql`TO_CHAR(${tables.consumptionLogs.consumedAt}, 'IYYY-IW')`)
    .orderBy(sql`TO_CHAR(${tables.consumptionLogs.consumedAt}, 'IYYY-IW') ASC`);
};
