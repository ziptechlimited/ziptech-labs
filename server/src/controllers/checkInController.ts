import { Request, Response } from 'express';
import CheckIn from '../models/CheckIn';
import Goal from '../models/Goal';

// @desc    Submit a check-in for a goal
// @route   POST /api/checkins
// @access  Private
export const createCheckIn = async (req: Request, res: Response): Promise<void> => {
    const { goalId, goal, status, blockerNote, blocker } = req.body as {
        goalId?: string;
        goal?: string;
        status: 'done' | 'partial' | 'not_done';
        blockerNote?: string;
        blocker?: string;
    };

    try {
        const targetGoalId = goalId || goal;
        if (!targetGoalId) {
            res.status(400).json({ message: 'Missing goalId' });
            return;
        }
        const goalDoc = await Goal.findById(targetGoalId);

        if (!goalDoc) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        if (goalDoc.user.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        // Check if already checked in
        const existingCheckIn = await CheckIn.findOne({ goal: targetGoalId });
        if (existingCheckIn) {
            res.status(400).json({ message: 'Already checked in for this goal' });
            return;
        }

        const checkIn = await CheckIn.create({
            user: req.user._id,
            goal: targetGoalId,
            weekNumber: goalDoc.weekNumber,
            status,
            blockerNote: blockerNote || blocker
        });

        // Update goal status as well to match check-in
        goalDoc.status = status;
        await goalDoc.save();

        res.status(201).json(checkIn);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get check-ins (history)
// @route   GET /api/checkins
// @access  Private
export const getCheckIns = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.user is guaranteed by AuthMiddleware usually, but optional in type
        if (!req.user) {
             res.status(401).json({ message: 'Not authorized' });
             return;
        }

        const checkIns = await CheckIn.find({ user: req.user._id })
            .populate('goal', 'description type weekNumber')
            .sort({ createdAt: -1 });

        res.status(200).json(checkIns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
