import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { db } from '../config/db';
import { ApiError } from '../utility/api-error';

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
