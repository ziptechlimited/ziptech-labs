import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';
import { startSession, stopSession } from '../controllers/checkInSessionController';

const router = express.Router();

router.post('/start', protect, requireVerified, startSession);
router.post('/stop', protect, requireVerified, stopSession);

export default router;
