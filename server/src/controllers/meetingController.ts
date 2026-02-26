import { Request, Response } from 'express';
import Meeting from '../models/Meeting';
import Cohort from '../models/Cohort';

export const createMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'facilitator' && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to create meetings' });
      return;
    }

    const { cohort, title, agenda, scheduledAt, duration } = req.body as {
      cohort: string;
      title: string;
      agenda?: string;
      scheduledAt: string | Date;
      duration?: number;
    };

    const cohortDoc = await Cohort.findById(cohort);
    if (!cohortDoc) {
      res.status(404).json({ message: 'Cohort not found' });
      return;
    }

    const facId =
      (cohortDoc.facilitator as any)?._id?.toString() ?? cohortDoc.facilitator?.toString();
    if (facId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized for this cohort' });
      return;
    }

    const meeting = await Meeting.create({
      cohort,
      title,
      agenda,
      scheduledAt,
      duration,
      createdBy: req.user.id,
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cohort } = req.query as { cohort?: string };
    if (!cohort) {
      res.status(400).json({ message: 'Cohort ID required' });
      return;
    }
    const meetings = await Meeting.find({ cohort })
      .populate('createdBy', 'name')
      .populate('rsvps.user', 'name')
      .sort({ scheduledAt: 1 });
    res.status(200).json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rsvpMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const { status } = req.body as { status: 'yes' | 'maybe' | 'no' };
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }
    const existing = meeting.rsvps.find((r) => r.user.toString() === req.user!.id);
    if (existing) {
      existing.status = status;
    } else {
      meeting.rsvps.push({ user: req.user._id, status });
    }
    await meeting.save();
    await meeting.populate('rsvps.user', 'name');
    res.status(200).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'facilitator' && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const { attendees } = req.body as { attendees: string[] };
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }
    meeting.attendance = attendees as any;
    await meeting.save();
    res.status(200).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

