import { db } from '../config/db';
import {
  consumptionLogs,
  ConsumptionCategory,
} from '../db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export interface CreateConsumptionData {
  itemName: string;
  itemCategory: ConsumptionCategory;
  itemCategoryCustom?: string;
  imageUrl?: string | null;
  amount?: number;
  notes?: string;
  consumedAt?: string;
}

export interface GetLogsOptions {
  category?: ConsumptionCategory;
  sortBy?: 'consumedAt' | 'amount' | 'createdAt';
  order?: 'asc' | 'desc';
}

export const insertLog = async (data: CreateConsumptionData, userId: string) => {
  return await db
    .insert(consumptionLogs)
    .values({
      userId: userId,
      itemName: data.itemName,
      itemCategory: data.itemCategory,
      itemCategoryCustom: data.itemCategoryCustom,
      imageUrl: data.imageUrl,
      amount: data.amount?.toString(),
      notes: data.notes,
      consumedAt: data.consumedAt ? new Date(data.consumedAt) : undefined,
    })
    .returning();
};

export const findLogs = async (options: GetLogsOptions, userId: string) => {
  const { category, sortBy = 'consumedAt', order = 'desc' } = options;

  let conditions = eq(consumptionLogs.userId, userId);

  if (category) {
    conditions = and(conditions, eq(consumptionLogs.itemCategory, category))!;
  }

  const orderBy =
    order === 'desc'
      ? desc(consumptionLogs[sortBy])
      : asc(consumptionLogs[sortBy]);

  return await db
    .select()
    .from(consumptionLogs)
    .where(conditions)
    .orderBy(orderBy);
};

export const findLogById = async (id: string) => {
  const result = await db
    .select()
    .from(consumptionLogs)
    .where(eq(consumptionLogs.id, id))
    .limit(1);
  return result[0];
};

export const updateLogById = async (
  id: string,
  data: Partial<CreateConsumptionData>,
) => {
  const updateData: any = {};

  if (data.itemName) updateData.itemName = data.itemName;
  if (data.itemCategory) updateData.itemCategory = data.itemCategory;
  if (data.itemCategoryCustom)
    updateData.itemCategoryCustom = data.itemCategoryCustom;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.amount !== undefined) updateData.amount = data.amount?.toString();
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.consumedAt) updateData.consumedAt = new Date(data.consumedAt);

  return await db
    .update(consumptionLogs)
    .set(updateData)
    .where(eq(consumptionLogs.id, id))
    .returning();
};

export const deleteLogById = async (id: string) => {
  return await db
    .delete(consumptionLogs)
    .where(eq(consumptionLogs.id, id))
    .returning();
};
