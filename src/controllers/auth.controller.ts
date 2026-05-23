import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  users,
  tokenBlacklists,
  passwordResetToken,
  userActivityLogs,
  ActivityType,
  admin,
} from '../db/schema.js';
import { sendResetPasswordEmail } from '../utility/mail.service.js';
import { resetPasswordSchema } from '../schemas/auth.schema.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { db } from '../config/db.js';
import { ApiError } from '../utility/api-error.js';
import { authCache } from '../utility/cache.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'rahasia_refresh';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = req.body;
    // check uniqueness in both users and admin tables
    let check = parsed.nickname;
    let [userCheck] = await db
      .select()
      .from(users)
      .where(eq(users.nickName, parsed.nickname));

    if (!userCheck) {
      [userCheck] = (await db
        .select()
        .from(admin)
        .where(eq(admin.nickName, parsed.nickname))) as any[];
    }

    if (!userCheck) {
      check = parsed.email;
      [userCheck] = await db
        .select()
        .from(users)
        .where(eq(users.email, parsed.email));

      if (!userCheck) {
        [userCheck] = (await db
          .select()
          .from(admin)
          .where(eq(admin.email, parsed.email))) as any[];
      }
    }

    if (userCheck) {
      throw new ApiError(409, `${check} is already exist`);
    }

    // check password & passwordConfirmation
    if (parsed.password !== parsed.passwordConfirmation) {
      throw new ApiError(400, "passwod didn't match with confirmation");
    }
    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    // insert new user to db
    const [result] = await db
      .insert(users)
      .values({
        nickName: parsed.nickname,
        fullName: parsed.fullname,
        email: parsed.email,
        password: hashedPassword,
      })
      .returning({ id: users.id });

    await db.insert(userActivityLogs).values({
      userId: result?.id as string,
      activityType: ActivityType.REGISTER,
    });

    // return response
    return res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = req.body;

    // 1. Cari di tabel users dulu
    let userChecked: any = parsed.email
      ? (await db.select().from(users).where(eq(users.email, parsed.email)))[0]
      : (
          await db
            .select()
            .from(users)
            .where(eq(users.nickName, parsed.nickname!))
        )[0];

    let role = 'user';

    // 2. Kalau tidak ada di users, cari di tabel admin
    if (!userChecked) {
      userChecked = parsed.email
        ? (
            await db.select().from(admin).where(eq(admin.email, parsed.email))
          )[0]
        : (
            await db
              .select()
              .from(admin)
              .where(eq(admin.nickName, parsed.nickname!))
          )[0];

      if (userChecked) {
        role = 'admin';
      }
    }

    if (!userChecked) {
      throw new ApiError(401, 'Email / Nickname salah');
    }

    const isPasswordValid = await bcrypt.compare(
      parsed.password,
      userChecked.password,
    );

    if (!isPasswordValid) {
      throw new ApiError(401, 'Password salah');
    }

    const payload = {
      id: userChecked.id,
      role: role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '6h' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    // Simpan refreshToken ke DB
    if (role === 'user') {
      await db
        .update(users)
        .set({ refreshToken })
        .where(eq(users.id, userChecked.id));
    } else {
      await db
        .update(admin)
        .set({ refreshToken })
        .where(eq(admin.id, userChecked.id));
    }

    // Log aktivitas hanya untuk user biasa
    if (role === 'user') {
      await db.insert(userActivityLogs).values({
        userId: userChecked.id,
        activityType: ActivityType.LOGIN,
      });

      await db
        .update(users)
        .set({ isActive: true })
        .where(eq(users.id, userChecked.id));
    }

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

    let user;
    if (decoded.role === 'user') {
      [user] = await db.select().from(users).where(eq(users.id, decoded.id));
    } else {
      [user] = await db.select().from(admin).where(eq(admin.id, decoded.id));
    }

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const payload = { id: user.id, role: decoded.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '6h' });

    return res.status(200).json({
      success: true,
      message: 'token refreshed',
      data: { accessToken },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid refresh token'));
    } else {
      next(error);
    }
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader!.split(' ')[1] as string;

    const decoded = req.user as JwtPayload;
    const expiredAt = new Date(decoded.exp! * 1000);

    // insert token ke db
    await db.insert(tokenBlacklists).values({ token, expiredAt });

    // Hapus dari cache
    authCache.del(`token:${token}`);

    if (decoded.role === 'user') {
      await db
        .update(users)
        .set({ refreshToken: null })
        .where(eq(users.id, decoded.id));

      await db
        .update(users)
        .set({ isActive: false })
        .where(eq(users.id, decoded.id));
    } else {
      await db
        .update(admin)
        .set({ refreshToken: null })
        .where(eq(admin.id, decoded.id));
    }

    return res.status(200).json({
      success: true,
      message: 'logout berhasil',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(
        parsed.email
          ? eq(users.email, parsed.email)
          : eq(users.nickName, parsed.nickname),
      );

    if (user) {
      // generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

      // simpan ke tabel password_reset_token
      await db.insert(passwordResetToken).values({
        userId: user.id,
        token: resetToken,
        expiresAt,
      });

      // kirim email
      await sendResetPasswordEmail(user.email, resetToken);
    }

    return res.status(200).json({
      success: true,
      message: 'Jika email terdaftar, link reset akan dikirim.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = resetPasswordSchema.parse(req.body);

    // cek password & passwordConfirmation
    if (parsed.password !== parsed.passwordConfirmation) {
      throw new ApiError(400, "password and confirmation didn't match");
    }

    // cari token valid
    const [resetRecord] = await db
      .select()
      .from(passwordResetToken)
      .where(eq(passwordResetToken.token, parsed.token));
    if (!resetRecord) {
      throw new ApiError(400, 'token invalid');
    }

    // cek apakah token sudah dipakai
    if (resetRecord.usedAt) {
      throw new ApiError(400, 'token already use');
    }

    // cek apakah token sudah expired
    if (new Date() > resetRecord.expiresAt) {
      throw new ApiError(400, 'token is expired');
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    // update password user (cek isActive)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, resetRecord.userId));

    if (!user || !user.isActive) {
      throw new ApiError(400, 'Akun tidak aktif atau tidak ditemukan');
    }

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetRecord.userId));

    // tandai token sebagai sudah dipakai
    await db
      .update(passwordResetToken)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetToken.token, parsed.token));

    return res.status(200).json({
      success: true,
      message: 'password berhasil direset',
    });
  } catch (error) {
    next(error);
  }
};
