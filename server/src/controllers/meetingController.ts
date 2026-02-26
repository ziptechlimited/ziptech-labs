import { Request, Response } from 'express';
import { google } from 'googleapis';
import Meeting from '../models/Meeting';
import Cohort from '../models/Cohort';

const getCalendarClient = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!clientEmail || !privateKey || !calendarId) {
    return null;
  }
  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar']
  );
  const calendar = google.calendar({ version: 'v3', auth });
  return { calendar, calendarId };
};

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

    const calendarClient = getCalendarClient();
    if (calendarClient) {
      try {
        const start = new Date(scheduledAt);
        const end = new Date(
          start.getTime() + (duration ?? 60) * 60 * 1000
        );
        const response = await calendarClient.calendar.events.insert({
          calendarId: calendarClient.calendarId,
          requestBody: {
            summary: title,
            description: agenda,
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
            conferenceData: {
              createRequest: {
                requestId: `meet-${meeting._id}-${Date.now()}`,
              },
            },
          },
          conferenceDataVersion: 1,
        });
        const meetLink = response.data.hangoutLink;
        const eventId = response.data.id;
        if (meetLink) {
          (meeting as any).meetLink = meetLink;
        }
        if (eventId) {
          (meeting as any).calendarEventId = eventId;
        }
        await meeting.save();
      } catch (error) {
        console.error('Failed to create Google Meet event', error);
      }
    }

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

export const updateMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }
    if (req.user.role !== 'admin' && meeting.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to edit' });
      return;
    }
    const { title, agenda, scheduledAt, duration } = req.body;
    if (title !== undefined) (meeting as any).title = title;
    if (agenda !== undefined) (meeting as any).agenda = agenda;
    if (scheduledAt !== undefined) (meeting as any).scheduledAt = scheduledAt;
    if (duration !== undefined) (meeting as any).duration = duration;

    const calendarClient = getCalendarClient();
    if (calendarClient && meeting.calendarEventId) {
      try {
        const start = new Date(
          scheduledAt ?? meeting.scheduledAt
        );
        const end = new Date(
          start.getTime() +
            ((duration ?? meeting.duration ?? 60) as number) *
              60 *
              1000
        );
        await calendarClient.calendar.events.patch({
          calendarId: calendarClient.calendarId,
          eventId: meeting.calendarEventId,
          requestBody: {
            summary: (meeting as any).title,
            description: (meeting as any).agenda,
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
          },
        });
      } catch (error) {
        console.error('Failed to update Google Meet event', error);
      }
    }

    await meeting.save();
    res.status(200).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }
    if (req.user.role !== 'admin' && meeting.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete' });
      return;
    }
    const calendarClient = getCalendarClient();
    if (calendarClient && meeting.calendarEventId) {
      try {
        await calendarClient.calendar.events.delete({
          calendarId: calendarClient.calendarId,
          eventId: meeting.calendarEventId,
        });
      } catch (error) {
        console.error('Failed to delete Google Meet event', error);
      }
    }
    await Meeting.findByIdAndDelete(req.params.id);
    res.status(204).json({});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
