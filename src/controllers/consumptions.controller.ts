import type { Request, Response, NextFunction } from 'express';
import {
  insertLog,
  findLogs,
  findLogById,
  updateLogById,
  deleteLogById,
} from '../query/consumptions.query';
import { db } from '../config/db';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { userActivityLogs, ActivityType } from '../db/schema';
import { ApiError } from '../utility/api-error';

export const createConsumptionLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newLog = await insertLog(req.body, req.user.id);

    await db.insert(userActivityLogs).values({
      userId: req.user.id,
      activityType: ActivityType.ADD_CONSUMPTION,
    });

    res.status(201).json({
      message: 'Log konsumsi berhasil dicatat',
      data: newLog[0],
    });
  } catch (error) {
    console.error('Error create log:', error);
    next(new ApiError(500, 'Gagal membuat log konsumsi'));
  }
};

export const getConsumptionLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, sortBy, order } = req.query as any;
    const userId = req.user.id;

    const logs = await findLogs({ category, sortBy, order }, userId);
    res.json(logs);
  } catch (error) {
    console.error('Error fetch logs:', error);
    next(new ApiError(500, 'Gagal mengambil log konsumsi'));
  }
};

export const updateConsumptionLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user.id;

    const updatedLog = await updateLogById(id, userId, req.body);

    if (updatedLog.length === 0) {
      throw new ApiError(
        404,
        'Log tidak ditemukan atau Anda tidak memiliki akses',
      );
    }

    res.json({
      message: 'Log konsumsi berhasil diperbarui',
      data: updatedLog[0],
    });
  } catch (error) {
    console.error('Error update log:', error);
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, 'Gagal memperbarui log konsumsi'),
    );
  }
};

export const deleteConsumptionLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user.id;

    const deletedLog = await deleteLogById(id, userId);

    if (deletedLog.length === 0) {
      throw new ApiError(
        404,
        'Log tidak ditemukan atau Anda tidak memiliki akses',
      );
    }

    res.json({ message: 'Log konsumsi berhasil dihapus' });
  } catch (error) {
    console.error('Error delete log:', error);
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, 'Gagal menghapus log konsumsi'),
    );
  }
};
