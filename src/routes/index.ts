import { Router } from 'express';
import usersRoute from './users.route';
import consumptionRoute from './consumptions.route';
import uploadRoute from './upload.route';
import authRoute from './auth.routes';
import profileRoute from './profile.route';

const router = Router();

// Semua route didaftarkan disini
router.use('/users', usersRoute);
router.use('/consumption-logs', consumptionRoute);
router.use('/upload', uploadRoute);
router.use('/consumption-logs', consumptionRoute);
router.use('/auth', authRoute);
router.use('/profile', profileRoute);

export default router;
