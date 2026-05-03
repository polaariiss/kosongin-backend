import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import * as service from '../controllers/dashboard_insight.controller.js';

const router = Router();

router.get('/', verifyToken, service.getPersonalInsightData);

export default router;
