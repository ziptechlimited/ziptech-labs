import express from 'express';
import { protect } from '../middleware/authMiddleware';
import Support from '../models/Support';
import Goal from '../models/Goal';
import { requireVerified } from '../middleware/verifiedMiddleware';

const router = express.Router();

// @desc    Add support to a goal
// @route   POST /api/support/:goalId
// @access  Private
router.post('/:goalId', protect, requireVerified, async (req, res) => {
    const { type, message } = req.body;
    const goalId = req.params.goalId;

    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!['support', 'help', 'endorse'].includes(type)) {
            return res.status(400).json({ message: 'Invalid support type' });
        }

        const goal = await Goal.findById(goalId);
        if (!goal || goal.type !== 'public') {
            return res.status(404).json({ message: 'Goal not found' });
        }
        if (goal.user.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot back your own commitment' });
        }
        if (type === 'help' && !String(message ?? '').trim()) {
            return res.status(400).json({ message: 'Tell them how you can help' });
        }

        // Get current week
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now.getTime() - start.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const week = Math.floor(diff / oneWeek);

        // Check if already supported this week
        const existing = await Support.findOne({
            goal: goalId,
            user: req.user.id,
            type,
            week
        });

        if (existing) {
            return res.status(400).json({ message: `You already sent ${({ support: 'support', endorse: 'an endorsement', help: 'a help offer' } as Record<string, string>)[type]} on this commitment` });
        }

        const support = await Support.create({
            goal: goalId,
            user: req.user.id,
            type,
            message,
            week
        });

        await support.populate('user', 'name');
        res.status(201).json(support);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get support for a goal
// @route   GET /api/support/:goalId
// @access  Private
router.get('/:goalId', protect, requireVerified, async (req, res) => {
    try {
        const support = await Support.find({ goal: req.params.goalId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json(support);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
