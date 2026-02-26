import express from 'express';
import { createCohort, getCohorts, joinCohort, getCohort, getMyCohort } from '../controllers/cohortController';
import { protect } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifiedMiddleware';

const router = express.Router();

router.post('/', protect, requireVerified, createCohort);
router.get('/', protect, requireVerified, getCohorts);
router.get('/my-cohort', protect, requireVerified, getMyCohort);
router.post('/join', protect, requireVerified, joinCohort);
router.get('/:id', protect, requireVerified, getCohort);

export default router;
