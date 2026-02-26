const Support = require('../models/Support');
const Goal = require('../models/Goal');

// Helper to get current week number
const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
};

// @desc    Add support to a goal
// @route   POST /api/goals/:id/support
// @access  Private
const addSupport = async (req, res) => {
    const { type, message } = req.body;
    const goalId = req.params.id;

    try {
        // Check if goal exists
        const goal = await Goal.findById(goalId);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        // Can't support your own goal
        if (goal.user.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot support your own goal' });
        }

        // Check if user already supported this goal this week
        const currentWeek = getCurrentWeek();
        const existingSupport = await Support.findOne({
            goal: goalId,
            user: req.user.id,
            week: currentWeek
        });

        if (existingSupport) {
            return res.status(400).json({ message: 'You have already supported this goal this week' });
        }

        // Validate message for help type
        if (type === 'help' && (!message || message.length > 120)) {
            return res.status(400).json({ message: 'Help message required (max 120 chars)' });
        }

        const support = await Support.create({
            goal: goalId,
            user: req.user.id,
            type,
            message: type === 'help' ? message : undefined,
            week: currentWeek
        });

        await support.populate('user', 'name');

        res.status(201).json(support);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get support for a goal
// @route   GET /api/goals/:id/support
// @access  Private
const getGoalSupport = async (req, res) => {
    try {
        const support = await Support.find({ goal: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(support);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addSupport,
    getGoalSupport
};
