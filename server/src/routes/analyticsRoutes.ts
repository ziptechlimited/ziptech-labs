import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';
import Goal from '../models/Goal';
import CheckIn from '../models/CheckIn';
import User from '../models/User';
import Cohort from '../models/Cohort';
import { getWeekNumber } from '../controllers/goalController';
import { PUBLIC_PROFILE_FIELDS, loadExecutionRecords, serializeProfile, summarize } from '../services/executionRecord';

const router = express.Router();

const buildLeaderboard = async (userIds: any[]) => {
    const users = await User.find({ _id: { $in: userIds } }).select(`${PUBLIC_PROFILE_FIELDS} email`);
    const records = await loadExecutionRecords(users);
    return users
        .map((u) => {
            const record = records.get(u._id.toString())!;
            return {
                profile: { ...serializeProfile(u), email: u.email },
                summary: summarize(record),
                committedThisWeek: record.weekly[record.weekly.length - 1]?.commitments > 0,
            };
        })
        .sort((a, b) => b.summary.score - a.summary.score);
};

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
        const completedGoals = goals.filter((g: any) => g.status === 'done').length;
        const completionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0;

        // Submission rate (members who committed this week)
        const currentWeek = getWeekNumber(cohort.startDate);
        const usersWithGoals = new Set(
            goals.filter((g: any) => String(g.cohort) === String(cohort._id) && g.weekNumber === currentWeek)
                .map((g: any) => g.user.toString())
        );
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
            members: cohort.members,
            currentWeek,
            leaderboard: await buildLeaderboard(memberIds)
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
        const completedGoals = allGoals.filter((g: any) => g.status === 'done').length;
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
            topFounders: (await buildLeaderboard(allUsers.filter((u: any) => u.role === 'founder').map((u: any) => u._id))).slice(0, 10),
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
