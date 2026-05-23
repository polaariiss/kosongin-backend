import { Router } from 'express';
import consumptionRoute from './consumptions.route.js';
import uploadRoute from './upload.route.js';
import authRoute from './auth.routes.js';
import profileRoute from './profile.route.js';
import wishlistRoute from './wishlist.route.js';
import dashboardInsightRoute from './dashboard_insight.routes.js';
import challengeRoute from './challenges.route.js';
import adminRoute from './admin.route.js';
import helperRoute from './helper.route.js';

const router = Router();

// Semua route didaftarkan disini
router.use('/consumption-logs', consumptionRoute);
router.use('/upload', uploadRoute);
router.use('/auth', authRoute);
router.use('/profile', profileRoute);
router.use('/wishlist', wishlistRoute);
router.use('/dashboard/insight', dashboardInsightRoute);
router.use('/challenges', challengeRoute);
router.use('/admin', adminRoute);
router.use('/helper', helperRoute);

export default router;
