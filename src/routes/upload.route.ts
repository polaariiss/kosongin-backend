import { Router } from 'express';
import { validateBody } from '../middlewares/validation.middleware';
import { uploadSignatureSchema } from '../validations/upload.validation';
import { getUploadSignature } from '../controllers/upload.controller';

const router = Router();

router.post('/signature', validateBody(uploadSignatureSchema), getUploadSignature);

export default router;
