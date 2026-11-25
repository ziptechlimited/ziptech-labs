import express from 'express';
import User from '../models/User';
import Goal from '../models/Goal';
import {
  PUBLIC_PROFILE_FIELDS,
  cohortNames,
  loadExecutionRecord,
  loadExecutionRecords,
  recordToCsv,
  serializeProfile,
  summarize,
} from '../services/executionRecord';
import { WEIGHTS, MIN_RESOLVED_FOR_CONFIDENCE } from '../services/executionScore';

const router = express.Router();

const publicFounderQuery = { role: 'founder', isProfilePublic: { $ne: false } };

const findPublicFounder = (slug: string) =>
  User.findOne({ ...publicFounderQuery, slug }).select(PUBLIC_PROFILE_FIELDS);

// @desc    Founder profile + public execution record
// @route   GET /public/profile/:slug
router.get('/profile/:slug', async (req, res) => {
  try {
    const user = await findPublicFounder(req.params.slug);
    if (!user) {
      res.status(404).json({ message: 'Founder not found' });
      return;
    }
    const [record, names] = await Promise.all([loadExecutionRecord(user), cohortNames([user])]);
    res.status(200).json({
      profile: serializeProfile(user, user.cohort ? names.get(String(user.cohort)) : undefined),
      record,
      methodology: { weights: WEIGHTS, minResolvedForConfidence: MIN_RESOLVED_FOR_CONFIDENCE },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Downloadable CSV of a founder's execution report
// @route   GET /public/profile/:slug/report.csv
router.get('/profile/:slug/report.csv', async (req, res) => {
  try {
    const user = await findPublicFounder(req.params.slug);
    if (!user) {
      res.status(404).json({ message: 'Founder not found' });
      return;
    }
    const [record, names] = await Promise.all([loadExecutionRecord(user), cohortNames([user])]);
    const csv = recordToCsv(serializeProfile(user, names.get(String(user.cohort))), record);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${user.slug}-execution-report.csv"`);
    res.status(200).send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Founder directory for investors, ranked by execution
// @route   GET /public/founders?q=&stage=&sector=&fundraising=&sort=score|streak|recent
router.get('/founders', async (req, res) => {
  try {
    const { q, stage, sector, fundraising, sort = 'score' } = req.query as Record<string, string>;
    const filter: Record<string, any> = { ...publicFounderQuery };
    if (stage) filter.stage = stage;
    if (sector) filter.sector = new RegExp(`^${sector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    if (fundraising === 'true') filter.fundraising = true;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { company: rx }, { companyOneLiner: rx }, { headline: rx }];
    }

    const users = await User.find(filter).select(PUBLIC_PROFILE_FIELDS).limit(200);
    const [records, names] = await Promise.all([loadExecutionRecords(users), cohortNames(users)]);

    const founders = users
      .map((u) => ({
        profile: serializeProfile(u, u.cohort ? names.get(String(u.cohort)) : undefined),
        summary: summarize(records.get(u._id.toString())!),
      }))
      .filter((f) => f.summary.commitments > 0);

    const sorters: Record<string, (a: typeof founders[0], b: typeof founders[0]) => number> = {
      score: (a, b) =>
        Number(a.summary.provisional) - Number(b.summary.provisional) || b.summary.score - a.summary.score,
      streak: (a, b) => b.summary.currentStreak - a.summary.currentStreak,
      recent: (a, b) =>
        new Date(b.summary.lastActivityAt ?? 0).getTime() - new Date(a.summary.lastActivityAt ?? 0).getTime(),
    };
    founders.sort(sorters[sort] ?? sorters.score);

    const sectors = await User.distinct('sector', { ...publicFounderQuery, sector: { $nin: [null, ''] } });
    res.status(200).json({ founders, sectors });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Platform-wide numbers for the landing page
// @route   GET /public/stats
router.get('/stats', async (_req, res) => {
  try {
    const founders = await User.countDocuments({ role: 'founder' });
    const [commitments, delivered] = await Promise.all([
      Goal.countDocuments(),
      Goal.countDocuments({ status: 'done' }),
    ]);
    res.status(200).json({ founders, commitments, delivered });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
