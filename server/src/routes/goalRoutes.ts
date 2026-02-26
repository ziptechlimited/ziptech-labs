import express from 'express';
import { createGoal, getGoals, updateGoal } from '../controllers/goalController';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';

const router = express.Router();

router.post('/', protect, requireVerified, createGoal);
router.get('/', protect, requireVerified, getGoals);
router.patch('/:id', protect, requireVerified, updateGoal);

export default router;
