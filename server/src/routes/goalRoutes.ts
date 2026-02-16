import express from 'express';
import { createGoal, getGoals, updateGoal } from '../controllers/goalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createGoal);
router.get('/', protect, getGoals);
router.patch('/:id', protect, updateGoal);

export default router;
