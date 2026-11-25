import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Check, Copy, Link2, Mail, Pencil, Plus, Radio, Trash2, UserCheck, Video } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API, cn, errorMessage, pct } from "../lib/api";
import AppShell from "../components/ui/AppShell";
import Modal from "../components/ui/Modal";
import ScoreRing from "../components/ui/ScoreRing";
import { Avatar, EmptyState, Eyebrow, Spinner, Stat } from "../components/ui/primitives";
import CreateCohortModal from "../components/CreateCohortModal";
import ChatPanel from "../components/ChatPanel";
import { MeetingDate, type Meeting } from "../components/MeetingsList";
import type { FounderListing } from "../types/record";
import type { ICohort } from "../types/shared";

interface Analytics {
  cohort: { name: string; memberCount: number };
  metrics: { totalGoals: number; completedGoals: number; completionRate: number; submissionRate: number; engagementScore: number };
  currentWeek: number;
  leaderboard: FounderListing[];
}

const emptyMeeting = { title: "", agenda: "", date: "", time: "", duration: 60 };

const FacilitatorDashboard = () => {
  const { user, refreshUser } = useAuth();
  const cohortId = typeof user?.cohort === "string" ? user.cohort : (user?.cohort as any)?._id ?? "";
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [cohort, setCohort] = useState<ICohort | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [tab, setTab] = useState<"founders" | "meetings" | "chat">("founders");
  const [sessionActive, setSessionActive] = useState(false);
  const [meetingForm, setMeetingForm] = useState<{ open: boolean; editing?: Meeting; values: typeof emptyMeeting }>({ open: false, values: emptyMeeting });
  const [attendanceFor, setAttendanceFor] = useState<Meeting | null>(null);

  const load = useCallback(async () => {
    if (!cohortId) {
      setLoading(false);
      return;
    }
    try {
      const [a, c, m, chat] = await Promise.all([
        axios.get(`${API}/analytics/cohort/${cohortId}`),
        axios.get(`${API}/cohorts/my-cohort`),
        axios.get(`${API}/meetings?cohort=${cohortId}`),
        axios.get(`${API}/messages/${cohortId}/messages`).catch(() => null),
      ]);
      setAnalytics(a.data);
      setCohort(c.data);
      setMeetings(m.data);
      setSessionActive(!!chat?.data?.sessionActive);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't load cohort"));
    } finally {
      setLoading(false);
    }
  }, [cohortId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSession = async () => {
    try {
      const res = await axios.post(`${API}/checkin-sessions/${sessionActive ? "stop" : "start"}`, { cohortId });
      setSessionActive(res.data.active);
      toast.success(res.data.active ? "Live session started. Chat is open." : "Session ended");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const inviteLink = cohort?.inviteCode ? `${window.location.origin}/register?invite=${cohort.inviteCode}` : "";
  const emailInvite = () => {
    const body = `You're invited to join ${cohort?.name} on Ziptech Labs.\n\nCreate your account here: ${inviteLink}\n\nOr use invite code ${cohort?.inviteCode} after signing in.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(`Join ${cohort?.name} on Ziptech Labs`)}&body=${encodeURIComponent(body)}`;
  };

  const openMeetingForm = (m?: Meeting) => {
    const d = m ? new Date(m.scheduledAt) : null;
    setMeetingForm({
      open: true,
      editing: m,
      values: m
        ? { title: m.title, agenda: m.agenda ?? "", date: format(d!, "yyyy-MM-dd"), time: format(d!, "HH:mm"), duration: m.duration }
        : emptyMeeting,
    });
  };

  const saveMeeting = async (e: FormEvent) => {
    e.preventDefault();
    const v = meetingForm.values;
    const payload = { cohort: cohortId, title: v.title, agenda: v.agenda, duration: Number(v.duration), scheduledAt: new Date(`${v.date}T${v.time}:00`) };
    try {
      if (meetingForm.editing) await axios.patch(`${API}/meetings/${meetingForm.editing._id}`, payload);
      else await axios.post(`${API}/meetings`, payload);
      toast.success(meetingForm.editing ? "Meeting updated" : "Meeting scheduled");
      setMeetingForm({ open: false, values: emptyMeeting });
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save meeting"));
    }
  };

  const deleteMeeting = async (m: Meeting) => {
    if (!window.confirm(`Delete “${m.title}”?`)) return;
    try {
      await axios.delete(`${API}/meetings/${m._id}`);
      setMeetings((list) => list.filter((x) => x._id !== m._id));
      toast.success("Meeting deleted");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const meetingInvite = async (m: Meeting) => {
    try {
      const inv = await axios.post(`${API}/invite-codes/meeting/${m._id}`, { expiresInMinutes: 60 });
      await copy(inv.data.code, "Meeting invite code copied (valid 60 min)");
    } catch (e) {
      toast.error(errorMessage(e, "Failed to generate invite"));
    }
  };

  if (loading) {
    return (
      <AppShell wide>
        <Spinner label="Loading cohort" />
      </AppShell>
    );
  }

  if (!cohortId || !cohort || !analytics) {
    return (
      <AppShell>
        <section className="card relative overflow-hidden p-10 text-center sm:p-16">
          <div className="glow-lime pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2" />
          <Eyebrow>Facilitator</Eyebrow>
          <h1 className="display mx-auto mt-5 max-w-lg text-4xl font-medium">Start your first cohort.</h1>
          <p className="mx-auto mt-4 max-w-md text-subtle">Create a cohort, share the invite link, and founders start committing from week one.</p>
          <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-primary btn-lg mt-8">
            <Plus className="h-4 w-4" /> Create cohort
          </button>
        </section>
        <CreateCohortModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={async () => { setCreateOpen(false); await refreshUser(); }} />
      </AppShell>
    );
  }

  const m = analytics.metrics;
  const board = analytics.leaderboard;
  const committed = board.filter((f) => f.committedThisWeek).length;
  const now = Date.now();
  const upcoming = meetings.filter((x) => new Date(x.scheduledAt).getTime() + x.duration * 60000 >= now);
  const past = meetings.filter((x) => new Date(x.scheduledAt).getTime() + x.duration * 60000 < now).reverse();

  return (
    <AppShell wide>
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Week {analytics.currentWeek} · Facilitator</Eyebrow>
          <h1 className="display mt-4 text-4xl font-medium sm:text-5xl">{cohort.name}</h1>
          <p className="mt-2 text-subtle">
            Started {format(new Date(cohort.startDate), "MMM d, yyyy")} · {cohort.members.length} founders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={toggleSession} className={cn("btn", sessionActive ? "border border-lime/40 bg-lime/10 text-lime" : "btn-secondary")}>
            <Radio className={cn("h-4 w-4", sessionActive && "animate-pulse")} />
            {sessionActive ? "End live session" : "Start live session"}
          </button>
          <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-ghost">
            <Plus className="h-4 w-4" /> New cohort
          </button>
        </div>
      </header>

      {/* Invite */}
      <section className="mb-6 flex flex-col gap-4 rounded-[20px] border border-lime/20 bg-lime/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="eyebrow text-[10px]">Invite code</span>
          <span className="num rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xl tracking-[0.4em] text-lime">{cohort.inviteCode}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => copy(cohort.inviteCode!, "Invite code copied")}><Copy className="h-3.5 w-3.5" /> Code</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => copy(inviteLink, "Invite link copied")}><Link2 className="h-3.5 w-3.5" /> Link</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={emailInvite}><Mail className="h-3.5 w-3.5" /> Email</button>
        </div>
      </section>

      {/* Metrics */}
      <section className="card mb-6 grid grid-cols-2 gap-8 p-6 sm:p-8 lg:grid-cols-4">
        <Stat label="Committed this week" value={`${committed}/${board.length}`} hint={`${pct(m.submissionRate)} submission rate`} accent />
        <Stat label="Delivery rate" value={pct(m.completionRate)} hint={`${m.completedGoals} of ${m.totalGoals} commitments`} />
        <Stat label="Check-ins / founder" value={m.engagementScore} hint="All-time average" />
        <Stat label="Upcoming meetings" value={upcoming.length} hint={upcoming[0] ? format(new Date(upcoming[0].scheduledAt), "EEE MMM d, p") : "None scheduled"} />
      </section>

      <section className="card p-6">
        <div role="tablist" className="mb-6 flex gap-1">
          {(
            [
              ["founders", "Founders"],
              ["meetings", "Meetings"],
              ["chat", "Chat"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} role="tab" type="button" aria-selected={tab === k} className="tab" onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {tab === "founders" &&
          (board.length === 0 ? (
            <EmptyState title="No founders yet" body="Share your invite link to get founders into the cohort." />
          ) : (
            <div className="scroll-thin -mx-6 overflow-x-auto px-6">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="eyebrow text-left text-[10px]">
                    <th className="pb-4 pr-4 font-normal">#</th>
                    <th className="pb-4 pr-4 font-normal">Founder</th>
                    <th className="pb-4 pr-4 font-normal">Score</th>
                    <th className="pb-4 pr-4 font-normal">Delivery</th>
                    <th className="pb-4 pr-4 font-normal">Streak</th>
                    <th className="pb-4 pr-4 font-normal">This week</th>
                    <th className="pb-4 font-normal">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((f, i) => (
                    <tr key={f.profile._id} className="border-t border-white/5">
                      <td className="num py-3 pr-4 text-faint">{String(i + 1).padStart(2, "0")}</td>
                      <td className="py-3 pr-4">
                        <Link to={f.profile.slug ? `/f/${f.profile.slug}` : "#"} className="flex items-center gap-3 hover:text-lime">
                          <Avatar name={f.profile.name} src={f.profile.avatarUrl} size={32} />
                          <span>
                            <span className="block text-ink">{f.profile.name}</span>
                            <span className="block text-xs text-faint">{f.profile.company || f.profile.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 pr-4"><ScoreRing score={f.summary.score} size={40} stroke={3} muted={f.summary.provisional} /></td>
                      <td className="num py-3 pr-4">{pct(f.summary.deliveryRate)}</td>
                      <td className="num py-3 pr-4">{f.summary.currentStreak}w</td>
                      <td className="py-3 pr-4">
                        {f.committedThisWeek ? <span className="pill pill-lime"><Check className="h-3 w-3" /> Committed</span> : <span className="pill pill-warn">Not yet</span>}
                      </td>
                      <td className="py-3 text-xs text-faint">{f.summary.lastActivityAt ? format(new Date(f.summary.lastActivityAt), "MMM d") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === "meetings" && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-subtle">Attendance you mark here counts toward founders' community score.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => openMeetingForm()}><Plus className="h-3.5 w-3.5" /> Schedule</button>
            </div>
            {meetings.length === 0 ? (
              <EmptyState title="No meetings yet" body="Schedule your first cohort session." />
            ) : (
              <div className="space-y-8">
                {[["Upcoming", upcoming], ["Past", past]].map(([label, list]) =>
                  (list as Meeting[]).length === 0 ? null : (
                    <div key={label as string}>
                      <p className="eyebrow mb-3 text-[10px]">{label as string}</p>
                      <ul className="space-y-3">
                        {(list as Meeting[]).map((mt) => (
                          <li key={mt._id} className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 sm:flex-row sm:items-center">
                            <div className="flex flex-1 gap-4">
                              <MeetingDate iso={mt.scheduledAt} />
                              <div className="min-w-0">
                                <p className="text-ink">{mt.title}</p>
                                <p className="mt-1 text-xs text-faint">
                                  {format(new Date(mt.scheduledAt), "EEE p")} · {mt.duration} min · {mt.rsvps.filter((r) => r.status === "yes").length} going
                                  {label === "Past" && ` · ${mt.attendance?.length ?? 0} attended`}
                                </p>
                                {mt.agenda && <p className="mt-1.5 text-sm text-subtle">{mt.agenda}</p>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {mt.meetLink && <a href={mt.meetLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><Video className="h-3.5 w-3.5" /></a>}
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttendanceFor(mt)}><UserCheck className="h-3.5 w-3.5" /> Attendance</button>
                              {label === "Upcoming" && <button type="button" className="btn btn-ghost btn-sm" onClick={() => meetingInvite(mt)}>Invite code</button>}
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openMeetingForm(mt)} aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteMeeting(mt)} aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {tab === "chat" && <ChatPanel cohortId={cohortId} moderator />}
      </section>

      <CreateCohortModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={async () => { setCreateOpen(false); await refreshUser(); }} />

      <Modal open={meetingForm.open} onClose={() => setMeetingForm({ open: false, values: emptyMeeting })} title={meetingForm.editing ? "Edit meeting" : "Schedule a meeting"} eyebrow="Cohort session">
        <form onSubmit={saveMeeting} className="space-y-5">
          <label className="block">
            <span className="field-label">Title</span>
            <input className="input" required value={meetingForm.values.title} onChange={(e) => setMeetingForm((f) => ({ ...f, values: { ...f.values, title: e.target.value } }))} placeholder="Weekly review" />
          </label>
          <label className="block">
            <span className="field-label">Agenda</span>
            <textarea className="input resize-none" rows={3} value={meetingForm.values.agenda} onChange={(e) => setMeetingForm((f) => ({ ...f, values: { ...f.values, agenda: e.target.value } }))} />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-3 block sm:col-span-1">
              <span className="field-label">Date</span>
              <input type="date" required className="input" value={meetingForm.values.date} onChange={(e) => setMeetingForm((f) => ({ ...f, values: { ...f.values, date: e.target.value } }))} />
            </label>
            <label className="block">
              <span className="field-label">Time</span>
              <input type="time" required className="input" value={meetingForm.values.time} onChange={(e) => setMeetingForm((f) => ({ ...f, values: { ...f.values, time: e.target.value } }))} />
            </label>
            <label className="block">
              <span className="field-label">Minutes</span>
              <input type="number" min={15} max={240} step={15} className="input" value={meetingForm.values.duration} onChange={(e) => setMeetingForm((f) => ({ ...f, values: { ...f.values, duration: Number(e.target.value) } }))} />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setMeetingForm({ open: false, values: emptyMeeting })}>Cancel</button>
            <button type="submit" className="btn btn-primary">{meetingForm.editing ? "Save" : "Schedule"}</button>
          </div>
        </form>
      </Modal>

      {attendanceFor && (
        <AttendanceModal
          meeting={attendanceFor}
          members={cohort.members}
          onClose={() => setAttendanceFor(null)}
          onSaved={() => {
            setAttendanceFor(null);
            load();
          }}
        />
      )}
    </AppShell>
  );
};

const AttendanceModal = ({ meeting, members, onClose, onSaved }: { meeting: Meeting; members: ICohort["members"]; onClose: () => void; onSaved: () => void }) => {
  const [selected, setSelected] = useState<Set<string>>(() => new Set((meeting.attendance ?? []).map(String)));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API}/meetings/${meeting._id}/attendance`, { attendees: [...selected] });
      toast.success("Attendance saved");
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={meeting.title} eyebrow="Mark attendance" width="max-w-md">
      <ul className="scroll-thin max-h-80 space-y-1 overflow-y-auto">
        {members.map((mem) => {
          const on = selected.has(mem._id);
          return (
            <li key={mem._id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setSelected((s) => {
                  const next = new Set(s);
                  if (on) next.delete(mem._id);
                  else next.add(mem._id);
                  return next;
                })}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-white/[0.04]"
              >
                <span className={cn("grid h-4 w-4 place-items-center rounded-[5px] border", on ? "border-lime bg-lime text-bg" : "border-white/20")}>
                  {on && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <Avatar name={mem.name} size={26} />
                {mem.name}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <span className="num text-xs text-faint">{selected.size}/{members.length} present</span>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </Modal>
  );
};

export default FacilitatorDashboard;
