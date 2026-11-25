#!/usr/bin/env ts-node

/**
 * Demo data seeder: a facilitator, an investor, and a cohort of founders
 * with ~14 weeks of commitments, check-ins, peer signals, and meetings.
 *
 * Only touches accounts on the @demo.ziptechlabs.dev domain (and the data
 * they own), so it is safe to re-run against a development database.
 *
 * Usage: npm run seed:demo
 * All demo accounts use the password: demo-password
 */

import mongoose from 'mongoose';
import { config } from '../src/config/env';
import User from '../src/models/User';
import Cohort from '../src/models/Cohort';
import Goal from '../src/models/Goal';
import CheckIn from '../src/models/CheckIn';
import Support from '../src/models/Support';
import Meeting from '../src/models/Meeting';

const DOMAIN = 'demo.ziptechlabs.dev';
const PASSWORD = 'demo-password';
const WEEKS = 14;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Deterministic pseudo-random so the demo looks the same every run.
let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const founders = [
  { name: 'Amara Okafor', company: 'Ledgerline', oneLiner: 'Automated bookkeeping for West African SMEs', sector: 'Fintech', stage: 'seed', location: 'Lagos, NG', fundraising: true, raise: '$1.5M', reliability: 0.92 },
  { name: 'Kwame Mensah', company: 'Harvest Grid', oneLiner: 'Cold-chain marketplace connecting farms to retailers', sector: 'Agritech', stage: 'pre-seed', location: 'Accra, GH', fundraising: true, raise: '$500K', reliability: 0.84 },
  { name: 'Zainab Bello', company: 'Clinicly', oneLiner: 'Appointment and records OS for private clinics', sector: 'Healthtech', stage: 'seed', location: 'Abuja, NG', fundraising: false, raise: '', reliability: 0.78 },
  { name: 'David Mwangi', company: 'Routeway', oneLiner: 'Last-mile logistics routing for informal couriers', sector: 'Logistics', stage: 'pre-seed', location: 'Nairobi, KE', fundraising: true, raise: '$750K', reliability: 0.66 },
  { name: 'Ifeoma Eze', company: 'Tutorly', oneLiner: 'Exam prep that adapts to every WAEC student', sector: 'Edtech', stage: 'idea', location: 'Enugu, NG', fundraising: false, raise: '', reliability: 0.88 },
  { name: 'Tunde Adeyemi', company: 'Voltbox', oneLiner: 'Pay-as-you-go solar storage for small shops', sector: 'Climate', stage: 'seed', location: 'Ibadan, NG', fundraising: true, raise: '$2M', reliability: 0.55 },
  { name: 'Grace Uwase', company: 'Kora Pay', oneLiner: 'Cross-border payouts for African freelancers', sector: 'Fintech', stage: 'pre-seed', location: 'Kigali, RW', fundraising: true, raise: '$600K', reliability: 0.95 },
  { name: 'Samuel Otieno', company: 'Stockwise', oneLiner: 'Inventory forecasting for neighbourhood pharmacies', sector: 'Healthtech', stage: 'idea', location: 'Kisumu, KE', fundraising: false, raise: '', reliability: 0.42 },
];

const publicGoals = [
  'Ship onboarding v2 to 20 beta users',
  'Close 3 paid pilots',
  'Interview 15 target customers',
  'Launch referral program',
  'Hire first backend engineer',
  'Cut churn below 5% for the month',
  'Publish pricing page and run A/B test',
  'Sign LOI with distribution partner',
  'Reach ₦2M in monthly revenue',
  'Release Android app to Play Store',
  'Complete SOC2 readiness checklist',
  'Run 10 investor intro calls',
  'Ship analytics dashboard for customers',
  'Automate weekly reporting',
];
const privateGoals = ['Fix cofounder equity split', 'Clean up burn model', 'Prepare data room', 'Rebuild sales pipeline in CRM'];
const blockers = ['Waiting on bank API access', 'Payment partner delayed KYC', 'Lost a week to a production outage', 'Hiring pipeline is thin'];
const helpNotes = ['Happy to intro you to a payments PM', 'I have a template for this — DM me', 'Can share our onboarding scripts'];

const run = async () => {
  await mongoose.connect(config.MONGO_URI);
  console.log('Connected. Clearing previous demo data…');

  const old = await User.find({ email: new RegExp(`@${DOMAIN.replace(/\./g, '\\.')}$`) }).select('_id');
  const oldIds = old.map((u) => u._id);
  const oldGoals = await Goal.find({ user: { $in: oldIds } }).select('_id');
  await Promise.all([
    Support.deleteMany({ $or: [{ user: { $in: oldIds } }, { goal: { $in: oldGoals.map((g) => g._id) } }] }),
    CheckIn.deleteMany({ user: { $in: oldIds } }),
    Goal.deleteMany({ user: { $in: oldIds } }),
  ]);
  const oldCohorts = await Cohort.find({ facilitator: { $in: oldIds } }).select('_id');
  await Meeting.deleteMany({ cohort: { $in: oldCohorts.map((c) => c._id) } });
  await Cohort.deleteMany({ _id: { $in: oldCohorts.map((c) => c._id) } });
  await User.deleteMany({ _id: { $in: oldIds } });

  const now = Date.now();
  // Start so that the current cohort week is week WEEKS.
  const start = new Date(now - (WEEKS - 1) * WEEK_MS - 2 * 24 * 3600 * 1000);

  const facilitator = await User.create({
    name: 'Ngozi Facilitator', email: `facilitator@${DOMAIN}`, password: PASSWORD, role: 'facilitator', isVerified: true,
  });
  const cohort = await Cohort.create({ name: 'Lagos Spring ’26', facilitator: facilitator._id, startDate: start });
  facilitator.cohort = cohort._id as any;
  await facilitator.save();

  await User.create({
    name: 'Ayo Investor', email: `investor@${DOMAIN}`, password: PASSWORD, role: 'investor', isVerified: true,
    company: 'Baobab Ventures', headline: 'Partner, pre-seed & seed across Africa',
  });

  const users = [];
  for (const f of founders) {
    const user = await User.create({
      name: f.name,
      email: `${f.name.split(' ')[0].toLowerCase()}@${DOMAIN}`,
      password: PASSWORD,
      role: 'founder',
      isVerified: true,
      company: f.company,
      companyOneLiner: f.oneLiner,
      headline: `Founder & CEO, ${f.company}`,
      bio: `Building ${f.company}: ${f.oneLiner.toLowerCase()}. Previously operator at a high-growth startup.`,
      sector: f.sector,
      stage: f.stage,
      location: f.location,
      fundraising: f.fundraising,
      raiseAmount: f.raise || undefined,
      website: `https://${f.company.toLowerCase().replace(/\s+/g, '')}.example.com`,
      cohort: cohort._id,
      createdAt: start,
    });
    users.push({ user, reliability: f.reliability });
  }
  cohort.members = users.map((u) => u.user._id) as any;
  await cohort.save();

  const allPublicGoals: { goal: any; owner: string }[] = [];
  for (const { user, reliability } of users) {
    for (let w = 0; w < WEEKS; w++) {
      // Less reliable founders skip some weeks.
      if (rand() > reliability + 0.1) continue;
      const createdAt = new Date(Math.min(now - 3600 * 1000, start.getTime() + w * WEEK_MS + rand() * 2 * 24 * 3600 * 1000));
      const isCurrentWeek = w === WEEKS - 1;
      const types: ('public' | 'private')[] = rand() < 0.6 ? ['public', 'private'] : ['public'];
      for (const type of types) {
        const roll = rand();
        const status = isCurrentWeek ? 'pending' : roll < reliability ? 'done' : roll < reliability + 0.15 ? 'partial' : 'not_done';
        const text = type === 'public' ? publicGoals[(w + users.indexOf(users.find((u) => u.user === user)!)) % publicGoals.length] : privateGoals[w % privateGoals.length];
        const subCount = Math.floor(rand() * 4);
        const goal = await Goal.create({
          user: user._id, cohort: cohort._id, type, description: text, status, weekNumber: w + 1, createdAt,
          subTasks: Array.from({ length: subCount }, (_, i) => ({ description: `Step ${i + 1}`, completed: status === 'done' || (status === 'partial' && i === 0) })),
        });
        if (status !== 'pending' && rand() < 0.95) {
          await CheckIn.create({
            user: user._id, goal: goal._id, weekNumber: w + 1, status,
            blockerNote: status !== 'done' && rand() < 0.7 ? blockers[Math.floor(rand() * blockers.length)] : undefined,
            createdAt: new Date(Math.min(now, createdAt.getTime() + 5 * 24 * 3600 * 1000)),
          });
        }
        if (type === 'public') allPublicGoals.push({ goal, owner: user._id.toString() });
      }
    }
  }

  // Peer signals
  for (const { goal, owner } of allPublicGoals) {
    for (const { user } of users) {
      if (user._id.toString() === owner) continue;
      const r = rand();
      const type = r < 0.12 ? 'endorse' : r < 0.3 ? 'support' : r < 0.34 ? 'help' : null;
      if (!type) continue;
      await Support.create({
        goal: goal._id, user: user._id, type, week: goal.weekNumber,
        message: type === 'help' ? helpNotes[Math.floor(rand() * helpNotes.length)] : undefined,
        createdAt: new Date(Math.min(now, goal.createdAt.getTime() + rand() * 4 * 24 * 3600 * 1000)),
      });
    }
  }

  // Bi-weekly cohort meetings with attendance
  for (let w = 1; w < WEEKS; w += 2) {
    await Meeting.create({
      cohort: cohort._id, title: `Cohort review — week ${w}`, agenda: 'Wins, misses, and asks', duration: 60,
      scheduledAt: new Date(start.getTime() + w * WEEK_MS + 3 * 24 * 3600 * 1000), createdBy: facilitator._id,
      attendance: users.filter((u) => rand() < u.reliability).map((u) => u.user._id),
    });
  }
  await Meeting.create({
    cohort: cohort._id, title: 'Demo day dry run', agenda: '5-minute pitches + investor Q&A', duration: 90,
    scheduledAt: new Date(now + 4 * 24 * 3600 * 1000), createdBy: facilitator._id,
  });

  console.log(`\nSeeded cohort "${cohort.name}" (invite code ${cohort.inviteCode}) with ${users.length} founders.`);
  console.log(`Log in with password "${PASSWORD}":`);
  console.log(`  founder      amara@${DOMAIN}`);
  console.log(`  investor     investor@${DOMAIN}`);
  console.log(`  facilitator  facilitator@${DOMAIN}`);
  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
