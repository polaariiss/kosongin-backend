import type { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

export const getUploadSignature = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'consumption';

    // Generate signature menggunakan Cloudinary API secret
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!,
    );

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        folder,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal generate signature' });
  }
};
