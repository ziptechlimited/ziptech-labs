import { computeExecutionRecord, tierFor, weekStart, ScoreGoal } from "../services/executionScore";

const NOW = new Date("2026-10-29T12:00:00Z"); // Thursday
const WEEK = 7 * 24 * 60 * 60 * 1000;

const goal = (weeksAgo: number, status: ScoreGoal["status"], type: "public" | "private" = "public", id = `${weeksAgo}-${type}`): ScoreGoal => ({
  _id: id,
  type,
  description: `Goal ${id}`,
  status,
  weekNumber: 10 - weeksAgo,
  createdAt: new Date(NOW.getTime() - weeksAgo * WEEK),
  subTasks: [],
});

const empty = { checkIns: [], supportsReceived: [], supportsGiven: [], meetingsHeld: 0, meetingsAttended: 0, now: NOW };

describe("computeExecutionRecord", () => {
  it("returns a zero, provisional record with no activity", () => {
    const r = computeExecutionRecord({ goals: [], ...empty });
    expect(r.score).toBe(0);
    expect(r.provisional).toBe(true);
    expect(r.stats.currentStreak).toBe(0);
    expect(r.weekly).toHaveLength(12);
  });

  it("rewards consistent delivery with a high score and streak", () => {
    const goals = [0, 1, 2, 3, 4, 5].map((w) => goal(w, "done"));
    const r = computeExecutionRecord({
      goals,
      ...empty,
      supportsReceived: goals.flatMap((g) => [
        { goal: g._id, type: "endorse" as const, createdAt: NOW },
        { goal: g._id, type: "endorse" as const, createdAt: NOW },
      ]),
      supportsGiven: goals.flatMap((g) => [
        { goal: "x", type: "support" as const, createdAt: g.createdAt },
        { goal: "y", type: "help" as const, createdAt: g.createdAt },
      ]),
    });
    expect(r.stats.currentStreak).toBe(6);
    expect(r.stats.longestStreak).toBe(6);
    expect(r.stats.deliveryRate).toBe(100);
    expect(r.provisional).toBe(false);
    expect(r.score).toBe(100);
    expect(r.tier).toBe("Exceptional");
  });

  it("counts partial delivery as half and penalises unresolved past commitments", () => {
    const r = computeExecutionRecord({
      goals: [goal(1, "done"), goal(2, "partial"), goal(3, "pending")],
      ...empty,
    });
    expect(r.stats.deliveryRate).toBe(75);
    expect(r.stats.followThroughRate).toBeCloseTo(66.7, 1);
  });

  it("does not count the current week's pending commitment against follow-through", () => {
    const r = computeExecutionRecord({ goals: [goal(0, "pending")], ...empty });
    expect(r.stats.followThroughRate).toBe(0);
    expect(r.breakdown.followThrough).toBe(0);
    expect(r.stats.currentStreak).toBe(1);
  });

  it("keeps a streak alive when this week has no goal yet, and breaks on gaps", () => {
    const r = computeExecutionRecord({ goals: [goal(1, "done"), goal(2, "done"), goal(4, "done")], ...empty });
    expect(r.stats.currentStreak).toBe(2);
    expect(r.stats.longestStreak).toBe(2);
    expect(r.stats.activeWeeks).toBe(3);
  });

  it("hides private goals and blocker text from the public timeline", () => {
    const goals = [goal(1, "done", "public", "pub"), goal(1, "not_done", "private", "priv")];
    const checkIns = [{ goal: "pub", status: "done" as const, blockerNote: "waiting on legal", createdAt: NOW }];
    const pub = computeExecutionRecord({ goals, ...empty, checkIns });
    expect(pub.timeline.map((t) => t.id)).toEqual(["pub"]);
    expect(pub.timeline[0].blockerNote).toBeUndefined();
    expect(pub.timeline[0].hadBlocker).toBe(true);
    // ...but private goals still count toward the aggregate record
    expect(pub.stats.commitments).toBe(2);

    const owner = computeExecutionRecord({ goals, ...empty, checkIns }, { includePrivate: true });
    expect(owner.timeline).toHaveLength(2);
    expect(owner.timeline.find((t) => t.id === "pub")?.blockerNote).toBe("waiting on legal");
  });
});

describe("tierFor", () => {
  it("caps the tier when delivery is weak, even with a high score", () => {
    expect(tierFor(90, 0.9)).toBe("Exceptional");
    expect(tierFor(90, 0.72)).toBe("Strong");
    expect(tierFor(80, 0.55)).toBe("Developing");
    expect(tierFor(40, 1)).toBe("Early");
  });
});

describe("weekStart", () => {
  it("returns the Monday of the week in UTC", () => {
    expect(weekStart(NOW).toISOString()).toBe("2026-10-26T00:00:00.000Z");
    expect(weekStart(new Date("2026-11-01T23:00:00Z")).toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });
});
