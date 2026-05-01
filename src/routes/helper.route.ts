import { Router } from 'express';
import { createAdminAccount } from '../controllers/helper.controller';
import {
  validateParams,
  validateBody,
} from '../middlewares/validation.middleware';

import { registerAdminSchema } from '../schemas/helper.schema';

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '../schemas/users.schema';
import {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from '../controllers/helper.controller';

const router = Router();

/// Target: admin

router.post(
  '/admin/create',
  validateBody(registerAdminSchema),
  createAdminAccount,
);

/// Target: User

router.post('/users/create', validateBody(createUserSchema), createUser);
router.get('/users/get/all', getAllUsers);
router.get('/users/get/:id', validateParams(userIdSchema), getUserById);
router.put(
  '/users/update/:id',
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
);

export default router;
