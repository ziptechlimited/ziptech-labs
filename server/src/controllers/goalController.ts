import { Request, Response } from 'express';
import Goal from '../models/Goal';
import Cohort from '../models/Cohort';

// Helper to get current week number
const getWeekNumber = (startDate: Date): number => {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
};

// @desc    Create a goal (Public or Private)
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req: Request, res: Response): Promise<void> => {
    const { type, description, subTasks } = req.body;

    try {
        if (!['public', 'private'].includes(type)) {
            res.status(400).json({ message: 'Invalid goal type' });
            return;
        }

        // Check if user is in a cohort
        if (!req.user?.cohort) {
            res.status(400).json({ message: 'You must join a cohort first' });
            return;
        }

        const cohort = await Cohort.findById(req.user.cohort);
        if (!cohort) {
            res.status(404).json({ message: 'Cohort not found' });
            return;
        }

        const weekNumber = getWeekNumber(cohort.startDate);

        // Check if goal already exists for this week and type
        const existingGoal = await Goal.findOne({
            user: req.user._id,
            weekNumber,
            type
        });

        if (existingGoal) {
            res.status(400).json({ message: `You already have a ${type} goal for this week` });
            return;
        }

        const goal = await Goal.create({
            user: req.user._id,
            cohort: req.user.cohort,
            type,
            description,
            weekNumber,
            subTasks: subTasks || []
        });

        res.status(201).json(goal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get goals
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.cohort) {
            res.status(200).json([]);
            return;
        }

        const cohort = await Cohort.findById(req.user.cohort);
        if (!cohort) {
             res.status(404).json({ message: 'Cohort not found' });
             return;
        }
        
        const currentWeek = getWeekNumber(cohort.startDate);

        if (req.query.mine === 'true') {
             const myGoals = await Goal.find({ user: req.user._id, weekNumber: currentWeek });
             res.status(200).json(myGoals);
             return;
        }

        const publicGoals = await Goal.find({
            cohort: req.user.cohort,
            weekNumber: currentWeek,
            type: 'public'
        }).populate('user', 'name');

        const myPrivateGoal = await Goal.findOne({
            user: req.user._id,
            weekNumber: currentWeek,
            type: 'private'
        });

        const results = {
            week: currentWeek,
            publicGoals,
            myPrivateGoal
        };

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update goal status
// @route   PATCH /api/goals/:id
// @access  Private
export const updateGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        // Check user (using string comparison for IDs)
        if (goal.user.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        const updatedGoal = await Goal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
