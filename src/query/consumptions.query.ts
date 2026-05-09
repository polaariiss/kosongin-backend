import { db } from '../config/db.js';
import { consumptionLogs, ConsumptionCategory } from '../db/schema.js';
import { eq, and, desc, asc, gte, lte } from 'drizzle-orm';

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
  startDate?: string;
  endDate?: string;
}

export const insertLog = async (
  data: CreateConsumptionData,
  userId: string,
) => {
  const insertValues: any = {
    userId: userId,
    itemName: data.itemName,
    itemCategory: data.itemCategory,
    itemCategoryCustom: data.itemCategoryCustom,
    imageUrl: data.imageUrl,
    amount: data.amount ? data.amount.toString() : '0',
    notes: data.notes,
  };

  if (data.consumedAt) {
    insertValues.consumedAt = new Date(data.consumedAt);
  }

  return await db.insert(consumptionLogs).values(insertValues).returning();
};

export const findLogs = async (options: GetLogsOptions, userId: string) => {
  const {
    category,
    sortBy = 'consumedAt',
    order = 'desc',
    startDate,
    endDate,
  } = options;

  let conditions = eq(consumptionLogs.userId, userId);

  if (category) {
    conditions = and(conditions, eq(consumptionLogs.itemCategory, category))!;
  }

  if (startDate) {
    conditions = and(
      conditions,
      gte(consumptionLogs.consumedAt, new Date(startDate)),
    )!;
  }

  if (endDate) {
    conditions = and(
      conditions,
      lte(consumptionLogs.consumedAt, new Date(endDate)),
    )!;
  }

  // Tentukan kolom sorting secara eksplisit agar type-safe
  let sortColumn;
  switch (sortBy) {
    case 'amount':
      sortColumn = consumptionLogs.amount;
      break;
    case 'createdAt':
      sortColumn = consumptionLogs.createdAt;
      break;
    case 'consumedAt':
    default:
      sortColumn = consumptionLogs.consumedAt;
      break;
  }

  const orderBy = order === 'desc' ? desc(sortColumn) : asc(sortColumn);

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
  userId: string,
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
    .where(and(eq(consumptionLogs.id, id), eq(consumptionLogs.userId, userId)))
    .returning();
};

export const deleteLogById = async (id: string, userId: string) => {
  return await db
    .delete(consumptionLogs)
    .where(and(eq(consumptionLogs.id, id), eq(consumptionLogs.userId, userId)))
    .returning();
};
