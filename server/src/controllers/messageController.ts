import { Request, Response } from 'express';
import Message from '../models/Message';
import Cohort from '../models/Cohort';

const isCheckInDay = (): boolean => {
  const today = new Date().getDay();
  return today === 1;
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const { content } = req.body as { content: string };
    const cohortId = req.params.id;

    if (!isCheckInDay()) {
      res.status(403).json({ message: 'Chat is only available on check-in days' });
      return;
    }

    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      res.status(404).json({ message: 'Cohort not found' });
      return;
    }

    const isMember =
      (cohort.members as any[]).some((m: any) =>
        (m._id ? m._id.toString() : m.toString()) === req.user!.id
      ) ||
      ((cohort.facilitator as any)?._id
        ? (cohort.facilitator as any)._id.toString()
        : (cohort.facilitator as any).toString()) === req.user.id;

    if (!isMember) {
      res.status(403).json({ message: 'Not a member of this cohort' });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const message = await Message.create({
      cohort: cohortId,
      user: req.user._id,
      content,
      expiresAt,
    });
    await message.populate('user', 'name');
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const cohortId = req.params.id;
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      res.status(404).json({ message: 'Cohort not found' });
      return;
    }
    const isMember =
      (cohort.members as any[]).some((m: any) =>
        (m._id ? m._id.toString() : m.toString()) === req.user!.id
      ) ||
      ((cohort.facilitator as any)?._id
        ? (cohort.facilitator as any)._id.toString()
        : (cohort.facilitator as any).toString()) === req.user.id;
    if (!isMember) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const messages = await Message.find({ cohort: cohortId, isMuted: false })
      .populate('user', 'name')
      .sort({ createdAt: 1 });
    res.status(200).json({ messages, isCheckInDay: isCheckInDay() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const pinMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'facilitator' && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const message = await Message.findById(req.params.id);
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }
    message.isPinned = !message.isPinned;
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const muteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'facilitator' && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const message = await Message.findById(req.params.id);
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }
    message.isMuted = !message.isMuted;
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

