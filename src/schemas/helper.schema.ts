import { z } from 'zod';

// Schema untuk CREATE user
export const registerAdminSchema = z.object({
  nickname: z
    .string()
    .min(3, 'Nickname minimal 3 karakter')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Nickname hanya boleh berisi huruf, angka, dan underscore',
    )
    .max(255),
  fullname: z.string().min(1, 'Fullname wajib diisi').max(255),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  passwordConfirmation: z
    .string()
    .min(8, 'Password confirmation minimal 8 karakter'),
  specialCode: z.number(),
});
