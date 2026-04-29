import { Router } from 'express';
import * as challengeController from '../controllers/challenges.controller';
import { verifyToken, authorizeRole } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { createChallengeSchema, updateChallengeSchema } from '../schemas/challenges.schema';

const router = Router();

// Semua endpoint admin challenge memerlukan login dan role admin
router.use(verifyToken);
router.use(authorizeRole(['admin']));

router.get('/', challengeController.getAllChallengesAdmin);

router.post(
  '/',
  validateBody(createChallengeSchema as any),
  challengeController.createChallenge
);

router.put(
  '/:id',
  validateBody(updateChallengeSchema as any),
  challengeController.updateChallenge
);

router.delete(
  '/:id',
  challengeController.deleteChallenge
);

export default router;
