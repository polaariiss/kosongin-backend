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
} from '../db/schema';
import { sendResetPasswordEmail } from '../utility/mail.service';
import { resetPasswordSchema } from '../schemas/auth.schema';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { db } from '../config/db';
import { ApiError } from '../utility/api-error';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = req.body;
    // check uniqueness
    let check = parsed.nickname;
    let [userCheck] = await db
      .select()
      .from(users)
      .where(eq(users.nickName, parsed.nickname));
    if (!userCheck) {
      check = parsed.email;
      [userCheck] = await db
        .select()
        .from(users)
        .where(eq(users.email, parsed.email));
    }

    if (userCheck) {
      throw new ApiError(400, `${check} is already exist`);
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

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    // Log aktivitas hanya untuk user biasa
    if (role === 'user') {
      await db.insert(userActivityLogs).values({
        userId: userChecked.id,
        activityType: ActivityType.LOGIN,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
    });
  } catch (error) {
    next(error);
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

    return res.status(200).json({ message: 'logout berhasil' });
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
      .where(eq(users.email, parsed.email));

    if (!user) {
      return res.status(404).json({
        message: 'Email tidak terdaftar',
      });
      throw new ApiError(404, "Email didn't exist");
    }

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

    return res.status(200).json({
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

    // update password user
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetRecord.userId));

    // tandai token sebagai sudah dipakai
    await db
      .update(passwordResetToken)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetToken.token, parsed.token));

    return res.status(200).json({ message: 'password berhasil direset' });
  } catch (error) {
    next(error);
  }
};
