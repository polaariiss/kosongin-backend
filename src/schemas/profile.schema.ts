import z from 'zod';

export const reminderSettingsSchema = z.object({
  opt_in: z.boolean(),
  reminder_time: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Format waktu harus HH:mm')
    .optional(),
}); // kalau opt_in: false --> reminder_time tidak boleh diisi
