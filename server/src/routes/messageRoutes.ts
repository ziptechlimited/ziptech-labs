import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { sendMessage, getMessages, pinMessage, muteMessage } from '../controllers/messageController';
import { requireVerified } from '../middleware/verifiedMiddleware';

const router = express.Router();

router.post('/:id/messages', protect, requireVerified, sendMessage);
router.get('/:id/messages', protect, requireVerified, getMessages);
router.patch('/messages/:id/pin', protect, requireVerified, pinMessage);
router.patch('/messages/:id/mute', protect, requireVerified, muteMessage);

export default router;
