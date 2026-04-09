import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from '../db/schema';

const db = drizzle(process.env.DATABASE_URL!);

export const createUser = async (req: Request, res: Response) => {
  try {
    const { fullName, nickName, email, password } = req.body;
    const newUser = await db
      .insert(users)
      .values({ fullName, nickName, email, password })
      .returning();
    res.status(201).json(newUser[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const getAllUsers = await db.select().from(users);
    res.json(getAllUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    // Hapus parseInt, langsung ambil string-nya
    const id = req.params.id as string; 
    
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // Hapus parseInt, langsung ambil string-nya
    const id = req.params.id as string; 
    
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};