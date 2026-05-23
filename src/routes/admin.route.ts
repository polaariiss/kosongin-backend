import { Router } from 'express';
import { verifyToken, authorizeRole } from '../middlewares/auth.middleware.js';
import * as dashboardController from '../controllers/admin_dashboard.controller.js';
import * as challengeController from '../controllers/challenges.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import {
  createChallengeSchema,
  updateChallengeSchema,
} from '../schemas/challenges.schema.js';

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
router.delete('/users/:id', dashboardController.deleteUser);

// monitoring aktivitas
router.get('/monitoring', dashboardController.getMonitoringInsight);

// ==========================================
// 2. CHALLENGE MANAGEMENT
// ==========================================

router.get('/challenges', challengeController.getAllChallengesAdmin);

router.post(
  '/challenges',
  validateBody(createChallengeSchema),
  challengeController.createChallenge,
);

router.put(
  '/challenges/:id',
  validateBody(updateChallengeSchema),
  challengeController.updateChallenge,
);

router.delete('/challenges/:id', challengeController.deleteChallenge);

export default router;
