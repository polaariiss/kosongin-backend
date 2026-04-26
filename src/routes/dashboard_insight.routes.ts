import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as service from '../controllers/dashboard_insight.controller';

const router = Router();

router.get('/', verifyToken, service.getPersonalInsightData);

export default router;
