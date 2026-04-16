import { Router } from 'express';
import usersRoute from './users.route';
import consumptionRoute from './comsumptions.route';
import uploadRoute from './upload.route';
import authRoute from './auth.routes';

const router = Router();

// Semua route didaftarkan disini
router.use('/users', usersRoute);
router.use('/consumption-logs', consumptionRoute);
router.use('/upload', uploadRoute);
<<<<<<< HEAD
router.use('/consumption-logs', consumptionRoute);
router.use('/auth', authRoute);
=======
>>>>>>> bf9f3dbe62002850366c96f41ca658a0fb02db7e

export default router;
