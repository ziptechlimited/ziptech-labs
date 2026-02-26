import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';
import { getUserPublic, updateMe, getUserStats } from '../controllers/userController';

const router = express.Router();

router.get('/:id', protect, requireVerified, getUserPublic);
router.get('/:id/stats', protect, requireVerified, getUserStats);
router.patch('/me', protect, requireVerified, updateMe);

export default router;
