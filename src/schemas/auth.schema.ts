import z, { email } from 'zod';

export const registerSchema = z.object({
  nickname: z.string().min(1).max(255),
  fullname: z.string().min(1).max(255),
  email: z.string().email('Invalid email address').max(255),
  password: z.string(),
  passwordConfirmation: z.string(),
});

export const loginSchema = z
  .object({
    email: z.string().email('Invalid email address').max(255).optional(),
    nickname: z.string().min(1).max(255).optional(),
    password: z.string(),
  })
  .refine((data) => data.email || data.nickname, {
    message: 'Either email or nickname is required',
  });

export const forgetPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
});

export const resetPasswordSchema = z.object({
  password: z.string(),
  passwordConfirmation: z.string(),
  token: z.string(),
});
