import { Request, Response } from 'express';
import User from '../models/User';
import Goal from '../models/Goal';
import CheckIn from '../models/CheckIn';

export const getUserPublic = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('name email role avatarUrl bio company website location createdAt');
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

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const allowed = ['name', 'bio', 'avatarUrl', 'company', 'website', 'location'] as const;
    const updates: Record<string, any> = {};
    allowed.forEach((k) => {
      if (typeof (req.body as any)[k] !== 'undefined') updates[k] = (req.body as any)[k];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.status(200).json(user);
  } catch (e) {
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

