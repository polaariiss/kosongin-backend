import { Router } from 'express';
import { createAdminAccount } from '../controllers/helper.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { registerAdminSchema } from '../schemas/helper.schema';

const router = Router();

router.post(
  '/create-admin', 
  validateBody(registerAdminSchema),
  createAdminAccount
);

export default router;
