import { Router } from 'express';
import { 
  createConsumptionLog, 
  getConsumptionLogs, 
  updateConsumptionLog, 
  deleteConsumptionLog 
} from '../controllers/consumptions.controller';
import { 
  validateBody, 
  validateParams, 
  validateQuery 
} from '../middlewares/validation.middleware';
import { 
  createLogSchema, 
  updateLogSchema, 
  logIdSchema, 
  getLogsQuerySchema 
} from '../schemas/consumptions.schema';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/consumptions — tambah log konsumsi baru
router.post(
  '/', 
  verifyToken,
  validateBody(createLogSchema), 
  createConsumptionLog
);

// GET /api/consumptions — ambil semua log milik user yang login (support filter & sort)
router.get(
  '/', 
  verifyToken,
  validateQuery(getLogsQuerySchema), 
  getConsumptionLogs
);

// PUT /api/consumptions/:id — edit log konsumsi
router.put(
  '/:id', 
  verifyToken,
  validateParams(logIdSchema), 
  validateBody(updateLogSchema), 
  updateConsumptionLog
);

// DELETE /api/consumptions/:id — hapus log konsumsi
router.delete(
  '/:id', 
  verifyToken,
  validateParams(logIdSchema), 
  deleteConsumptionLog
);

export default router;
