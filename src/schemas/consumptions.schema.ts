import { z } from 'zod';
import { ConsumptionCategory } from '../db/schema';

export const ConsumptionCategorySchema = z.nativeEnum(ConsumptionCategory);

export const createLogSchema = z.object({
  userId: z.string().uuid("User ID harus berupa UUID"),
  itemName: z.string().min(1, "Nama item wajib diisi"),
  itemCategory: ConsumptionCategorySchema,
  itemCategoryCustom: z.string().max(100, "Nama kategori kustom maksimal 100 karakter").optional(),
  imageUrl: z.string().url("Format image URL tidak valid").optional().nullable(),
  amount: z.coerce.number().optional(),
  notes: z.string().optional(),
  consumedAt: z.string().datetime().optional(),
});

export const updateLogSchema = createLogSchema.partial().omit({ userId: true });

export const logIdSchema = z.object({
  id: z.string().uuid("ID log harus berupa UUID"),
});

export const getLogsQuerySchema = z.object({
  category: z.nativeEnum(ConsumptionCategory).optional(),
  sortBy: z.enum(['consumedAt', 'amount', 'createdAt']).optional().default('consumedAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});
