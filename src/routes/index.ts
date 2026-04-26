import { Router } from 'express';
import usersRoute from './users.route';
import consumptionRoute from './consumptions.route';
import uploadRoute from './upload.route';
import authRoute from './auth.routes';
import profileRoute from './profile.route';
import wishlistRoute from './wishlist.route';
import dashboardInsightRoute from './dashboard_insight.routes';

const router = Router();

// Semua route didaftarkan disini
router.use('/users', usersRoute);
router.use('/consumption-logs', consumptionRoute);
router.use('/upload', uploadRoute);
router.use('/auth', authRoute);
router.use('/profile', profileRoute);
router.use('/wishlist', wishlistRoute);
router.use('/dashboard/insight', dashboardInsightRoute);

export default router;
