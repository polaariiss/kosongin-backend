import { Router } from 'express';
import { getUploadSignature } from '../controllers/upload.controller';

const router = Router();

// POST /api/upload/signature — untuk mendapatkan pre-signed URL (signature) dari Cloudinary
router.post('/signature', getUploadSignature);

export default router;
