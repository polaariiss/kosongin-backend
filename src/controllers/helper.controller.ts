import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { admin, users } from '../db/schema';
import { ApiError } from '../utility/api-error';
import { registerAdminSchema } from '../schemas/helper.schema';
import { eq, or } from 'drizzle-orm';
import 'dotenv/config';

/// admin

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

//// users

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fullName, nickName, email, password } = req.body;
    const newUser = await db
      .insert(users)
      .values({ fullName, nickName, email, password })
      .returning();
    res.status(201).json(newUser[0]);
  } catch (error) {
    next(new ApiError(500, 'Failed to add user'));
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Karena kita mendaftarkan `{ schema }` di config, kita bisa pakai format query API yang modern seperti ini:
    const getAllUsers = await db.query.users.findMany();
    res.json(getAllUsers);
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch users'));
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Hapus parseInt, langsung ambil string-nya
    const id = req.params.id as string;

    const user = await db.select().from(users).where(eq(users.id, id));

    if (user.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    res.json(user[0]);
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch user'));
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Hapus parseInt, langsung ambil string-nya
    const id = req.params.id as string;

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (deletedUser.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(new ApiError(500, 'Failed to delete user'));
  }
};
