import z from 'zod';

export const createChallengeSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  fullDescription: z.string().min(1, 'Deskripsi lengkap wajib diisi'),
  rules: z.string().min(1, 'Rules wajib diisi'),
  howTo: z.string().min(1, 'How to wajib diisi'),
  category: z.string().min(1, 'Category wajib diisi'),
  imageUrl: z.string().url('URL poster tidak valid').optional(),
  durationDays: z.number().int().positive().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, 'Format tanggal harus YYYY-MM-DD HH:MM:SS'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, 'Format tanggal harus YYYY-MM-DD HH:MM:SS'),
});

export const updateChallengeSchema = createChallengeSchema.partial().extend({
  status: z.enum(['active', 'inactive']).optional(),
});
