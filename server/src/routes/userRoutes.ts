import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';
import {
  getUserPublic,
  updateMe,
  getUserStats,
  getMyRecord,
  getWatchlist,
  toggleWatchlist,
} from '../controllers/userController';

const router = express.Router();

// Owner routes don't require verification so new founders can build their profile right away.
router.get('/me/record', protect, getMyRecord);
router.patch('/me', protect, updateMe);
router.get('/me/watchlist', protect, requireVerified, getWatchlist);
router.post('/me/watchlist/:founderId', protect, requireVerified, toggleWatchlist);
router.get('/:id', protect, requireVerified, getUserPublic);
router.get('/:id/stats', protect, requireVerified, getUserStats);

export default router;
