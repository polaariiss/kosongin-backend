import { Router } from 'express';
import { createConsumptionLog } from '../controllers/consumptions.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { createLogSchema } from '../schemas/consumptions.schema';

const router = Router();

// Endpoint: POST /api/consumption-logs
// 'image' adalah nama key/field di Postman atau form HTML
router.post('/', validateBody(createLogSchema), createConsumptionLog);

export default router;
