import { z } from 'zod';

export const uploadSignatureSchema = z.object({
  folderType: z.enum(['consumption', 'challenge']),
});

export type UploadSignatureRequest = z.infer<typeof uploadSignatureSchema>;
