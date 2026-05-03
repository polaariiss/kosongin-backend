import z from 'zod';

export const reminderSettingsSchema = z
  .object({
    opt_in: z.boolean(),
    reminder_time: z
      .string()
      .regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Format waktu harus HH:mm')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.opt_in === false && data.reminder_time !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'reminder_time tidak boleh diisi jika opt_in bernilai false',
        path: ['reminder_time'],
      });
    }
  });
