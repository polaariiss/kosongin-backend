import { db } from '../config/db';
import { challenges, userChallenges, users, ChallengeStatus } from '../db/schema';
import { eq, and, gt, sql, count } from 'drizzle-orm';

export const findActiveChallenges = async () => {
  const now = new Date();
  const result = await db
    .select()
    .from(challenges)
    .where(
      and(
        eq(challenges.status, ChallengeStatus.ACTIVE),
        gt(challenges.endDate, now)
      )
    );

  // Add participant count for each challenge
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
    })
  );

  return challengesWithCount;
};

export const findAllChallenges = async () => {
  const result = await db
    .select()
    .from(challenges);

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
    })
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
  return await db
    .delete(challenges)
    .where(eq(challenges.id, id))
    .returning();
};

export const insertUserChallenge = async (userId: string, challengeId: string) => {
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

export const findUserChallenge = async (userId: string, challengeId: string) => {
  const [result] = await db
    .select()
    .from(userChallenges)
    .where(
      and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId)
      )
    );
  return result;
};
