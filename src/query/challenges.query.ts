import { db } from '../config/db.js';
import {
  challenges,
  userChallenges,
  users,
  ChallengeStatus,
} from '../db/schema.js';
import { eq, and, or, gt, lte, isNull, sql, count  } from 'drizzle-orm';

export const findActiveChallenges = async () => {
  const now = new Date();
  const result = await db
    .select()
    .from(challenges)
    .where(
      and(
        eq(challenges.status, ChallengeStatus.ACTIVE),
        or(isNull(challenges.endDate), gt(challenges.endDate, now)),
      ),
    );

  // Add participant count and label for each challenge
  const challengesWithDetails = await Promise.all(
    result.map(async (c) => {
      const [countResult] = await db
        .select({ value: count() })
        .from(userChallenges)
        .where(eq(userChallenges.challengeId, c.id));

      const label =
        c.startDate === null || c.startDate <= now
          ? 'Sedang Berlangsung'
          : 'Akan Datang';

      return {
        ...c,
        participantCount: countResult ? Number(countResult.value) : 0,
        label,
      };
    }),
  );

  return challengesWithDetails;
};

export const findTopActiveChallenges = async () => {
  const now = new Date();
  
  // 1. Get active challenges
  const result = await db
    .select()
    .from(challenges)
    .where(
      and(
        eq(challenges.status, ChallengeStatus.ACTIVE),
        or(
          isNull(challenges.startDate),
          lte(challenges.startDate, now),
        ),
        or(
          isNull(challenges.endDate),
          gt(challenges.endDate, now),
        ),
      ),
    );

  // 2. Get participant counts and map
  const challengesWithCount = await Promise.all(
    result.map(async (c) => {
      const [countResult] = await db
        .select({ value: count() })
        .from(userChallenges)
        .where(eq(userChallenges.challengeId, c.id));
      return {
        id: c.id,
        title: c.title,
        challengesCategory: c.challengesCategory,
        description: c.description,
        imageUrl: c.imageUrl,
        durationDays: c.durationDays,
        participantCount: countResult ? Number(countResult.value) : 0,
      };
    }),
  );

  // 3. Sort by participant count descending and take top 5
  return challengesWithCount
    .sort((a, b) => b.participantCount - a.participantCount)
    .slice(0, 5);
};

export const findAllChallenges = async () => {
  const result = await db.select().from(challenges);

  const challengesWithCount = await Promise.all(
    result.map(async (c) => {
      const [countResult] = await db
        .select({ value: count() })
        .from(userChallenges)
        .where(eq(userChallenges.challengeId, c.id));
      return {
        ...c,
        participantCount: countResult ? Number(countResult.value) : 0,
      };
    }),
  );

  return challengesWithCount;
};

export const findChallengeById = async (id: string) => {
  const [challenge] = await db
    .select()
    .from(challenges)
    .where(eq(challenges.id, id));

  if (!challenge) return null;

  const [participantCount] = await db
    .select({ value: count() })
    .from(userChallenges)
    .where(eq(userChallenges.challengeId, id));

  return {
    ...challenge,
    participantCount: participantCount ? Number(participantCount.value) : 0,
  };
};

export const findParticipantsByChallengeId = async (challengeId: string) => {
  return await db
    .select({
      id: users.id,
      nickName: users.nickName,
      fullName: users.fullName,
      joinedAt: userChallenges.joinedAt,
    })
    .from(userChallenges)
    .innerJoin(users, eq(userChallenges.userId, users.id))
    .where(eq(userChallenges.challengeId, challengeId));
};

export const insertChallenge = async (data: any) => {
  return await db
    .insert(challenges)
    .values({
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    })
    .returning();
};

export const updateChallenge = async (id: string, data: any) => {
  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  return await db
    .update(challenges)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(challenges.id, id))
    .returning();
};

export const deleteChallengeById = async (id: string) => {
  return await db.delete(challenges).where(eq(challenges.id, id)).returning();
};

export const insertUserChallenge = async (
  userId: string,
  challengeId: string,
) => {
  return await db
    .insert(userChallenges)
    .values({
      userId,
      challengeId,
    })
    .returning();
};

export const findUserChallengesByUserId = async (userId: string) => {
  return await db
    .select({
      challengeId: userChallenges.challengeId,
      title: challenges.title,
      progress: userChallenges.progress,
      joinedAt: userChallenges.joinedAt,
    })
    .from(userChallenges)
    .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
    .where(eq(userChallenges.userId, userId));
};

export const findUserChallenge = async (
  userId: string,
  challengeId: string,
) => {
  const [result] = await db
    .select()
    .from(userChallenges)
    .where(
      and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId),
      ),
    );
  return result;
};
