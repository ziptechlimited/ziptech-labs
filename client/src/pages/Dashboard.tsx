import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowUpRight, Check, Globe2, Lock, Plus, Share2, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API, cn, errorMessage, pct, reportUrl } from "../lib/api";
import AppShell from "../components/ui/AppShell";
import ScoreRing from "../components/ui/ScoreRing";
import ContributionGraph from "../components/ui/ContributionGraph";
import WeeklyBars from "../components/ui/WeeklyBars";
import { Avatar, Counter, EmptyState, Eyebrow, Spinner, StatusPill, TierPill } from "../components/ui/primitives";
import GoalForm from "../components/GoalForm";
import JoinCohortModal from "../components/JoinCohortModal";
import CheckInModal from "../components/CheckInModal";
import SupportActions from "../components/SupportActions";
import MeetingsList from "../components/MeetingsList";
import ChatPanel from "../components/ChatPanel";
import type { ExecutionRecord, GoalStatus } from "../types/record";

interface SubTask {
  description: string;
  completed: boolean;
}

interface WeekGoal {
  _id: string;
  description: string;
  type: "public" | "private";
  status: GoalStatus;
  weekNumber: number;
  user: { _id: string; name: string; slug?: string; company?: string; avatarUrl?: string } | string;
  subTasks?: SubTask[];
  checkIn: { status: GoalStatus; blockerNote?: string; createdAt: string } | null;
  peer: { endorse: number; support: number; help: number };
  helpOffers: { user: { name: string; slug?: string }; message: string }[];
  mySupport: string[];
}

interface GoalsResponse {
  week: number | null;
  myGoals: WeekGoal[];
  publicGoals: WeekGoal[];
}

interface Cohort {
  _id: string;
  name: string;
  startDate: string;
  facilitator?: { name: string };
  members: Array<{ _id: string; name: string; role: string; slug?: string }>;
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [goals, setGoals] = useState<GoalsResponse | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [goalForm, setGoalForm] = useState<{ open: boolean; type: "public" | "private" }>({ open: false, type: "public" });
  const [joinOpen, setJoinOpen] = useState(false);
  const [pendingInvite, setPendingInvite] = useState("");
  const [checkIn, setCheckIn] = useState<{ goalId: string; description: string } | null>(null);
  const [tab, setTab] = useState<"feed" | "meetings" | "chat">("feed");
  const verified = !!user?.isVerified;
  const hasCohort = !!user?.cohort;

  const load = useCallback(async () => {
    const tasks: Promise<unknown>[] = [
      axios.get(`${API}/users/me/record`).then((r) => setRecord(r.data.record)),
    ];
    if (verified) {
      tasks.push(
        axios.get(`${API}/goals`).then((r) => setGoals(r.data)),
        hasCohort
          ? axios.get(`${API}/cohorts/my-cohort`).then((r) => setCohort(r.data))
          : Promise.resolve(setCohort(null)),
      );
    } else {
      setGoals({ week: null, myGoals: [], publicGoals: [] });
    }
    try {
      await Promise.all(tasks);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't load your dashboard"));
    }
  }, [verified, hasCohort]);

  useEffect(() => {
    load();
  }, [load]);

  // Invite links from facilitators land here after sign-up.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("invite") || localStorage.getItem("pendingInvite");
    if (code && !hasCohort && verified) {
      setPendingInvite(code);
      setJoinOpen(true);
    }
  }, [hasCohort, verified]);

  const myGoal = (type: "public" | "private") => goals?.myGoals.find((g) => g.type === type);

  const toggleSubTask = async (goal: WeekGoal, idx: number) => {
    const updated = (goal.subTasks ?? []).map((st, i) => (i === idx ? { ...st, completed: !st.completed } : st));
    setGoals((g) => g && { ...g, myGoals: g.myGoals.map((x) => (x._id === goal._id ? { ...x, subTasks: updated } : x)) });
    try {
      await axios.patch(`${API}/goals/${goal._id}`, { subTasks: updated });
    } catch (e) {
      toast.error(errorMessage(e));
      load();
    }
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl(user?.slug));
      toast.success("Record link copied. Send it to investors.");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  if (!goals || !record) {
    return (
      <AppShell wide>
        <Spinner label="Loading your week" />
      </AppShell>
    );
  }

  const firstName = user?.name.split(" ")[0];
  const s = record.stats;

  return (
    <AppShell wide>
      {/* Header */}
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>
            {goals.week ? `Week ${goals.week}` : "Getting started"}
            {cohort && <span className="text-faint">· {cohort.name}</span>}
          </Eyebrow>
          <h1 className="display mt-4 text-4xl font-medium sm:text-5xl">
            {greeting()}, {firstName}.
            <span className="block text-subtle">What will you ship this week?</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={copyReport} className="btn btn-secondary">
            <Share2 className="h-4 w-4" /> Share record
          </button>
          <Link to={`/f/${user?.slug}`} className="btn btn-primary">
            View record <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {/* Commitments */}
          {!verified ? null : !hasCohort ? (
            <section className="card relative overflow-hidden p-8 sm:p-10">
              <div className="glow-lime pointer-events-none absolute -right-20 -top-20 h-80 w-80" />
              <Eyebrow>Step 01</Eyebrow>
              <h2 className="display mt-4 max-w-lg text-3xl font-medium">Join a cohort to start your execution record.</h2>
              <p className="mt-3 max-w-lg text-subtle">
                Cohorts are small groups of founders who commit weekly in front of each other. Your facilitator will give you an invite code.
              </p>
              <button type="button" className="btn btn-primary btn-lg mt-8" onClick={() => setJoinOpen(true)}>
                <Users className="h-4 w-4" /> Enter invite code
              </button>
            </section>
          ) : (
            <section className="grid gap-4 md:grid-cols-2">
              {(["public", "private"] as const).map((type, i) => {
                const g = myGoal(type);
                return (
                  <article key={type} className={cn("card flex flex-col p-6", !g && "border-dashed")}>
                    <div className="flex items-center justify-between">
                      <span className="eyebrow flex items-center gap-2 text-[10px]">
                        {type === "public" ? <Globe2 className="h-3.5 w-3.5 text-lime" /> : <Lock className="h-3.5 w-3.5 text-gold" />}
                        {type} commitment
                      </span>
                      <Counter index={i + 1} total={2} />
                    </div>
                    {g ? (
                      <CommitmentCard goal={g} onCheckIn={() => setCheckIn({ goalId: g._id, description: g.description })} onToggle={(idx) => toggleSubTask(g, idx)} />
                    ) : (
                      <div className="flex flex-1 flex-col items-start justify-between gap-6 pt-6">
                        <p className="text-sm text-subtle">
                          {type === "public"
                            ? "Your cohort sees it, can back it, and investors see the outcome."
                            : "Just for you. The outcome still counts toward your score."}
                        </p>
                        <button type="button" onClick={() => setGoalForm({ open: true, type })} className="btn btn-secondary">
                          <Plus className="h-4 w-4" /> Set {type} commitment
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          )}

          {/* Execution graph */}
          <section className="card p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow">Your execution graph</p>
              <span className="text-xs text-faint">Commitments, check-ins and peer support</span>
            </div>
            <ContributionGraph activity={record.activity} />
          </section>

          {/* Cohort tabs */}
          {cohort && (
            <section className="card p-6">
              <div role="tablist" aria-label="Cohort" className="mb-6 flex gap-1">
                {(
                  [
                    ["feed", "Cohort commitments"],
                    ["meetings", "Meetings"],
                    ["chat", "Chat"],
                  ] as const
                ).map(([key, label]) => (
                  <button key={key} role="tab" type="button" aria-selected={tab === key} onClick={() => setTab(key)} className="tab">
                    {label}
                    {key === "feed" && goals.publicGoals.length > 0 && <span className="num ml-1.5 text-[11px] opacity-60">{goals.publicGoals.length}</span>}
                  </button>
                ))}
              </div>

              {tab === "feed" &&
                (goals.publicGoals.length === 0 ? (
                  <EmptyState title="Quiet so far" body="Public commitments from your cohort will appear here as founders set them." />
                ) : (
                  <ul className="space-y-3">
                    {goals.publicGoals.map((g) => {
                      const owner = typeof g.user === "string" ? null : g.user;
                      return (
                        <li key={g._id} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                              <Avatar name={owner?.name} src={owner?.avatarUrl} size={36} />
                              <div className="min-w-0">
                                <p className="text-sm">
                                  {owner?.slug ? <Link to={`/f/${owner.slug}`} className="text-ink hover:text-lime">{owner.name}</Link> : owner?.name}
                                  {owner?.company && <span className="text-faint"> · {owner.company}</span>}
                                </p>
                                <p className="mt-1.5 text-ink">{g.description}</p>
                              </div>
                            </div>
                            <StatusPill status={g.status} />
                          </div>
                          <div className="pl-12">
                            <SupportActions goalId={g._id} given={g.mySupport} counts={g.peer} onSuccess={load} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ))}
              {tab === "meetings" && <MeetingsList cohortId={cohort._id} />}
              {tab === "chat" && <ChatPanel cohortId={cohort._id} />}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Execution score</p>
              <TierPill tier={record.tier} provisional={record.provisional} />
            </div>
            <div className="mt-6 flex items-center gap-6">
              <ScoreRing score={record.score} size={112} stroke={6} muted={record.provisional} />
              <dl className="grid flex-1 gap-3 text-sm">
                <div className="flex justify-between"><dt className="text-faint">Delivery</dt><dd className="num">{pct(s.deliveryRate)}</dd></div>
                <div className="flex justify-between"><dt className="text-faint">Streak</dt><dd className="num">{s.currentStreak}w</dd></div>
                <div className="flex justify-between"><dt className="text-faint">Endorsed</dt><dd className="num">{s.endorsements}</dd></div>
              </dl>
            </div>
            <div className="mt-6 border-t border-white/5 pt-5">
              <WeeklyBars weekly={record.weekly} height={44} showAxis />
            </div>
            {record.provisional && (
              <p className="mt-4 text-xs text-faint">Resolve {Math.max(0, 4 - s.resolved)} more commitment{4 - s.resolved === 1 ? "" : "s"} to unlock a confirmed score.</p>
            )}
          </section>

          {!user?.company && (
            <section className="rounded-[20px] border border-gold/25 bg-gold/[0.05] p-6">
              <p className="eyebrow text-gold">Make it investor-ready</p>
              <p className="mt-3 text-sm text-subtle">Add your company, stage and sector so investors can find you in discovery.</p>
              <Link to="/settings" className="btn btn-secondary btn-sm mt-4">Complete profile</Link>
            </section>
          )}

          {cohort && (
            <section className="card p-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Your cohort</p>
                <span className="num text-xs text-faint">{cohort.members.length} founders</span>
              </div>
              <p className="display mt-3 text-lg font-medium">{cohort.name}</p>
              {cohort.facilitator?.name && <p className="text-xs text-faint">Facilitated by {cohort.facilitator.name}</p>}
              <ul className="mt-5 space-y-1">
                {cohort.members.slice(0, 8).map((m) => (
                  <li key={m._id}>
                    <Link to={m.slug ? `/f/${m.slug}` : "#"} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-subtle transition hover:bg-white/[0.04] hover:text-ink">
                      <Avatar name={m.name} size={26} />
                      <span className="truncate">{m.name}</span>
                      {m._id === user?._id && <span className="ml-auto text-[10px] text-faint">you</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              {cohort.members.length > 8 && <p className="mt-2 px-2 text-xs text-faint">+{cohort.members.length - 8} more</p>}
            </section>
          )}
        </aside>
      </div>

      <GoalForm
        open={goalForm.open}
        defaultType={goalForm.type}
        takenTypes={goals.myGoals.map((g) => g.type)}
        week={goals.week}
        onClose={() => setGoalForm((f) => ({ ...f, open: false }))}
        onSuccess={() => {
          setGoalForm((f) => ({ ...f, open: false }));
          load();
        }}
      />
      <JoinCohortModal
        isOpen={joinOpen}
        initialCode={pendingInvite}
        onClose={() => setJoinOpen(false)}
        onSuccess={async () => {
          localStorage.removeItem("pendingInvite");
          setJoinOpen(false);
          await refreshUser();
        }}
      />
      <CheckInModal
        isOpen={!!checkIn}
        goalId={checkIn?.goalId ?? ""}
        goalDescription={checkIn?.description ?? ""}
        onClose={() => setCheckIn(null)}
        onSuccess={() => {
          setCheckIn(null);
          load();
        }}
      />
    </AppShell>
  );
};

const CommitmentCard = ({ goal, onCheckIn, onToggle }: { goal: WeekGoal; onCheckIn: () => void; onToggle: (idx: number) => void }) => {
  const subTasks = goal.subTasks ?? [];
  const done = subTasks.filter((s) => s.completed).length;
  return (
    <div className="flex flex-1 flex-col pt-5">
      <p className="display text-lg font-medium leading-snug">{goal.description}</p>

      {subTasks.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-faint">
            <span>Milestones</span>
            <span className="num">{done}/{subTasks.length}</span>
          </div>
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${(done / subTasks.length) * 100}%` }} />
          </div>
          <ul className="space-y-1">
            {subTasks.map((st, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => onToggle(idx)}
                  className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left text-sm transition hover:bg-white/[0.03]"
                  aria-pressed={st.completed}
                >
                  <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition", st.completed ? "border-lime bg-lime text-bg" : "border-white/20")}>
                    {st.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className={st.completed ? "text-faint line-through" : "text-subtle"}>{st.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {goal.type === "public" && (goal.peer.endorse + goal.peer.support + goal.peer.help > 0) && (
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-faint">
          {goal.peer.endorse > 0 && <span className="text-gold">★ {goal.peer.endorse} endorsed</span>}
          {goal.peer.support > 0 && <span>{goal.peer.support} backing you</span>}
          {goal.peer.help > 0 && <span>{goal.peer.help} offered help</span>}
        </p>
      )}
      {goal.helpOffers?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {goal.helpOffers.map((h, i) => (
            <li key={i} className="rounded-xl bg-white/[0.03] px-3 py-2 text-xs text-subtle">
              <span className="text-ink">{h.user?.name}:</span> {h.message}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <StatusPill status={goal.status} />
        {goal.checkIn ? (
          <span className="text-xs text-faint">Checked in {new Date(goal.checkIn.createdAt).toLocaleDateString(undefined, { weekday: "short" })}</span>
        ) : (
          <button type="button" onClick={onCheckIn} className="btn btn-primary btn-sm">Check in</button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
