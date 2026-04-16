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

const router = Router();

// POST /api/consumptions — tambah log konsumsi baru
router.post(
  '/', 
  validateBody(createLogSchema), 
  createConsumptionLog
);

// GET /api/consumptions — ambil semua log milik user yang login (support filter & sort)
router.get(
  '/', 
  validateQuery(getLogsQuerySchema), 
  getConsumptionLogs
);

// PUT /api/consumptions/:id — edit log konsumsi
router.put(
  '/:id', 
  validateParams(logIdSchema), 
  validateBody(updateLogSchema), 
  updateConsumptionLog
);

// DELETE /api/consumptions/:id — hapus log konsumsi
router.delete(
  '/:id', 
  validateParams(logIdSchema), 
  deleteConsumptionLog
);

export default router;
