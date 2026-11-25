import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Goal from '../models/Goal';
import CheckIn from '../models/CheckIn';
import {
  PUBLIC_PROFILE_FIELDS,
  cohortNames,
  loadExecutionRecord,
  loadExecutionRecords,
  serializeProfile,
  summarize,
} from '../services/executionRecord';

export const getUserPublic = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const user = await User.findById(req.params.id).select(`${PUBLIC_PROFILE_FIELDS} email isProfilePublic`);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

const PROFILE_FIELDS = [
  'name',
  'bio',
  'avatarUrl',
  'company',
  'website',
  'location',
  'headline',
  'companyOneLiner',
  'sector',
  'stage',
  'fundraising',
  'raiseAmount',
  'linkedin',
  'twitter',
  'isProfilePublic',
] as const;

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    PROFILE_FIELDS.forEach((k) => {
      const value = (req.body as any)[k];
      if (typeof value === 'undefined') return;
      // Empty strings clear optional fields (and keep enum validation happy).
      (user as any)[k] = value === '' && k !== 'name' ? undefined : value;
    });
    // save() so validators and the slug hook run
    await user.save();
    const { password, verificationTokenHash, verificationTokenExpires, ...safe } = user.toObject();
    res.status(200).json(safe);
  } catch (e: any) {
    if (e?.name === 'ValidationError') {
      res.status(400).json({ message: e.message });
      return;
    }
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const goals = await Goal.find({ user: userId });
    const checkIns = await CheckIn.find({ user: userId });
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'done').length;
    const completionRate = totalGoals > 0 ? Number(((completedGoals / totalGoals) * 100).toFixed(1)) : 0;
    const doneCheckIns = checkIns.filter(c => c.status === 'done').length;
    const partialCheckIns = checkIns.filter(c => c.status === 'partial').length;
    const notDoneCheckIns = checkIns.filter(c => c.status === 'not_done').length;
    res.status(200).json({
      totalGoals,
      completedGoals,
      completionRate,
      checkIns: {
        total: checkIns.length,
        done: doneCheckIns,
        partial: partialCheckIns,
        notDone: notDoneCheckIns
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    The signed-in founder's full execution record (includes private goals)
// @route   GET /api/users/me/record
export const getMyRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const [record, names] = await Promise.all([
      loadExecutionRecord(req.user, true),
      cohortNames([req.user]),
    ]);
    res.status(200).json({
      profile: serializeProfile(req.user, names.get(String(req.user.cohort))),
      isProfilePublic: req.user.isProfilePublic !== false,
      record,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Investor watchlist with execution summaries
// @route   GET /api/users/me/watchlist
export const getWatchlist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const ids = (req.user.watchlist ?? []) as any[];
    const users = await User.find({
      _id: { $in: ids },
      role: 'founder',
      isProfilePublic: { $ne: false },
    }).select(PUBLIC_PROFILE_FIELDS);
    const [records, names] = await Promise.all([loadExecutionRecords(users), cohortNames(users)]);
    res.status(200).json(
      users.map((u) => ({
        profile: serializeProfile(u, names.get(String(u.cohort))),
        summary: summarize(records.get(u._id.toString())!),
      })),
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add/remove a founder from the watchlist
// @route   POST /api/users/me/watchlist/:founderId
export const toggleWatchlist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const founderId = String(req.params.founderId);
    if (!mongoose.isValidObjectId(founderId)) {
      res.status(400).json({ message: 'Invalid founder id' });
      return;
    }
    const founder = await User.exists({ _id: founderId, role: 'founder' });
    if (!founder) {
      res.status(404).json({ message: 'Founder not found' });
      return;
    }
    const current = ((req.user.watchlist ?? []) as any[]).map(String);
    const watching = current.includes(founderId);
    await User.updateOne(
      { _id: req.user._id },
      watching ? { $pull: { watchlist: founderId } } : { $addToSet: { watchlist: founderId } },
    );
    res.status(200).json({ watching: !watching });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
