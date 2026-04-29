import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware';
import * as challengeQuery from '../query/challenges.query';
import { ApiError } from '../utility/api-error';

export const getActiveChallenges = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const challenges = await challengeQuery.findActiveChallenges();
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar challenge aktif',
      data: challenges,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyChallenges = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const challenges = await challengeQuery.findUserChallengesByUserId(userId);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar challenge yang diikuti',
      data: challenges,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllChallengesAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const challenges = await challengeQuery.findAllChallenges();
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua daftar challenge',
      data: challenges,
    });
  } catch (error) {
    next(error);
  }
};

export const getChallengeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) throw new ApiError(400, 'ID challenge wajib diisi');

    const challenge = await challengeQuery.findChallengeById(id);
    if (!challenge) {
      throw new ApiError(404, 'Challenge tidak ditemukan');
    }
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail challenge',
      data: challenge,
    });
  } catch (error) {
    next(error);
  }
};

export const joinChallenge = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: challengeId } = req.params as { id: string };
    const userId = req.user.id;

    if (!challengeId) throw new ApiError(400, 'ID challenge wajib diisi');

    // Cek apakah challenge ada
    const challenge = await challengeQuery.findChallengeById(challengeId);
    if (!challenge) {
      throw new ApiError(404, 'Challenge tidak ditemukan');
    }

    // Cek apakah sudah join
    const alreadyJoined = await challengeQuery.findUserChallenge(userId, challengeId);
    if (alreadyJoined) {
      throw new ApiError(400, 'Anda sudah bergabung dalam challenge ini');
    }

    const joined = await challengeQuery.insertUserChallenge(userId, challengeId);
    res.status(201).json({
      success: true,
      message: 'Berhasil bergabung dalam challenge',
      data: joined[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getParticipants = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: challengeId } = req.params as { id: string };
    if (!challengeId) throw new ApiError(400, 'ID challenge wajib diisi');

    const participants = await challengeQuery.findParticipantsByChallengeId(challengeId);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar peserta',
      data: participants,
    });
  } catch (error) {
    next(error);
  }
};

// Admin Controllers
export const createChallenge = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, ...rest } = req.body;
    const dbData = {
      ...rest,
      categoryTag: category,
    };
    
    const [newChallenge] = await challengeQuery.insertChallenge(dbData);
    res.status(201).json({
      success: true,
      message: 'Berhasil membuat challenge baru',
      data: newChallenge,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChallenge = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) throw new ApiError(400, 'ID challenge wajib diisi');

    const { category, ...rest } = req.body;
    const dbData = {
      ...rest,
    };
    if (category) dbData.categoryTag = category;
    
    const [updatedChallenge] = await challengeQuery.updateChallenge(id, dbData);
    if (!updatedChallenge) {
      throw new ApiError(404, 'Challenge tidak ditemukan');
    }
    
    res.status(200).json({
      success: true,
      message: 'Berhasil memperbarui data challenge',
      data: updatedChallenge,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChallenge = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) throw new ApiError(400, 'ID challenge wajib diisi');

    const [deletedChallenge] = await challengeQuery.deleteChallengeById(id);
    if (!deletedChallenge) {
      throw new ApiError(404, 'Challenge tidak ditemukan');
    }
    
    res.status(200).json({
      success: true,
      message: 'Berhasil menghapus challenge',
      data: deletedChallenge,
    });
  } catch (error) {
    next(error);
  }
};
