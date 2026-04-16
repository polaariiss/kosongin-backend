import { Router } from 'express';
import usersRoute from './users.route';
import consumptionRoute from './comsumptions.route';
import uploadRoute from './upload.route';
import authRoute from './auth.routes';

const router = Router();

// Semua route didaftarkan disini
router.use('/users', usersRoute);
router.use('/upload', uploadRoute);
router.use('/consumption-logs', consumptionRoute);
router.use('/auth', authRoute);

export default router;
