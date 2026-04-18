import type { Request, Response, NextFunction } from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { reminderSettingsSchema } from '../schemas/profile.schema';
import { ApiError } from '../utility/api-error';

// const db = drizzle(process.env.DATABASE_URL!);

// GET /profile  | id user sudah diperoleh di dalam JWT (req.user.id)
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [user] = await db
      .select({
        fullName: users.fullName,
        nickName: users.nickName,
        email: users.email,
        reminderEnabled: users.reminderEnabled,
        reminderTime: users.reminderTime,
      })
      .from(users)
      .where(eq(users.id, req.user.id));
    if (!user) {
      // return res.status(404).json({ message: 'User tidak ditemukan' });
      return next(new ApiError(404, 'user tidak ditemukan'));
    }
    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

// PATCH /profile/reminder-settings
export const updateReminderSettigns = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = reminderSettingsSchema.parse(req.body);

    await db
      .update(users)
      .set({
        reminderEnabled: parsed.opt_in,
        reminderTime: parsed.reminder_time,
      })
      .where(eq(users.id, req.user.id));

    return res
      .status(200)
      .json({ message: 'Reminder settings berhasil diupdate' });
  } catch (error) {
    next(error);
  }
};
