import express from 'express';
import { registerUser, loginUser, getMe, sendVerification, confirmVerification, sendVerificationLimiter } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/send-verification', protect, sendVerificationLimiter, sendVerification);
router.get('/verify', confirmVerification);

export default router;
