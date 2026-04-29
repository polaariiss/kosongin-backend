import { Router } from 'express';
import * as challengeController from '../controllers/challenges.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Semua endpoint challenge memerlukan login
router.use(verifyToken);

// User Endpoints
router.get('/', challengeController.getActiveChallenges);
router.get('/me', challengeController.getMyChallenges);
router.get('/:id', challengeController.getChallengeById);
router.post('/:id/join', challengeController.joinChallenge);
router.get('/:id/participants', challengeController.getParticipants);

export default router;
