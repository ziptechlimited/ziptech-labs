// Pure scoring logic for a founder's Execution Record.
// Kept free of database access so it can be unit-tested and reused for
// single reports, the investor directory, and cohort leaderboards.

export type GoalStatus = 'pending' | 'done' | 'partial' | 'not_done';
export type SupportType = 'support' | 'help' | 'endorse';

export interface ScoreGoal {
  _id: string;
  type: 'public' | 'private';
  description: string;
  status: GoalStatus;
  weekNumber: number;
  createdAt: Date;
  subTasks?: { description: string; completed: boolean }[];
}

export interface ScoreCheckIn {
  goal: string;
  status: 'done' | 'partial' | 'not_done';
  blockerNote?: string;
  createdAt: Date;
}

export interface ScoreSupport {
  goal: string;
  type: SupportType;
  createdAt: Date;
}

export interface ScoreInput {
  goals: ScoreGoal[];
  checkIns: ScoreCheckIn[];
  supportsReceived: ScoreSupport[];
  supportsGiven: ScoreSupport[];
  meetingsHeld: number;
  meetingsAttended: number;
  now?: Date;
}

export interface TimelineEntry {
  id: string;
  description: string;
  type: 'public' | 'private';
  weekNumber: number;
  weekOf: string;
  status: GoalStatus;
  checkedIn: boolean;
  checkInAt?: string;
  blockerNote?: string;
  hadBlocker: boolean;
  subTasks: { total: number; completed: number };
  peer: { endorse: number; support: number; help: number };
}

export interface ScoreBreakdown {
  delivery: number;
  followThrough: number;
  consistency: number;
  peerValidation: number;
  community: number;
}

export interface ExecutionRecord {
  score: number;
  tier: 'Exceptional' | 'Strong' | 'Developing' | 'Early';
  provisional: boolean;
  breakdown: ScoreBreakdown;
  stats: {
    commitments: number;
    publicCommitments: number;
    privateCommitments: number;
    resolved: number;
    done: number;
    partial: number;
    notDone: number;
    deliveryRate: number;
    followThroughRate: number;
    activeWeeks: number;
    weeksTracked: number;
    currentStreak: number;
    longestStreak: number;
    blockersReported: number;
    endorsements: number;
    supportsReceived: number;
    helpOffersReceived: number;
    supportsGiven: number;
    helpGiven: number;
    meetingsHeld: number;
    meetingsAttended: number;
    attendanceRate: number | null;
    firstCommitmentAt: string | null;
    lastActivityAt: string | null;
  };
  activity: { date: string; count: number }[];
  weekly: { weekOf: string; commitments: number; delivered: number }[];
  timeline: TimelineEntry[];
}

export const WEIGHTS: ScoreBreakdown = {
  delivery: 0.35,
  followThrough: 0.25,
  consistency: 0.2,
  peerValidation: 0.1,
  community: 0.1,
};

// Below this many resolved commitments the score is shown as provisional.
export const MIN_RESOLVED_FOR_CONFIDENCE = 4;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0);
const round1 = (n: number) => Math.round(n * 1000) / 10;

const toDayKey = (d: Date) => d.toISOString().slice(0, 10);

// Monday 00:00 UTC of the week containing `d`.
export const weekStart = (d: Date): Date => {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - dow * DAY_MS);
};

// Tiers are gated on delivery as well as score, so strong habits alone
// can't earn a label that overstates what actually shipped.
export const tierFor = (score: number, delivery: number): ExecutionRecord['tier'] => {
  if (score >= 85 && delivery >= 0.85) return 'Exceptional';
  if (score >= 70 && delivery >= 0.65) return 'Strong';
  if (score >= 50) return 'Developing';
  return 'Early';
};

export const computeExecutionRecord = (
  input: ScoreInput,
  options: { includePrivate?: boolean } = {},
): ExecutionRecord => {
  const now = input.now ?? new Date();
  const goals = [...input.goals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const checkInByGoal = new Map<string, ScoreCheckIn>();
  input.checkIns.forEach((c) => checkInByGoal.set(String(c.goal), c));

  const peerByGoal = new Map<string, { endorse: number; support: number; help: number }>();
  input.supportsReceived.forEach((s) => {
    const key = String(s.goal);
    const entry = peerByGoal.get(key) ?? { endorse: 0, support: 0, help: 0 };
    entry[s.type] += 1;
    peerByGoal.set(key, entry);
  });

  const done = goals.filter((g) => g.status === 'done').length;
  const partial = goals.filter((g) => g.status === 'partial').length;
  const notDone = goals.filter((g) => g.status === 'not_done').length;
  const resolved = done + partial + notDone;

  // A commitment is "due" once it is resolved or its week has passed.
  const due = goals.filter(
    (g) => g.status !== 'pending' || now.getTime() - new Date(g.createdAt).getTime() > WEEK_MS,
  ).length;

  const delivery = resolved > 0 ? (done + partial * 0.5) / resolved : 0;
  const followThrough = due > 0 ? resolved / due : 0;

  // Weekly cadence
  const weekKeys = new Set(goals.map((g) => toDayKey(weekStart(new Date(g.createdAt)))));
  const thisWeek = weekStart(now);
  const firstGoal = goals.length ? new Date(goals[goals.length - 1].createdAt) : null;
  const weeksTracked = firstGoal
    ? Math.floor((thisWeek.getTime() - weekStart(firstGoal).getTime()) / WEEK_MS) + 1
    : 0;
  const consistency = weeksTracked > 0 ? weekKeys.size / weeksTracked : 0;

  let longestStreak = 0;
  let run = 0;
  for (let i = weeksTracked - 1; i >= 0; i--) {
    const key = toDayKey(new Date(thisWeek.getTime() - i * WEEK_MS));
    run = weekKeys.has(key) ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }
  // The current week doesn't break a streak until it is over.
  let currentStreak = 0;
  let cursor = weekKeys.has(toDayKey(thisWeek)) ? thisWeek : new Date(thisWeek.getTime() - WEEK_MS);
  while (weekKeys.has(toDayKey(cursor))) {
    currentStreak += 1;
    cursor = new Date(cursor.getTime() - WEEK_MS);
  }

  // Peer signals
  const endorsements = input.supportsReceived.filter((s) => s.type === 'endorse').length;
  const supportsReceived = input.supportsReceived.filter((s) => s.type === 'support').length;
  const helpOffersReceived = input.supportsReceived.filter((s) => s.type === 'help').length;
  const publicCommitments = goals.filter((g) => g.type === 'public').length;
  // Full credit needs roughly two endorsements (or four supports) per public commitment.
  const peerValidation = publicCommitments
    ? clamp01((endorsements * 2 + supportsReceived) / (publicCommitments * 4))
    : 0;

  const helpGiven = input.supportsGiven.filter((s) => s.type === 'help').length;
  const meetingsHeld = input.meetingsHeld;
  const attendanceRate = meetingsHeld > 0 ? input.meetingsAttended / meetingsHeld : null;
  const givingRate = weekKeys.size > 0 ? clamp01(input.supportsGiven.length / (weekKeys.size * 2)) : 0;
  const community = attendanceRate === null ? givingRate : (givingRate + attendanceRate) / 2;

  const breakdown: ScoreBreakdown = {
    delivery: clamp01(delivery),
    followThrough: clamp01(followThrough),
    consistency: clamp01(consistency),
    peerValidation,
    community: clamp01(community),
  };
  const score = Math.round(
    100 *
      (Object.keys(WEIGHTS) as (keyof ScoreBreakdown)[]).reduce(
        (sum, k) => sum + WEIGHTS[k] * breakdown[k],
        0,
      ),
  );

  // Daily activity for the contribution graph (last 371 days = 53 weeks)
  const since = now.getTime() - 371 * DAY_MS;
  const activityMap = new Map<string, number>();
  const bump = (d: Date) => {
    const t = new Date(d).getTime();
    if (t < since || t > now.getTime()) return;
    const key = toDayKey(new Date(t));
    activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
  };
  goals.forEach((g) => bump(g.createdAt));
  input.checkIns.forEach((c) => bump(c.createdAt));
  input.supportsGiven.forEach((s) => bump(s.createdAt));
  const activity = [...activityMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Last 12 weeks of commitments vs delivered
  const weekly: ExecutionRecord['weekly'] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(thisWeek.getTime() - i * WEEK_MS);
    const key = toDayKey(start);
    const inWeek = goals.filter((g) => toDayKey(weekStart(new Date(g.createdAt))) === key);
    weekly.push({
      weekOf: key,
      commitments: inWeek.length,
      delivered: inWeek.filter((g) => g.status === 'done').length,
    });
  }

  const timeline: TimelineEntry[] = goals
    .filter((g) => options.includePrivate || g.type === 'public')
    .slice(0, 60)
    .map((g) => {
      const id = String(g._id);
      const checkIn = checkInByGoal.get(id);
      const subTasks = g.subTasks ?? [];
      return {
        id,
        description: g.description,
        type: g.type,
        weekNumber: g.weekNumber,
        weekOf: toDayKey(weekStart(new Date(g.createdAt))),
        status: g.status,
        checkedIn: !!checkIn,
        checkInAt: checkIn ? new Date(checkIn.createdAt).toISOString() : undefined,
        blockerNote: options.includePrivate ? checkIn?.blockerNote : undefined,
        hadBlocker: !!checkIn?.blockerNote,
        subTasks: { total: subTasks.length, completed: subTasks.filter((s) => s.completed).length },
        peer: peerByGoal.get(id) ?? { endorse: 0, support: 0, help: 0 },
      };
    });

  const allDates = [
    ...goals.map((g) => new Date(g.createdAt).getTime()),
    ...input.checkIns.map((c) => new Date(c.createdAt).getTime()),
    ...input.supportsGiven.map((s) => new Date(s.createdAt).getTime()),
  ];

  return {
    score,
    tier: tierFor(score, delivery),
    provisional: resolved < MIN_RESOLVED_FOR_CONFIDENCE,
    breakdown,
    stats: {
      commitments: goals.length,
      publicCommitments,
      privateCommitments: goals.length - publicCommitments,
      resolved,
      done,
      partial,
      notDone,
      deliveryRate: round1(delivery),
      followThroughRate: round1(followThrough),
      activeWeeks: weekKeys.size,
      weeksTracked,
      currentStreak,
      longestStreak,
      blockersReported: input.checkIns.filter((c) => !!c.blockerNote).length,
      endorsements,
      supportsReceived,
      helpOffersReceived,
      supportsGiven: input.supportsGiven.length,
      helpGiven,
      meetingsHeld,
      meetingsAttended: input.meetingsAttended,
      attendanceRate: attendanceRate === null ? null : round1(attendanceRate),
      firstCommitmentAt: firstGoal ? firstGoal.toISOString() : null,
      lastActivityAt: allDates.length ? new Date(Math.max(...allDates)).toISOString() : null,
    },
    activity,
    weekly,
    timeline,
  };
};
