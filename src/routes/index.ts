import { Router } from 'express';
import usersRoute from './users.route';
import consumptionRoute from './comsumptions.route';
import uploadRoute from './upload.route';

const router = Router();

// Semua route didaftarkan disini
router.use('/users', usersRoute);
router.use('/upload', uploadRoute);
router.use('/consumptions', consumptionRoute);

export default router;
