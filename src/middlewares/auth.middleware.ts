import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users, admin, tokenBlacklists } from '../db/schema';

const db = drizzle(process.env.DATABASE_URL!);

import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { number } from 'zod/index.cjs';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: `Akses ditolak. Token tidak ditemukan.` });
  }

  const token = authHeader.split(' ')[1] as string;
  try {
    const [blacklist] = await db
      .select()
      .from(tokenBlacklists)
      .where(eq(tokenBlacklists.token, token));
    if (blacklist) {
      return res
        .status(401)
        .json({ message: 'token sudah tidak valid. Silahkan login kembali' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      id: string;
    };

    req.user = decoded;
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));
    if (userData) {
      req.user.role = 'user';
      return next();
    } else {
      const [adminData] = await db
        .select()
        .from(admin)
        .where(eq(admin.id, decoded.id));
      if (adminData) {
        req.user.role = 'admin';
        return next();
      }
    }

    // kalau tidak ada di tabel users dan admin
    return res
      .status(401)
      .json({ message: 'User tidak ditemukan atau token invalid' });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifikasi role' });
  }
};

// Middleware untuk otorisasi RBAC
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: 'Terlarang. Anda tidak memiliki izin.' });
    }
    next();
  };
};
