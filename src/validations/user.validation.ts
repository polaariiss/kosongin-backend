import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string()
    .min(3, "Username minimal 3 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Format email salah"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

// Zod bisa otomatis membuatkan Type (Interface) TypeScript dari skema di atas!
export type CreateUserInput = z.infer<typeof createUserSchema>;