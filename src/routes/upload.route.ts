import { Router } from 'express';
import { getUploadSignature } from '../controllers/upload.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { uploadSignatureSchema } from '../schemas/upload.schema';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
// router.use(verifyToken);

// POST /api/upload/signature — untuk mendapatkan pre-signed URL (signature) dari Cloudinary
router.post('/signature', validateBody(uploadSignatureSchema), getUploadSignature);

export default router;
