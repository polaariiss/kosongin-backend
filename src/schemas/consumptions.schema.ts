import { z } from 'zod';

export const createLogSchema = z.object({
  userId: z.coerce.number({ error: 'User ID wajib diisi' }),
  title: z.string().min(1, 'Judul log wajib diisi'),
  description: z.string().optional(),
  amount: z.coerce.number().optional(),
  imageUrl: z.string().url(),
});
