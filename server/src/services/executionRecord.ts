import mongoose from 'mongoose';
import Goal from '../models/Goal';
import CheckIn from '../models/CheckIn';
import Support from '../models/Support';
import Meeting from '../models/Meeting';
import Cohort from '../models/Cohort';
import { IUserDocument } from '../models/User';
import { computeExecutionRecord, ExecutionRecord } from './executionScore';

export const PUBLIC_PROFILE_FIELDS =
  'name slug avatarUrl headline bio company companyOneLiner website location sector stage fundraising raiseAmount linkedin twitter isVerified cohort role createdAt';

export const serializeProfile = (user: IUserDocument, cohortName?: string) => ({
  _id: user._id.toString(),
  name: user.name,
  slug: user.slug,
  avatarUrl: user.avatarUrl,
  headline: user.headline,
  bio: user.bio,
  company: user.company,
  companyOneLiner: user.companyOneLiner,
  website: user.website,
  location: user.location,
  sector: user.sector,
  stage: user.stage,
  fundraising: !!user.fundraising,
  raiseAmount: user.raiseAmount,
  linkedin: user.linkedin,
  twitter: user.twitter,
  isVerified: !!user.isVerified,
  cohortName,
  memberSince: user.createdAt,
});

const idOf = (v: any) => String(v?._id ?? v);

// Builds execution records for many users with a fixed number of queries.
export const loadExecutionRecords = async (
  users: IUserDocument[],
  options: { includePrivateFor?: string } = {},
): Promise<Map<string, ExecutionRecord>> => {
  const ids = users.map((u) => u._id);
  const cohortIds = [...new Set(users.filter((u) => u.cohort).map((u) => idOf(u.cohort)))].map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  const [goals, checkIns, supportsGiven, meetings] = await Promise.all([
    Goal.find({ user: { $in: ids } }).lean(),
    CheckIn.find({ user: { $in: ids } }).lean(),
    Support.find({ user: { $in: ids } }).lean(),
    cohortIds.length
      ? Meeting.find({ cohort: { $in: cohortIds }, scheduledAt: { $lte: new Date() } })
          .select('cohort scheduledAt attendance')
          .lean()
      : Promise.resolve([] as any[]),
  ]);
  const goalOwner = new Map(goals.map((g: any) => [String(g._id), String(g.user)]));
  const supportsReceived = await Support.find({ goal: { $in: goals.map((g: any) => g._id) } }).lean();

  const group = <T>(rows: T[], key: (r: T) => string | undefined) => {
    const map = new Map<string, T[]>();
    rows.forEach((r) => {
      const k = key(r);
      if (!k) return;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    return map;
  };

  const goalsBy = group(goals as any[], (g) => String(g.user));
  const checkInsBy = group(checkIns as any[], (c) => String(c.user));
  const givenBy = group(supportsGiven as any[], (s) => String(s.user));
  const receivedBy = group(supportsReceived as any[], (s) => goalOwner.get(String(s.goal)));
  const meetingsBy = group(meetings as any[], (m) => String(m.cohort));

  const records = new Map<string, ExecutionRecord>();
  users.forEach((u) => {
    const uid = u._id.toString();
    const joined = new Date(u.createdAt).getTime();
    const cohortMeetings = (u.cohort ? meetingsBy.get(idOf(u.cohort)) ?? [] : []).filter(
      (m: any) => new Date(m.scheduledAt).getTime() >= joined,
    );
    const attended = cohortMeetings.filter((m: any) =>
      (m.attendance ?? []).some((a: any) => String(a) === uid),
    ).length;

    records.set(
      uid,
      computeExecutionRecord(
        {
          goals: (goalsBy.get(uid) ?? []).map((g: any) => ({ ...g, _id: String(g._id) })),
          checkIns: (checkInsBy.get(uid) ?? []).map((c: any) => ({ ...c, goal: String(c.goal) })),
          supportsReceived: (receivedBy.get(uid) ?? []).map((s: any) => ({ ...s, goal: String(s.goal) })),
          supportsGiven: (givenBy.get(uid) ?? []).map((s: any) => ({ ...s, goal: String(s.goal) })),
          meetingsHeld: cohortMeetings.length,
          meetingsAttended: attended,
        },
        { includePrivate: options.includePrivateFor === uid },
      ),
    );
  });
  return records;
};

export const loadExecutionRecord = async (user: IUserDocument, includePrivate = false) => {
  const records = await loadExecutionRecords([user], {
    includePrivateFor: includePrivate ? user._id.toString() : undefined,
  });
  return records.get(user._id.toString())!;
};

export const cohortNames = async (users: IUserDocument[]) => {
  const ids = [...new Set(users.filter((u) => u.cohort).map((u) => idOf(u.cohort)))];
  const cohorts = ids.length ? await Cohort.find({ _id: { $in: ids } }).select('name').lean() : [];
  return new Map(cohorts.map((c: any) => [String(c._id), c.name as string]));
};

// Compact summary used by the directory, watchlist, and leaderboards.
export const summarize = (record: ExecutionRecord) => ({
  score: record.score,
  tier: record.tier,
  provisional: record.provisional,
  deliveryRate: record.stats.deliveryRate,
  followThroughRate: record.stats.followThroughRate,
  currentStreak: record.stats.currentStreak,
  longestStreak: record.stats.longestStreak,
  activeWeeks: record.stats.activeWeeks,
  commitments: record.stats.commitments,
  endorsements: record.stats.endorsements,
  lastActivityAt: record.stats.lastActivityAt,
  weekly: record.weekly,
});

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const recordToCsv = (profile: ReturnType<typeof serializeProfile>, record: ExecutionRecord) => {
  const rows: unknown[][] = [
    ['Ziptech Labs Execution Report'],
    ['Generated', new Date().toISOString()],
    [],
    ['Founder', profile.name],
    ['Company', profile.company],
    ['Stage', profile.stage],
    ['Sector', profile.sector],
    ['Location', profile.location],
    ['Website', profile.website],
    [],
    ['Execution Score', record.score],
    ['Tier', record.tier + (record.provisional ? ' (provisional)' : '')],
    ...Object.entries(record.breakdown).map(([k, v]) => [`Component: ${k}`, Math.round(v * 100)]),
    [],
    ...Object.entries(record.stats).map(([k, v]) => [k, v]),
    [],
    ['Week of', 'Commitment', 'Visibility', 'Outcome', 'Checked in', 'Subtasks done', 'Endorsements', 'Supports', 'Help offers'],
    ...record.timeline.map((t) => [
      t.weekOf,
      t.description,
      t.type,
      t.status,
      t.checkedIn ? 'yes' : 'no',
      `${t.subTasks.completed}/${t.subTasks.total}`,
      t.peer.endorse,
      t.peer.support,
      t.peer.help,
    ]),
  ];
  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
};
