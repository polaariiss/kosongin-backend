import { db } from '../config/db';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';
import * as tables from '../db/schema';

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
