import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createMeeting, getMeetings, rsvpMeeting, markAttendance } from '../controllers/meetingController';
import { requireVerified } from '../middleware/verifiedMiddleware';

const router = express.Router();

router.post('/', protect, requireVerified, createMeeting);
router.get('/', protect, requireVerified, getMeetings);
router.post('/:id/rsvp', protect, requireVerified, rsvpMeeting);
router.patch('/:id/attendance', protect, requireVerified, markAttendance);

export default router;
