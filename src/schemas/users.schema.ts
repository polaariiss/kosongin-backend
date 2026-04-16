import { z } from 'zod';

// Schema untuk CREATE user
export const createUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nama lengkap tidak boleh kosong')
    .max(255, 'Nama lengkap maksimal 255 karakter'),

  nickName: z
    .string()
    .min(1, 'Username tidak boleh kosong')
    .max(255, 'Username maksimal 255 karakter'),

  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter'),

  password: z
    .string()
    .min(8, 'Password minimal 8 karakter'),

  reminderTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:mm')
    .optional(),

  reminderEnabled: z
    .boolean()
    .optional(),
});

// Schema untuk UPDATE user (semua field optional)
export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nama lengkap tidak boleh kosong')
    .max(255, 'Nama lengkap maksimal 255 karakter')
    .optional(),

  nickName: z
    .string()
    .min(1, 'Username tidak boleh kosong')
    .max(255, 'Username maksimal 255 karakter')
    .optional(),

  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .optional(),

  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .optional(),

  reminderTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:mm')
    .optional(),

  reminderEnabled: z
    .boolean()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

// Schema untuk validasi ID parameter
export const userIdSchema = z.object({
  id: z.string().uuid('ID harus berupa UUID valid'),
});

// Infer TypeScript types dari schema
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
