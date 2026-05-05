import { eq } from 'drizzle-orm';
import { users, admin, tokenBlacklists } from '../db/schema.js';
import { db } from '../config/db.js';

import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utility/api-error.js';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { authCache } from '../utility/cache.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // cek token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Akses ditolak. Token tidak ditemukan.'));
  }

  const token = authHeader.split(' ')[1] as string;

  // 1. Cek Cache terlebih dahulu
  const cachedUser = authCache.get<any>(`token:${token}`);
  if (cachedUser) {
    req.user = cachedUser;
    return next();
  }

  try {
    // 2. Cek DB (Blacklist & User Info) jika tidak ada di cache
    const [blacklist] = await db
      .select()
      .from(tokenBlacklists)
      .where(eq(tokenBlacklists.token, token));
    if (blacklist) {
      return next(
        new ApiError(401, 'token sudah tidak valid. Silahkan login kembali'),
      );
    }

    // verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      id: string;
    };
    req.user = decoded;

    // cek DB user/admin
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));
    if (userData) {
      req.user.role = 'user';
    } else {
      const [adminData] = await db
        .select()
        .from(admin)
        .where(eq(admin.id, decoded.id));
      if (adminData) {
        req.user.role = 'admin';
      } else {
        throw new ApiError(401, 'User tidak ditemukan atau token invalid');
      }
    }

    // 3. Simpan ke Cache dengan TTL sesuai sisa masa aktif token
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp ? decoded.exp - now : 86400;
    if (remainingSeconds > 0) {
      authCache.set(`token:${token}`, req.user, remainingSeconds);
    }

    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token sudah kadaluarsa'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Token tidak valid'));
    }
    next(error);
  }
};

// Middleware untuk otorisasi RBAC
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Anda tidak memiliki izin'));
    }
    next();
  };
};
