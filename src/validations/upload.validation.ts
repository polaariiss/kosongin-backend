import { z } from 'zod';

export const uploadSignatureSchema = z.object({
  fileName: z.string().min(1, 'fileName tidak boleh kosong'),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/jpg'], {
    message:
      'fileType harus salah satu dari: image/jpeg, image/png, image/jpg',
  }),
});

export type UploadSignatureInput = z.infer<typeof uploadSignatureSchema>;