import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import {updateReminderSettigns, getProfile} from '../controllers/profile.controller'

const router = Router();

router.get('/', verifyToken, getProfile);
router.patch('/reminder-settings', verifyToken, updateReminderSettigns)

export default router;