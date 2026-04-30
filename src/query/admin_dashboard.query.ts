import {
  challenges,
  ChallengeStatus,
  consumptionLogs,
  ImpulseStatus,
  userActivityLogs,
  userChallenges,
  users,
  wishlists,
} from '../db/schema';
import { db } from '../config/db';
import { and, asc, count, desc, eq, ilike, or, sql, gte } from 'drizzle-orm';

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
    .select()
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

export const getItemConsumptionEachDayAMonth = async () => {
  return await db
    .select({
      date: sql<String>`DATE(${consumptionLogs.createdAt})`,
      totalItems: count(consumptionLogs.id),
    })
    .from(consumptionLogs)
    .where(gte(consumptionLogs.createdAt, sql`NOW() - INTERVAL '30 days'`))
    .groupBy(sql`DATE(${consumptionLogs.createdAt})`)
    .orderBy(sql`DATE(${consumptionLogs.createdAt}) ASC`);
};

export const getActiveUsersEachDayAMonth = async () => {
  return await db
    .select({
      date: sql<String>`DATE(${userActivityLogs.createdAt})`,
      totalActiveUsers: count(userActivityLogs.userId),
    })
    .from(userActivityLogs)
    .where(gte(userActivityLogs.createdAt, sql`NOW() - INTERVAL '30 days'`))
    .groupBy(sql`DATE(${userActivityLogs.createdAt})`)
    .orderBy(sql`DATE(${userActivityLogs.createdAt}) ASC`);
};

export const getTopChallenges = async () => {
  return await db
    .select({
      challengeTitle: challenges.title,
      totalParticipants: count(userChallenges.userId),
    })
    .from(userChallenges)
    .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
    .groupBy(userChallenges.challengeId, challenges.title)
    .orderBy(desc(count(userChallenges.userId)))
    .limit(3);
};
