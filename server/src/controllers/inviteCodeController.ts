import { Request, Response } from 'express';
import crypto from 'crypto';
import InviteCode from '../models/InviteCode';
import Meeting from '../models/Meeting';

const generateCode = () => crypto.randomBytes(5).toString('base64url').toUpperCase();

export const createMeetingInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'facilitator' && req.user.role !== 'admin')) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }
    if (req.user.role !== 'admin' && meeting.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const { expiresInMinutes = 60, maxUses } = req.body as { expiresInMinutes?: number; maxUses?: number };
    const code = generateCode();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const inv = await InviteCode.create({
      code,
      type: 'meeting',
      targetId: meeting._id,
      expiresAt,
      maxUses,
      createdBy: req.user._id,
    });
    res.status(201).json(inv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listMeetingInvites = async (req: Request, res: Response): Promise<void> => {
  try {
    const invites = await InviteCode.find({ type: 'meeting', targetId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(invites);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const revokeInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const inv = await InviteCode.findOne({ code: req.params.code });
    if (!inv) {
      res.status(404).json({ message: 'Invite not found' });
      return;
    }
    inv.revoked = true;
    await inv.save();
    res.status(200).json(inv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

