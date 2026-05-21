import { Router } from 'express';
import * as challengeController from '../controllers/challenges.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Endpoints (No login required)
router.get('/landing-page-challenge', challengeController.getLandingPageChallenges);

// Semua endpoint di bawah ini memerlukan login
router.use(verifyToken);

// User Endpoints   
router.get('/', challengeController.getActiveChallenges);
router.get('/me', challengeController.getMyChallenges);
router.get('/:id', challengeController.getChallengeById);
router.post('/:id/join', challengeController.joinChallenge);
router.get('/:id/participants', challengeController.getParticipants);

export default router;
