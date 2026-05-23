import { Router } from 'express';
import { createAdminAccount } from '../controllers/helper.controller.js';
import {
  validateParams,
  validateBody,
} from '../middlewares/validation.middleware.js';

import { registerAdminSchema } from '../schemas/helper.schema.js';

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '../schemas/users.schema.js';
import {
  createUser,
  getAllUsers,
  getUserById,
} from '../controllers/helper.controller.js';

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
