import type { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary';
import { ApiError } from '../utility/api-error';

export const getUploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { folderType } = req.body;
    const timestamp = Math.round(new Date().getTime() / 1000);

    let folder = '';
    if (folderType === 'consumption') {
      folder = process.env.UPLOAD_CONSUMPTION_FOLDER || '';
    } else if (folderType === 'challenge') {
      folder = process.env.UPLOAD_CHALLENGE_POSTER_FOLDER || '';
    } 

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
    next(new ApiError(500, 'Gagal generate signature'));
  }
};
