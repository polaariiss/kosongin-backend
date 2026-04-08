import { Router } from 'express';
import usersRoute from './users.route';

const router = Router();

// Semua route didaftarkan disini
router.use('/users', usersRoute);

export default router;