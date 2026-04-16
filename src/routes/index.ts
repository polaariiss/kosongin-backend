import { Router } from 'express';
import usersRoute from './users.route';
import consumptionRoute from './consumption-logs.route'
import uploadRoute from './upload.route'

const router = Router();

// Semua route didaftarkan disini
router.use('/users', usersRoute);
router.use('/consumption-logs', consumptionRoute);
router.use('/upload', uploadRoute);

export default router;
