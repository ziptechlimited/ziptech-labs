import express from 'express';
import { createCheckIn, getCheckIns } from '../controllers/checkInController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createCheckIn);
router.get('/', protect, getCheckIns);

export default router;
