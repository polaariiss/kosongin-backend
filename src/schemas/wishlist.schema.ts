import { z } from 'zod';
import { ConsumptionCategory, DaysDurationWait, ImpulseStatus } from '../db/schema';

export const wishlistCategorySchema = z.nativeEnum(ConsumptionCategory);
export const wishlistStatusSchema = z.nativeEnum(ImpulseStatus);
export const waitingDaysSchema = z.nativeEnum(DaysDurationWait)

export const createWishlistSchema = z.object({
  itemName: z.string().min(1, 'Nama item wajib diisi'),
  itemCategory: wishlistCategorySchema,
  itemCategoryCustom: z
    .string()
    .max(100, 'Nama kategori kustom maksimal 100 karakter')
    .optional(),
  estimatetPrice: z.coerce.number().min(0, 'Harga harus lebih dari atau sama dengan 0'),
  waitingDays: waitingDaysSchema,
  reason: z.string().optional(),
});

export const updateWishlistSchema = z.object({
  whislistStatus: wishlistStatusSchema,
});

export const wishlistIdSchema = z.object({
  id: z.string().uuid('ID wishlist harus berupa UUID'),
});
