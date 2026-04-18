import { Router } from 'express';
import {
  createWishlist,
  getWishlists,
  updateWishlist,
} from '../controllers/wishlist.controller';
import {
  validateBody,
  validateParams,
} from '../middlewares/validation.middleware';
import {
  createWishlistSchema,
  updateWishlistSchema,
  wishlistIdSchema,
} from '../schemas/wishlist.schema';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// POST /wishlist — tambah item wishlist baru
router.post(
  '/',
  verifyToken,
  validateBody(createWishlistSchema),
  createWishlist
);

// GET /wishlist — ambil semua item wishlist milik user
router.get('/', verifyToken, getWishlists);

// PATCH /wishlist/:id — update status item (misal: tandai sudah beli / dibatalkan)
router.patch(
  '/:id',
  verifyToken,
  validateParams(wishlistIdSchema),
  validateBody(updateWishlistSchema),
  updateWishlist
);

export default router;
