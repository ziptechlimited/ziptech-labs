import { Request, Response } from 'express';
import Cohort from '../models/Cohort';
import User from '../models/User';

// @desc    Create a new cohort
// @route   POST /api/cohorts
// @access  Private (Admin/Coach)
export const createCohort = async (req: Request, res: Response): Promise<void> => {
    const { name, startDate, endDate } = req.body;

    if (!name) {
        res.status(400).json({ message: 'Please add a cohort name' });
        return;
    }

    try {
        const cohort = await Cohort.create({
            name,
            startDate,
            endDate,
            facilitator: req.user?._id
        });

        res.status(201).json(cohort);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all cohorts
// @route   GET /api/cohorts
// @access  Private
export const getCohorts = async (req: Request, res: Response): Promise<void> => {
    try {
        const cohorts = await Cohort.find()
            .populate('facilitator', 'name email')
            .populate('members', 'name email');

        res.status(200).json(cohorts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Join a cohort via Invite Code
// @route   POST /api/cohorts/join
// @access  Private
export const joinCohort = async (req: Request, res: Response): Promise<void> => {
    const { inviteCode } = req.body;

    if (!inviteCode) {
        res.status(400).json({ message: 'Please provide an invite code' });
        return;
    }

    try {
        const cohort = await Cohort.findOne({ inviteCode });

        if (!cohort) {
            res.status(404).json({ message: 'Invalid invite code' });
            return;
        }

        const userId = req.user?._id;
        if (!userId) {
             res.status(401).json({ message: 'Not authorized' });
             return;
        }

        const isMember = cohort.members.some((memberId: any) => memberId.toString() === userId.toString());

        if (isMember) {
            res.status(400).json({ message: 'You are already a member of this cohort' });
            return;
        }

        cohort.members.push(userId as any);
        await cohort.save();

        if (req.user) {
            req.user.cohort = cohort._id as any;
            await req.user.save();
        }

        res.status(200).json(cohort);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get cohort details
// @route   GET /api/cohorts/:id
// @access  Private
// Added this missing controller logic from previous view
export const getCohort = async (req: Request, res: Response): Promise<void> => {
    try {
        const cohort = await Cohort.findById(req.params.id)
            .populate('members', 'name email role')
            .populate('facilitator', 'name email');

        if (!cohort) {
            res.status(404).json({ message: 'Cohort not found' });
            return;
        }
        
        // Authorization check
        // Check if user is member or facilitator or admin
        const userId = req.user?._id.toString();
        // Assuming members are populated but we might need to check IDs carefully if populated
        // Wait, if populated, members is array of objects. 
        // Need to be careful with type checking.
        // It is safer to re-fetch or use unpopulated members array from DB if schema allows, 
        // or check against populated _id.
        // Cohort.members is typed as string[] | IUser[]
        
        const isMember = (cohort.members as any[]).some(m => (m._id ? m._id.toString() : m.toString()) === userId);
        const isFacilitator = (cohort.facilitator as any)._id 
             ? (cohort.facilitator as any)._id.toString() === userId 
             : (cohort.facilitator as any).toString() === userId;

        if (!isMember && !isFacilitator && req.user?.role !== 'admin') {
             res.status(403).json({ message: 'Not authorized to view this cohort' });
             return;
        }

        res.status(200).json(cohort);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
