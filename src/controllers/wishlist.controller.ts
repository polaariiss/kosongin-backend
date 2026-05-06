import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as wishlistQuery from '../query/wishlist.query.js';
import { ApiError } from '../utility/api-error.js';

export const createWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const [wishlist] = await wishlistQuery.insertWishlist(req.body, userId);

    res.status(201).json({
      status: 'success',
      message: 'wishlist created!',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const wishlists = await wishlistQuery.findWishlistsByUserId(userId);

    res.status(200).json({
      status: 'success',
      message: 'wishlist get!',
      data: wishlists,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params['id'] as string;
    const { whislistStatus } = req.body;

    const wishlist = await wishlistQuery.findWishlistById(id);
    if (!wishlist) {
      throw new ApiError(404, 'Wishlist item tidak ditemukan');
    }

    // Ensure the item belongs to the user
    if (wishlist.userId !== req.user.id) {
      throw new ApiError(403, 'Anda tidak memiliki akses ke item ini');
    }

    // Logic: Jika status diubah ke BOUGHT, pastikan masa tunggu sudah selesai
    if (whislistStatus === 'bought') {
      const createdAt = new Date(wishlist.createdAt);
      const diffTime = Date.now() - createdAt.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < wishlist.waitingDays) {
        throw new ApiError(
          400,
          `Masa tunggu belum selesai. Sisa ${wishlist.waitingDays - diffDays} hari lagi.`,
        );
      }
    }

    const [updatedWishlist] = await wishlistQuery.updateWishlistStatus(
      id,
      whislistStatus,
    );

    res.status(200).json({
      status: 'success',
      message: 'wishlist updated',
      data: updatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};
