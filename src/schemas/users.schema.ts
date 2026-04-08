import { z } from 'zod';

// Schema untuk CREATE user
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama tidak boleh kosong')
    .max(255, 'Nama maksimal 255 karakter'),

  age: z
    .number()
    .int('Umur harus bilangan bulat')
    .min(1, 'Umur minimal 1 tahun')
    .max(150, 'Umur tidak valid'),

  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter'),
});

// Schema untuk UPDATE user (semua field optional)
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama tidak boleh kosong')
    .max(255, 'Nama maksimal 255 karakter')
    .optional(),

  age: z
    .number()
    .int('Umur harus bilangan bulat')
    .min(1, 'Umur minimal 1 tahun')
    .max(150, 'Umur tidak valid')
    .optional(),

  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .optional(),
});

// Schema untuk validasi ID parameter
export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
});

// Infer TypeScript types dari schema
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;