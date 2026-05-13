import {
  challenges,
  ChallengeStatus,
  consumptionLogs,
  ImpulseStatus,
  userActivityLogs,
  userChallenges,
  users,
  wishlists,
} from '../db/schema.js';
import { db } from '../config/db.js';
import { and, asc, count, countDistinct, desc, eq, ilike, or, sql, gte } from 'drizzle-orm';

export const getTotalUsers = () => {
  return db.$count(users);
};

export const getTotalConsumptionLogs = () => {
  return db.$count(consumptionLogs);
};

export const getCancelledImpulse = () => {
  return db.$count(
    wishlists,
    eq(wishlists.whislistStatus, ImpulseStatus.CANCELLED),
  );
};

export const getTotalActiveChallenges = () => {
  return db.$count(challenges, eq(challenges.status, ChallengeStatus.ACTIVE));
};

interface ListUsersParams {
  search?: string; // Untuk nama atau email
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export const getUsersPagination = async (params: ListUsersParams) => {
  const { search, status, page = 1, limit = 10 } = params;

  const conditions = [];

  // pencarian nickname, fullname, atau email
  if (search) {
    conditions.push(
      or(
        ilike(users.nickName, `%${search}%`),
        ilike(users.fullName, `%${search}%`),
        ilike(users.email, `%${search}%`),
      ),
    );
  }

  // filter status
  if (status) {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') {
      conditions.push(eq(users.isActive, true));
    } else if (statusLower === 'inactive') {
      conditions.push(eq(users.isActive, false));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 1. Ambil total data dengan filter yang sama
  const [totalResult] = await db
    .select({ count: count() })
    .from(users)
    .where(whereClause);

  const total = Number(totalResult?.count ?? 0);

  // 2. Ambil data pagination
  const data = await db
    .select({
      id: users.id,
      nickname: users.nickName,
      fullName: users.fullName,
      email: users.email,
      createdAt: users.createdAt,
      isActive: users.isActive,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    },
  };
};

export const getAllUsersForExport = async () => {
  return await db
    .select({
      nickName: users.nickName,
      fullName: users.fullName,
      email: users.email,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
};

export const getItemConsumptionEach7Day = async () => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const result = await db
    .select({
      date: sql<string>`DATE(${consumptionLogs.createdAt})`,
      totalItems: count(consumptionLogs.id),
    })
    .from(consumptionLogs)
    .where(gte(consumptionLogs.createdAt, sql`NOW() - INTERVAL '6 days'`))
    .groupBy(sql`DATE(${consumptionLogs.createdAt})`)
    .orderBy(sql`DATE(${consumptionLogs.createdAt}) ASC`);

  return (last7Days as string[]).map((targetDate) => {
    const found = result.find((r) => {
      const rawDate = r.date as any;
      let rDate = "";
      if (rawDate instanceof Date) {
        rDate = rawDate.toISOString().split('T')[0]!;
      } else {
        rDate = String(rawDate || "");
      }
      return rDate.includes(targetDate);
    });
    return {
      date: targetDate,
      totalItems: found ? Number(found.totalItems) : 0,
    };
  });
};

export const getActiveUsersEach7Day = async () => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const result = await db
    .select({
      date: sql<string>`DATE(${userActivityLogs.createdAt})`,
      totalActiveUsers: countDistinct(userActivityLogs.userId),
    })
    .from(userActivityLogs)
    .where(gte(userActivityLogs.createdAt, sql`NOW() - INTERVAL '7 days'`))
    .groupBy(sql`DATE(${userActivityLogs.createdAt})`)
    .orderBy(sql`DATE(${userActivityLogs.createdAt}) ASC`);

  return (last7Days as string[]).map((targetDate) => {
    const found = result.find((r) => {
      const rawDate = r.date as any;
      let rDate = "";
      if (rawDate instanceof Date) {
        rDate = rawDate.toISOString().split('T')[0]!;
      } else {
        rDate = String(rawDate || "");
      }
      return rDate.includes(targetDate);
    });
    return {
      date: targetDate,
      totalActiveUsers: found ? Number(found.totalActiveUsers) : 0,
    };
  });
};

export const getTopChallenges = async () => {
  return await db
    .select({
      title: challenges.title,
      participants: count(userChallenges.userId),
    })
    .from(userChallenges)
    .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
    .groupBy(userChallenges.challengeId, challenges.title)
    .orderBy(desc(count(userChallenges.userId)))
    .limit(3);
};