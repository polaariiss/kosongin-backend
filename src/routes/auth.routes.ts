import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema.js';

const router = Router();
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', verifyToken, logout);
router.post(
  '/forgot-password',
  validateBody(forgetPasswordSchema),
  forgotPassword,
);
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  resetPassword,
);

export default router;
