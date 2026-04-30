import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { admin } from '../db/schema';
import { ApiError } from '../utility/api-error';
import { registerAdminSchema } from '../schemas/helper.schema';
import { eq, or } from 'drizzle-orm';
import 'dotenv/config';

export const createAdminAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = registerAdminSchema.parse(req.body);

    // Cek special code dari .env
    if (parsed.specialCode !== Number(process.env.ADMIN_SPECIAL_CODE)) {
      throw new ApiError(403, 'Special code is invalid');
    }

    // Cek duplikasi di tabel admin
    const [existingAdmin] = await db
      .select()
      .from(admin)
      .where(
        or(eq(admin.email, parsed.email), eq(admin.nickName, parsed.nickname)),
      );

    if (existingAdmin) {
      throw new ApiError(
        400,
        'Admin with this email or nickname already exists',
      );
    }

    if (parsed.password !== parsed.passwordConfirmation) {
      throw new ApiError(400, 'Password confirmation does not match');
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const [newAdmin] = await db
      .insert(admin)
      .values({
        email: parsed.email,
        nickName: parsed.nickname,
        fullName: parsed.fullname,
        password: hashedPassword,
      })
      .returning({
        id: admin.id,
        email: admin.email,
      });

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: newAdmin,
    });
  } catch (error) {
    next(error);
  }
};
