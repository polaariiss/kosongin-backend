import { Router } from 'express';
import { verifyToken, authorizeRole } from '../middlewares/auth.middleware';
import * as dashboardController from '../controllers/admin_dashboard.controller';
import * as challengeController from '../controllers/challenges.controller';
import { validateBody } from '../middlewares/validation.middleware';
import {
  createChallengeSchema,
  updateChallengeSchema,
} from '../schemas/challenges.schema';

const router = Router();

// Middleware global untuk semua rute admin
router.use(verifyToken);
router.use(authorizeRole(['admin']));

// ==========================================
// 1. DASHBOARD & USER MANAGEMENT
// ==========================================

// overview stats
router.get('/stats', dashboardController.getOverviewStats);

// data pengguna
router.get('/users', dashboardController.getUsersLists);
router.get('/users/export', dashboardController.exportUsers); // return downloadable csv

// monitoring aktivitas
router.get('/monitoring', dashboardController.getMonitoringInsight);

// ==========================================
// 2. CHALLENGE MANAGEMENT
// ==========================================

router.get('/challenges', challengeController.getAllChallengesAdmin);

router.post(
  '/challenges',
  validateBody(createChallengeSchema as any),
  challengeController.createChallenge,
);

router.put(
  '/challenges/:id',
  validateBody(updateChallengeSchema as any),
  challengeController.updateChallenge,
);

router.delete('/challenges/:id', challengeController.deleteChallenge);

export default router;
