import { Router } from 'express';
import usersRoute from './users.route';
import consumptionRoute from './comsumptions.route'

const router = Router();

// Semua route didaftarkan disini
router.use('/users', usersRoute);
router.use('/consumptions', consumptionRoute);

export default router;