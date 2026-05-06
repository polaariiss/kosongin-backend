import { db } from '../config/db.js';
import {
  wishlists,
  ImpulseStatus,
  ConsumptionCategory,
  DaysDurationWait,
} from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export interface CreateWishlistData {
  itemName: string;
  itemCategory: ConsumptionCategory;
  itemCategoryCustom?: string;
  estimatePrice: number;
  waitingDays: DaysDurationWait;
  reason?: string;
}

export const insertWishlist = async (
  data: CreateWishlistData,
  userId: string,
) => {
  return await db
    .insert(wishlists)
    .values({
      userId,
      itemName: data.itemName,
      itemCategory: data.itemCategory,
      itemCategoryCustom: data.itemCategoryCustom,
      estimatePrice: data.estimatePrice.toString(),
      waitingDays: data.waitingDays,
      reason: data.reason,
      whislistStatus: ImpulseStatus.WAITING,
    })
    .returning();
};

export const findWishlistsByUserId = async (userId: string) => {
  const result = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, userId))
    .orderBy(desc(wishlists.createdAt));

  return result.map((item) => {
    const createdAt = new Date(item.createdAt);
    const now = new Date();

    // Menggunakan selisih waktu milidetik untuk akurasi lebih baik (24 jam per hari)
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, item.waitingDays - diffDays);

    return {
      ...item,
      wishlistDaysRemaining: remaining,
    };
  });
};

export const findWishlistById = async (id: string) => {
  const result = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.id, id))
    .limit(1);
  return result[0];
};

export const updateWishlistStatus = async (id: string, status: string) => {
  return await db
    .update(wishlists)
    .set({
      whislistStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(wishlists.id, id))
    .returning();
};
