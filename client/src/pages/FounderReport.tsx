import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Download,
  Eye,
  Globe,
  Link2,
  Linkedin,
  Lock,
  MapPin,
  Printer,
  Twitter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API, PUBLIC_API, cn, errorMessage, pct, reportUrl } from "../lib/api";
import AppShell from "../components/ui/AppShell";
import ScoreRing from "../components/ui/ScoreRing";
import ContributionGraph from "../components/ui/ContributionGraph";
import WeeklyBars from "../components/ui/WeeklyBars";
import { Avatar, EmptyState, Eyebrow, SectionHeading, Spinner, Stat, StatusPill, TierPill } from "../components/ui/primitives";
import { ExecutionRecord, FounderProfile, ScoreBreakdown, TimelineEntry, stageLabel } from "../types/record";

interface ReportData {
  profile: FounderProfile;
  record: ExecutionRecord;
}

const COMPONENTS: { key: keyof ScoreBreakdown; label: string; weight: number; help: string }[] = [
  { key: "delivery", label: "Delivery", weight: 35, help: "Share of resolved commitments delivered (partial counts as half)." },
  { key: "followThrough", label: "Follow-through", weight: 25, help: "Commitments closed out with an honest check-in once due." },
  { key: "consistency", label: "Consistency", weight: 20, help: "Weeks with a commitment since the first one." },
  { key: "peerValidation", label: "Peer validation", weight: 10, help: "Endorsements and support from cohort peers on public goals." },
  { key: "community", label: "Community", weight: 10, help: "Support given to others and cohort meeting attendance." },
];

const fmtDate = (iso?: string | null, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) =>
  iso ? new Date(iso).toLocaleDateString(undefined, opts) : "—";

const externalHref = (url?: string) => (!url ? undefined : /^https?:\/\//.test(url) ? url : `https://${url}`);

const FounderReport = () => {
  const { slug } = useParams();
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [previewAsInvestor, setPreviewAsInvestor] = useState(false);
  const isOwner = !!user && user.slug === slug;

  useEffect(() => {
    setData(null);
    setNotFound(false);
    const req = isOwner ? axios.get(`${API}/users/me/record`) : axios.get(`${PUBLIC_API}/profile/${slug}`);
    req
      .then((res) => {
        setData({ profile: res.data.profile, record: res.data.record });
        setIsPublic(isOwner ? res.data.isProfilePublic : true);
      })
      .catch(() => setNotFound(true));
  }, [slug, isOwner]);

  useEffect(() => {
    if (data) document.title = `${data.profile.name} · Execution Record · Ziptech Labs`;
    return () => {
      document.title = "Ziptech Labs — The execution record for founders";
    };
  }, [data]);

  const watching = !!data && !!user?.watchlist?.map(String).includes(data.profile._id);
  const canWatch = user?.role === "investor" || user?.role === "admin";

  const toggleWatch = async () => {
    if (!data) return;
    try {
      const res = await axios.post(`${API}/users/me/watchlist/${data.profile._id}`);
      await refreshUser();
      toast.success(res.data.watching ? "Added to watchlist" : "Removed from watchlist");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl(slug));
      toast.success("Report link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const timeline = useMemo(
    () => (data ? data.record.timeline.filter((t) => !previewAsInvestor || t.type === "public") : []),
    [data, previewAsInvestor],
  );

  if (notFound) {
    return (
      <AppShell>
        <EmptyState
          title="No public record here"
          body="This founder doesn't exist or has made their execution record private."
          action={<Link to="/discover" className="btn btn-secondary">Browse founders</Link>}
        />
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <Spinner label="Compiling record" />
      </AppShell>
    );
  }

  const { profile, record } = data;
  const s = record.stats;
  const generated = new Date().toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });

  return (
    <AppShell wide>
      <div className="print-sheet">
        {/* Print header */}
        <div className="print-only mb-6 border-b pb-4">
          <p className="eyebrow">Ziptech Labs · Founder Execution Report</p>
          <p className="mt-1 text-xs">Generated {generated} · {reportUrl(slug)}</p>
        </div>

        {/* Owner bar */}
        {isOwner && (
          <div className="no-print mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 pl-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-subtle">
              {isPublic ? <Eye className="h-4 w-4 text-lime" /> : <Lock className="h-4 w-4 text-gold" />}
              {isPublic
                ? previewAsInvestor
                  ? "Previewing what investors see."
                  : "Your view includes private commitments and blocker notes. Investors only see public items."
                : "Your record is private. Make it public in settings so investors can find you."}
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreviewAsInvestor((v) => !v)}>
                {previewAsInvestor ? "Back to owner view" : "Preview as investor"}
              </button>
              <Link to="/settings" className="btn btn-secondary btn-sm">Edit profile</Link>
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <div className="glow-lime pointer-events-none absolute -right-24 -top-24 h-72 w-72 no-print" />
            <Eyebrow>Founder execution record</Eyebrow>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar name={profile.name} src={profile.avatarUrl} size={76} />
              <div className="min-w-0">
                <h1 className="display flex flex-wrap items-center gap-2 text-3xl font-medium sm:text-[2.6rem]">
                  {profile.name}
                  {profile.isVerified && <BadgeCheck className="h-6 w-6 text-lime" aria-label="Verified email" />}
                </h1>
                {profile.headline && <p className="mt-2 text-subtle">{profile.headline}</p>}
              </div>
            </div>

            {(profile.company || profile.companyOneLiner) && (
              <div className="mt-7 border-t border-white/5 pt-6">
                <p className="eyebrow text-[10px]">Building</p>
                <p className="display mt-2 text-xl font-medium">{profile.company}</p>
                {profile.companyOneLiner && <p className="mt-1 text-subtle">{profile.companyOneLiner}</p>}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {profile.fundraising && <span className="pill pill-gold">Raising{profile.raiseAmount ? ` ${profile.raiseAmount}` : ""}</span>}
              {profile.stage && <span className="pill">{stageLabel(profile.stage)}</span>}
              {profile.sector && <span className="pill">{profile.sector}</span>}
              {profile.cohortName && <span className="pill">Cohort · {profile.cohortName}</span>}
              {profile.location && (
                <span className="pill"><MapPin className="h-3 w-3" />{profile.location}</span>
              )}
            </div>

            {profile.bio && <p className="mt-6 max-w-2xl text-sm leading-relaxed text-subtle">{profile.bio}</p>}

            <div className="no-print mt-6 flex flex-wrap gap-2">
              {profile.website && (
                <a href={externalHref(profile.website)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  <Globe className="h-3.5 w-3.5" /> Website <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
              {profile.linkedin && (
                <a href={externalHref(profile.linkedin)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
              {profile.twitter && (
                <a href={externalHref(profile.twitter)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  <Twitter className="h-3.5 w-3.5" /> X
                </a>
              )}
            </div>
          </div>

          <aside className="card flex flex-col items-center p-6 text-center sm:p-8">
            <p className="eyebrow">Execution score</p>
            <ScoreRing score={record.score} size={184} label="of 100" muted={record.provisional} className="mt-6" />
            <div className="mt-5"><TierPill tier={record.tier} provisional={record.provisional} /></div>
            <p className="mt-4 text-xs leading-relaxed text-faint">
              {record.provisional
                ? "Fewer than four resolved commitments so far. The score will firm up as the record grows."
                : `${record.tier} execution across ${s.resolved} resolved commitments over ${s.weeksTracked} weeks.`}
            </p>
            <div className="no-print mt-auto grid w-full grid-cols-2 gap-2 pt-6">
              <button type="button" onClick={copyLink} className="btn btn-secondary btn-sm" disabled={!isPublic}>
                <Link2 className="h-3.5 w-3.5" /> Share
              </button>
              <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-sm">
                <Printer className="h-3.5 w-3.5" /> PDF
              </button>
              <a
                href={isPublic ? `${PUBLIC_API}/profile/${slug}/report.csv` : undefined}
                className={cn("btn btn-secondary btn-sm", !isPublic && "pointer-events-none opacity-40")}
                download
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </a>
              {canWatch && !isOwner ? (
                <button type="button" onClick={toggleWatch} className={cn("btn btn-sm", watching ? "btn-secondary text-lime" : "btn-primary")}>
                  {watching ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  {watching ? "Watching" : "Watch"}
                </button>
              ) : (
                <Link to="/discover" className="btn btn-ghost btn-sm">Compare</Link>
              )}
            </div>
          </aside>
        </section>

        {/* Key stats */}
        <section className="card mt-6 grid grid-cols-2 gap-x-6 gap-y-8 p-6 sm:grid-cols-3 sm:p-8 lg:grid-cols-6">
          <Stat label="Delivery rate" value={pct(s.deliveryRate)} hint={`${s.done} delivered · ${s.partial} partial`} accent />
          <Stat label="Follow-through" value={pct(s.followThroughRate)} hint="Closed with a check-in" />
          <Stat label="Current streak" value={`${s.currentStreak}w`} hint={`Longest ${s.longestStreak}w`} />
          <Stat label="Active weeks" value={s.activeWeeks} hint={`of ${s.weeksTracked} tracked`} />
          <Stat label="Commitments" value={s.commitments} hint={`${s.publicCommitments} public · ${s.privateCommitments} private`} />
          <Stat label="Endorsements" value={s.endorsements} hint={`${s.supportsReceived} supports received`} />
        </section>

        {/* Contribution graph */}
        <section className="card mt-6 p-6 sm:p-8">
          <SectionHeading
            eyebrow="Activity"
            title="Execution graph"
            action={<span className="text-xs text-faint">Last active {fmtDate(s.lastActivityAt)}</span>}
            className="mb-6"
          />
          <ContributionGraph activity={record.activity} />
        </section>

        {/* Breakdown + momentum */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <SectionHeading eyebrow="Score composition" title="How the score is built" className="mb-6" />
            <ul className="space-y-5">
              {COMPONENTS.map((c) => {
                const v = Math.round(record.breakdown[c.key] * 100);
                return (
                  <li key={c.key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-ink">{c.label} <span className="num text-[11px] text-faint">×{c.weight}%</span></span>
                      <span className="num text-sm text-ink">{v}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="print-bar h-full rounded-full bg-gradient-to-r from-lime to-lime-dim" style={{ width: `${v}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-faint">{c.help}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid gap-6">
            <div className="card p-6 sm:p-8">
              <SectionHeading eyebrow="Momentum" title="Last 12 weeks" className="mb-6" />
              <WeeklyBars weekly={record.weekly} height={88} showAxis />
              <div className="mt-4 flex gap-5 text-xs text-faint">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-white/10" /> Committed</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-lime" /> Delivered</span>
              </div>
            </div>
            <div className="card grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 sm:p-8">
              <Stat label="Help given" value={s.helpGiven} hint={`${s.supportsGiven} peer signals sent`} />
              <Stat
                label="Meetings"
                value={s.attendanceRate === null ? "—" : pct(s.attendanceRate)}
                hint={s.meetingsHeld ? `${s.meetingsAttended}/${s.meetingsHeld} attended` : "None held yet"}
              />
              <Stat label="Blockers raised" value={s.blockersReported} hint="Transparency on misses" />
            </div>
          </div>
        </section>

        {/* Commitment log */}
        <section className="card mt-6 p-6 sm:p-8">
          <SectionHeading
            eyebrow="Commitment log"
            title="Every promise, and what happened"
            action={<span className="text-xs text-faint">{timeline.length} shown{!isOwner || previewAsInvestor ? " · public commitments" : ""}</span>}
            className="mb-6"
          />
          {timeline.length === 0 ? (
            <EmptyState title="No commitments yet" body="Weekly commitments appear here once they are made." />
          ) : (
            <ol className="relative space-y-0">
              {timeline.map((t, i) => (
                <TimelineRow key={t.id} entry={t} last={i === timeline.length - 1} />
              ))}
            </ol>
          )}
        </section>

        {/* Methodology */}
        <section className="mt-6 grid gap-6 rounded-[20px] border border-white/5 p-6 sm:p-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <Eyebrow>Methodology</Eyebrow>
            <h2 className="display mt-3 text-xl font-medium">Why this record is credible</h2>
          </div>
          <ul className="grid gap-4 text-sm text-subtle sm:grid-cols-2">
            <li><span className="text-ink">Commit first, report after.</span> Founders make at most one public and one private commitment per cohort week, before the work happens.</li>
            <li><span className="text-ink">Outcomes come only from check-ins.</span> Results can't be edited after the fact, and resolved commitments can't be reworded.</li>
            <li><span className="text-ink">Private goals count, privately.</span> They feed the aggregate score, but their content is never shown to anyone except the founder.</li>
            <li><span className="text-ink">Tiers require delivery.</span> Exceptional needs 85%+ delivery and Strong needs 65%+, whatever the score.</li>
            <li><span className="text-ink">Peers verify.</span> Endorsements come from founders in the same cohort, who watch the work week by week.</li>
          </ul>
        </section>

        {!user && (
          <section className="no-print mt-6 flex flex-col items-start justify-between gap-6 rounded-[20px] border border-lime/20 bg-lime/[0.04] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="display text-2xl font-medium">Build a record investors can trust.</h2>
              <p className="mt-1 text-subtle">Join a cohort, commit weekly, and let your execution speak.</p>
            </div>
            <Link to="/register" className="btn btn-primary btn-lg">Start your record</Link>
          </section>
        )}

        <p className="print-only mt-8 text-[10px]">
          Ziptech Labs execution records are computed from timestamped weekly commitments and check-ins. Score = 35% delivery + 25% follow-through + 20% consistency + 10% peer validation + 10% community.
        </p>
      </div>
    </AppShell>
  );
};

const TimelineRow = ({ entry: t, last }: { entry: TimelineEntry; last: boolean }) => (
  <li className="relative grid grid-cols-[88px_1fr] gap-4 sm:grid-cols-[120px_1fr]">
    <div className="pt-4">
      <p className="num text-xs text-subtle">{fmtDate(t.weekOf, { month: "short", day: "numeric" })}</p>
      <p className="num mt-0.5 text-[10px] text-faint">Week {t.weekNumber}</p>
    </div>
    <div className={cn("relative border-l border-white/[0.07] pb-4 pl-6 pt-4", last && "pb-0")}>
      <span
        className={cn(
          "absolute -left-[5px] top-[22px] h-[9px] w-[9px] rounded-full ring-4 ring-surface",
          t.status === "done" ? "bg-lime" : t.status === "partial" ? "bg-warn" : t.status === "not_done" ? "bg-danger" : "bg-white/30",
        )}
      />
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-ink">
            {t.type === "private" && <Lock className="mr-1.5 inline h-3 w-3 text-gold" aria-label="Private" />}
            {t.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-faint">
            {t.subTasks.total > 0 && <span className="num">{t.subTasks.completed}/{t.subTasks.total} subtasks</span>}
            {t.checkedIn ? <span>Checked in {fmtDate(t.checkInAt, { month: "short", day: "numeric" })}</span> : t.status === "pending" ? <span>Awaiting check-in</span> : null}
            {t.peer.endorse > 0 && <span className="text-gold">★ {t.peer.endorse} endorsement{t.peer.endorse > 1 ? "s" : ""}</span>}
            {t.peer.support > 0 && <span>{t.peer.support} support</span>}
            {t.peer.help > 0 && <span>{t.peer.help} help offer{t.peer.help > 1 ? "s" : ""}</span>}
            {t.hadBlocker && !t.blockerNote && <span>Blocker reported</span>}
          </div>
          {t.blockerNote && <p className="mt-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-subtle">Blocker: {t.blockerNote}</p>}
        </div>
        <StatusPill status={t.status} />
      </div>
    </div>
  </li>
);

export default FounderReport;
