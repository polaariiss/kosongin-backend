import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validation.middleware';
import {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

const router = Router();
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', verifyToken, logout);
router.post('/forgot-password', validateBody(forgetPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

export default router;
