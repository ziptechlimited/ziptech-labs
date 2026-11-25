import { Request, Response } from 'express';
import Goal from '../models/Goal';
import Cohort from '../models/Cohort';
import Support from '../models/Support';
import CheckIn from '../models/CheckIn';

// Cohort week number, 1-based from the cohort start date.
export const getWeekNumber = (startDate: Date, now: Date = new Date()): number => {
    const diff = now.getTime() - new Date(startDate).getTime();
    if (diff < 0) return 1;
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
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

        if (!description || !String(description).trim()) {
            res.status(400).json({ message: 'Describe the commitment' });
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
            description: String(description).trim(),
            weekNumber,
            subTasks: Array.isArray(subTasks)
                ? subTasks
                    .filter((t: any) => t && String(t.description ?? '').trim())
                    .slice(0, 10)
                    .map((t: any) => ({ description: String(t.description).trim(), completed: false }))
                : []
        });

        res.status(201).json(goal);
    } catch (error: any) {
        if (error?.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
            return;
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get this week's goals: mine (public + private) and the cohort's public goals
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.cohort) {
            res.status(200).json({ week: null, myGoals: [], publicGoals: [], myPrivateGoal: null });
            return;
        }

        const cohort = await Cohort.findById(req.user.cohort);
        if (!cohort) {
             res.status(404).json({ message: 'Cohort not found' });
             return;
        }

        const currentWeek = getWeekNumber(cohort.startDate);
        const userId = req.user._id.toString();

        const [myGoals, publicGoals] = await Promise.all([
            Goal.find({ user: req.user._id, weekNumber: currentWeek }).lean(),
            Goal.find({ cohort: req.user.cohort, weekNumber: currentWeek, type: 'public' })
                .populate('user', 'name slug company avatarUrl')
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        const goalIds = [...myGoals, ...publicGoals].map((g: any) => g._id);
        const [supports, checkIns] = await Promise.all([
            Support.find({ goal: { $in: goalIds } }).populate('user', 'name slug').sort({ createdAt: -1 }).lean(),
            CheckIn.find({ goal: { $in: goalIds } }).lean(),
        ]);

        const decorate = (g: any) => {
            const id = String(g._id);
            const mine = supports.filter((s: any) => String(s.goal) === id);
            const checkIn = checkIns.find((c: any) => String(c.goal) === id);
            return {
                ...g,
                checkIn: checkIn ? { status: checkIn.status, blockerNote: checkIn.blockerNote, createdAt: checkIn.createdAt } : null,
                peer: {
                    endorse: mine.filter((s: any) => s.type === 'endorse').length,
                    support: mine.filter((s: any) => s.type === 'support').length,
                    help: mine.filter((s: any) => s.type === 'help').length,
                },
                helpOffers: mine
                    .filter((s: any) => s.type === 'help' && s.message)
                    .map((s: any) => ({ user: s.user, message: s.message, createdAt: s.createdAt })),
                mySupport: mine.filter((s: any) => String(s.user?._id ?? s.user) === userId).map((s: any) => s.type),
            };
        };

        const decoratedMine = myGoals.map(decorate);
        res.status(200).json({
            week: currentWeek,
            cohortStart: cohort.startDate,
            myGoals: decoratedMine,
            myPrivateGoal: decoratedMine.find((g: any) => g.type === 'private') ?? null,
            publicGoals: publicGoals
                .filter((g: any) => String(g.user?._id ?? g.user) !== userId)
                .map(decorate),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a goal's subtasks (or wording while still pending).
//          Outcomes are recorded only through check-ins so the record stays trustworthy.
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

        const { subTasks, description } = req.body as {
            subTasks?: { description: string; completed: boolean }[];
            description?: string;
        };

        if (Array.isArray(subTasks)) {
            goal.subTasks = subTasks
                .filter((t) => t && String(t.description ?? '').trim())
                .slice(0, 10)
                .map((t) => ({ description: String(t.description).trim(), completed: !!t.completed }));
        }
        if (typeof description === 'string') {
            if (goal.status !== 'pending') {
                res.status(400).json({ message: 'A resolved commitment cannot be reworded' });
                return;
            }
            goal.description = description.trim();
        }

        const updatedGoal = await goal.save();
        res.status(200).json(updatedGoal);
    } catch (error: any) {
        if (error?.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
            return;
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
