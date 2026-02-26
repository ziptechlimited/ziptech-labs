import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';
import Goal from '../models/Goal';
import CheckIn from '../models/CheckIn';
import User from '../models/User';
import Cohort from '../models/Cohort';

const router = express.Router();

// @desc    Get cohort analytics
// @route   GET /api/analytics/cohort/:id
// @access  Private (Facilitator/Admin)
router.get('/cohort/:id', protect, requireVerified, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (req.user.role !== 'facilitator' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const cohortId = req.params.id;
        const cohort = await Cohort.findById(cohortId).populate('members', 'name email');

        if (!cohort) {
            return res.status(404).json({ message: 'Cohort not found' });
        }

        // Get all goals for this cohort
        const memberIds = cohort.members.map((m: any) => m._id);
        const goals = await Goal.find({ user: { $in: memberIds } });
        const checkIns = await CheckIn.find({ user: { $in: memberIds } });

        // Calculate metrics
        const totalGoals = goals.length;
        const completedGoals = checkIns.filter((c: any) => c.status === 'done').length;
        const completionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0;

        // Submission rate (users who submitted goals this week)
        const usersWithGoals = new Set(goals.map((g: any) => g.user.toString()));
        const submissionRate = cohort.members.length > 0 
            ? ((usersWithGoals.size / cohort.members.length) * 100).toFixed(1) 
            : 0;

        // Engagement score (average check-ins per user)
        const checkInsPerUser = cohort.members.length > 0 
            ? (checkIns.length / cohort.members.length).toFixed(1) 
            : 0;

        res.json({
            cohort: {
                name: cohort.name,
                memberCount: cohort.members.length
            },
            metrics: {
                totalGoals,
                completedGoals,
                completionRate: parseFloat(completionRate as string),
                submissionRate: parseFloat(submissionRate as string),
                engagementScore: parseFloat(checkInsPerUser as string)
            },
            members: cohort.members
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get admin analytics (cross-cohort)
// @route   GET /api/analytics/admin
// @access  Private (Admin)
router.get('/admin', protect, requireVerified, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const cohorts = await Cohort.find().populate('members');
        const allGoals = await Goal.find();
        const allCheckIns = await CheckIn.find();
        const allUsers = await User.find();

        const totalCohorts = cohorts.length;
        const totalUsers = allUsers.length;
        const totalGoals = allGoals.length;
        const completedGoals = allCheckIns.filter((c: any) => c.status === 'done').length;
        const avgCompletion = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0;

        // Active users (users with goals in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentGoals = allGoals.filter((g: any) => g.createdAt > sevenDaysAgo);
        const activeUsers = new Set(recentGoals.map((g: any) => g.user.toString())).size;

        res.json({
            totalCohorts,
            totalUsers,
            activeUsers,
            totalGoals,
            completedGoals,
            avgCompletionRate: parseFloat(avgCompletion as string),
            cohorts: cohorts.map((c: any) => ({
                id: c._id,
                name: c.name,
                memberCount: c.members.length
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
