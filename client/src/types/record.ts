export type GoalStatus = "pending" | "done" | "partial" | "not_done";

export interface FounderProfile {
  _id: string;
  name: string;
  slug?: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  company?: string;
  companyOneLiner?: string;
  website?: string;
  location?: string;
  sector?: string;
  stage?: string;
  fundraising?: boolean;
  raiseAmount?: string;
  linkedin?: string;
  twitter?: string;
  isVerified?: boolean;
  cohortName?: string;
  memberSince?: string;
  email?: string;
}

export interface TimelineEntry {
  id: string;
  description: string;
  type: "public" | "private";
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

export interface WeeklyPoint {
  weekOf: string;
  commitments: number;
  delivered: number;
}

export interface ExecutionRecord {
  score: number;
  tier: "Exceptional" | "Strong" | "Developing" | "Early";
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
  weekly: WeeklyPoint[];
  timeline: TimelineEntry[];
}

export interface RecordSummary {
  score: number;
  tier: ExecutionRecord["tier"];
  provisional: boolean;
  deliveryRate: number;
  followThroughRate: number;
  currentStreak: number;
  longestStreak: number;
  activeWeeks: number;
  commitments: number;
  endorsements: number;
  lastActivityAt: string | null;
  weekly: WeeklyPoint[];
}

export interface FounderListing {
  profile: FounderProfile;
  summary: RecordSummary;
  committedThisWeek?: boolean;
}

export const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "pre-seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "growth", label: "Growth" },
];

export const stageLabel = (s?: string) => STAGES.find((x) => x.value === s)?.label ?? s ?? "";
