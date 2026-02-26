import { Request, Response } from 'express';
import CheckInSession from '../models/CheckInSession';
import Cohort from '../models/Cohort';

export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'facilitator' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const { cohortId } = req.body as { cohortId: string };
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      res.status(404).json({ message: 'Cohort not found' });
      return;
    }
    const existing = await CheckInSession.findOne({ cohort: cohortId, active: true });
    if (existing) {
      res.status(200).json(existing);
      return;
    }
    const session = await CheckInSession.create({ cohort: cohortId, startedBy: req.user!._id, active: true });
    const io = req.app.get('io');
    if (io) io.to(`cohort:${cohortId}`).emit('session', { active: true });
    res.status(201).json(session);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const stopSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'facilitator' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const { cohortId } = req.body as { cohortId: string };
    const session = await CheckInSession.findOne({ cohort: cohortId, active: true });
    if (!session) {
      res.status(404).json({ message: 'No active session' });
      return;
    }
    session.active = false;
    session.endedAt = new Date();
    await session.save();
    const io = req.app.get('io');
    if (io) io.to(`cohort:${cohortId}`).emit('session', { active: false });
    res.status(200).json(session);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

