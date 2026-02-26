import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';
import { createMeetingInvite, listMeetingInvites, revokeInvite } from '../controllers/inviteCodeController';

const router = express.Router();

router.post('/meeting/:id', protect, requireVerified, createMeetingInvite);
router.get('/meeting/:id', protect, requireVerified, listMeetingInvites);
router.post('/:code/revoke', protect, requireVerified, revokeInvite);

export default router;
