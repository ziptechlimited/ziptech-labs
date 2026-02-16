import express from 'express';
import { createCohort, getCohorts, joinCohort, getCohort } from '../controllers/cohortController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createCohort);
router.get('/', protect, getCohorts);
router.post('/join', protect, joinCohort);
router.get('/:id', protect, getCohort);

export default router;
