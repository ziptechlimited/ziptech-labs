import express from 'express';
import { createCheckIn, getCheckIns } from '../controllers/checkInController';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';

const router = express.Router();

router.post('/', protect, requireVerified, createCheckIn);
router.get('/', protect, requireVerified, getCheckIns);

export default router;
