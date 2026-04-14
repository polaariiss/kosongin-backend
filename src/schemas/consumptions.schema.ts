import { z } from 'zod';
import { ConsumptionCategory } from '../db/schema';

export const createConsumptionLogSchema = z
  .object({
    userId: z.string(),
    itemName: z.string().min(1, 'Judul log wajib diisi'),
    itemCategory: z.enum(ConsumptionCategory),
    itemCategoryCustom: z.string().max(100).optional(),
    notes: z.string().optional(),
    amount: z.coerce.number().optional(),
    imageUrl: z.string().url(),
  })
  .refine(
    (data) => {
      if (data.itemCategory == ConsumptionCategory.OTHER) {
        return !!data.itemCategoryCustom?.trim();
      }
      return true;
    },
    {
      message: 'Custom category wajib diisi jika memilih "lainnya"',
      path: ['itemCategoryCustom'],
    },
  )
  .refine(
    (data) => {
      if (data.itemCategory !== ConsumptionCategory.OTHER) {
        return !data.itemCategoryCustom;
      }
      return true;
    },
    {
      message: 'Custom category hanya boleh diisi jika memilih "lainnya"',
      path: ['itemCategoryCustom'],
    },
  );
