import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  updateReminderSettigns,
  getProfile,
  deleteUser
} from '../controllers/profile.controller.js';

const router = Router();

router.get('/', verifyToken, getProfile);
router.patch('/reminder-settings', verifyToken, updateReminderSettigns);
router.post('/delete-user', verifyToken, deleteUser)
export default router;
