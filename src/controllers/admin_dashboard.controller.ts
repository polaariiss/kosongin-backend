import type { Request, Response, NextFunction } from 'express';
import * as query from '../query/admin_dashboard.query.js';
import * as fastcsv from 'fast-csv';
import { users } from '../db/schema.js';
import { db } from '../config/db.js';
import { ApiError } from '../utility/api-error.js';
import {eq } from 'drizzle-orm';

export const getOverviewStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const total_users = await query.getTotalUsers();
    const total_consumption_logs = await query.getTotalConsumptionLogs();
    const total_cancelled_impulse = await query.getCancelledImpulse();
    const total_active_challenges = await query.getTotalActiveChallenges();

    const returnData = {
      totalUsers: total_users,
      totalConsumptionLogs: total_consumption_logs,
      totalCancelledImpulse: total_cancelled_impulse,
      totalActiveChallenges: total_active_challenges,
    };

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data overview',
      data: returnData,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersLists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, status, page, limit } = req.query;
    const paramsData = {
      search: search as string,
      status: status as 'active' | 'inactive',
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    };
    const result = await query.getUsersPagination(paramsData);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar pengguna',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const exportUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await query.getAllUsersForExport();

    // Set Header Response agar browser mengenalinya sebagai file CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=users_export_' + Date.now() + '.csv',
    );

    // Konfigurasi Fast-CSV untuk menulis ke stream response Express
    const csvStream = fastcsv.format({
      headers: [
        'Nama Panggilan',
        'Nama Lengkap',
        'Email',
        'Status Aktif',
        'Tanggal Daftar',
      ],
    });

    csvStream.pipe(res);

    data.forEach((user) => {
      csvStream.write([
        user.nickName,
        user.fullName,
        user.email,
        user.isActive ? 'Aktif' : 'Tidak Aktif',
        user.createdAt.toISOString(),
      ]);
    });

    csvStream.end();
  } catch (error) {
    next(error);
  }
};

export const getMonitoringInsight = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const daily_active_users = await query.getActiveUsersEach7Day();
    const daily_logs = await query.getItemConsumptionEach7Day();
    const top_challenges = await query.getTopChallenges();

    const returnData = {
      dailyActiveUsers: daily_active_users,
      dailyLogs: daily_logs,
      topChallenges: top_challenges,
    };

    res.status(200).json({
      success: true,
      message: 'Data monitoring berhasil diambil',
      data: returnData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) {
      throw new ApiError(404, 'User not found');
    }
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};