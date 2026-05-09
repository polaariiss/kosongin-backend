import { z } from 'zod';
import { ConsumptionCategory } from '../db/schema.js';

export const ConsumptionCategorySchema = z.nativeEnum(ConsumptionCategory);

const baseLogSchema = z.object({
  itemName: z.string().min(1, 'Nama item wajib diisi'),
  itemCategory: ConsumptionCategorySchema,
  itemCategoryCustom: z
    .string()
    .max(100, 'Nama kategori kustom maksimal 100 karakter')
    .optional()
    .nullable(),
  imageUrl: z
    .string()
    .url('Format image URL tidak valid')
    .optional()
    .nullable(),
  amount: z.coerce
    .number()
    .min(0, 'Jumlah harus lebih besar dari atau sama dengan 0'),
  notes: z.string().optional(),
  consumedAt: z.string().datetime().optional(),
});

export const createLogSchema = baseLogSchema.superRefine((data, ctx) => {
  const isOther = (data.itemCategory as string) === ConsumptionCategory.OTHER;
  const hasCustom =
    data.itemCategoryCustom && data.itemCategoryCustom.trim() !== '';

  if (isOther && !hasCustom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Kategori kustom wajib diisi jika memilih kategori 'lainnya'",
      path: ['itemCategoryCustom'],
    });
  } else if (!isOther && hasCustom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Kategori kustom hanya boleh diisi jika memilih kategori 'lainnya'",
      path: ['itemCategoryCustom'],
    });
  }
});

export const updateLogSchema = baseLogSchema
  .partial()
  .superRefine((data, ctx) => {
    const category = data.itemCategory;
    const custom = data.itemCategoryCustom;

    if (category !== undefined) {
      const isOther = (category as string) === ConsumptionCategory.OTHER;
      const hasCustom = custom && custom.trim() !== '';

      if (isOther && !hasCustom && custom !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Kategori kustom wajib diisi jika memilih kategori 'lainnya'",
          path: ['itemCategoryCustom'],
        });
      } else if (!isOther && hasCustom) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Kategori kustom hanya boleh diisi jika memilih kategori 'lainnya'",
          path: ['itemCategoryCustom'],
        });
      }
    }
  });

export const logIdSchema = z.object({
  id: z.string().uuid('ID log harus berupa UUID'),
});

export const getLogsQuerySchema = z.object({
  category: z.nativeEnum(ConsumptionCategory).optional(),
  sortBy: z
    .enum(['consumedAt', 'amount', 'createdAt'])
    .optional()
    .default('consumedAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
