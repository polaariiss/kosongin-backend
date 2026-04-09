import { Router } from 'express';
import {
  validateBody,
  validateParams,
} from '../middlewares/validation.middleware';
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
} from '../controllers/users.controller';

const router = Router();

router.post('/', validateBody(createUserSchema), createUser);
router.get('/', getAllUsers);
router.get('/:id', validateParams(userIdSchema), getUserById);
router.put(
  '/:id',
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
);
router.delete('/:id', validateParams(userIdSchema), deleteUser);

export default router;