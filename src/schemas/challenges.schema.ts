import { z } from 'zod';
import { challengesCategory, ChallengeStatus } from '../db/schema.js';

export const ChallengesCategorySchema = z.nativeEnum(challengesCategory);
export const ChallengeStatusSchema = z.nativeEnum(ChallengeStatus);

export const createChallengeSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  fullDescription: z.string().min(1, 'Deskripsi lengkap wajib diisi'),
  rules: z.string().optional().nullable(),
  howTo: z.string().optional().nullable(),
  challengesCategory: ChallengesCategorySchema,
  imageUrl: z.string().url('URL gambar tidak valid').optional().nullable(),
  sourceUrl: z.string().url('URL sumber tidak valid').optional().nullable(),
  durationDays: z.coerce.number().int().positive().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: ChallengeStatusSchema.optional().default(ChallengeStatus.ACTIVE),
});

export const updateChallengeSchema = createChallengeSchema.partial();

export const challengeIdSchema = z.object({
  id: z.string().uuid('ID challenge harus berupa UUID'),
});
