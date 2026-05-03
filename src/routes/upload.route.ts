import { Router } from 'express';
import { getUploadSignature } from '../controllers/upload.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { uploadSignatureSchema } from '../schemas/upload.schema.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/upload/signature — untuk mendapatkan pre-signed URL (signature) dari Cloudinary
router.post('/signature', verifyToken, validateBody(uploadSignatureSchema), getUploadSignature);

export default router;
