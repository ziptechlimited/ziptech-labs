import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowUpRight } from "lucide-react";
import { API, errorMessage, pct } from "../lib/api";
import AppShell from "../components/ui/AppShell";
import ScoreRing from "../components/ui/ScoreRing";
import WeeklyBars from "../components/ui/WeeklyBars";
import { Avatar, EmptyState, Eyebrow, SectionHeading, Spinner, Stat } from "../components/ui/primitives";
import type { FounderListing } from "../types/record";

interface AdminAnalytics {
  totalCohorts: number;
  totalUsers: number;
  activeUsers: number;
  totalGoals: number;
  completedGoals: number;
  avgCompletionRate: number;
  cohorts: { id: string; name: string; memberCount: number }[];
  topFounders: FounderListing[];
}

const AdminDashboard = () => {
  const [data, setData] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    axios
      .get(`${API}/analytics/admin`)
      .then((res) => setData(res.data))
      .catch((e) => toast.error(errorMessage(e, "Couldn't load analytics")));
  }, []);

  if (!data) {
    return (
      <AppShell wide>
        <Spinner label="Loading platform data" />
      </AppShell>
    );
  }

  return (
    <AppShell wide>
      <header className="mb-10">
        <Eyebrow>Platform overview</Eyebrow>
        <h1 className="display mt-4 text-4xl font-medium sm:text-5xl">Ziptech Labs at a glance.</h1>
      </header>

      <section className="card mb-6 grid grid-cols-2 gap-8 p-6 sm:p-8 lg:grid-cols-5">
        <Stat label="Users" value={data.totalUsers} />
        <Stat label="Active · 7 days" value={data.activeUsers} accent />
        <Stat label="Cohorts" value={data.totalCohorts} />
        <Stat label="Commitments" value={data.totalGoals} hint={`${data.completedGoals} delivered`} />
        <Stat label="Delivery rate" value={pct(data.avgCompletionRate)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="card p-6 sm:p-8">
          <SectionHeading eyebrow="Leaderboard" title="Top founders by execution" action={<Link to="/discover" className="btn btn-ghost btn-sm">All founders <ArrowUpRight className="h-3.5 w-3.5" /></Link>} className="mb-6" />
          {data.topFounders.length === 0 ? (
            <EmptyState title="No founder activity yet" />
          ) : (
            <ol className="space-y-1">
              {data.topFounders.map((f, i) => (
                <li key={f.profile._id}>
                  <Link to={f.profile.slug ? `/f/${f.profile.slug}` : "#"} className="grid grid-cols-[24px_1fr_auto] items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-white/[0.03] sm:grid-cols-[24px_1fr_120px_auto]">
                    <span className="num text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar name={f.profile.name} src={f.profile.avatarUrl} size={34} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink">{f.profile.name}</span>
                        <span className="block truncate text-xs text-faint">{f.profile.company || f.profile.email}</span>
                      </span>
                    </span>
                    <span className="hidden sm:block"><WeeklyBars weekly={f.summary.weekly} height={24} /></span>
                    <ScoreRing score={f.summary.score} size={42} stroke={3} muted={f.summary.provisional} />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="card p-6 sm:p-8">
          <SectionHeading eyebrow="Cohorts" title="All cohorts" className="mb-6" />
          {data.cohorts.length === 0 ? (
            <EmptyState title="No cohorts yet" />
          ) : (
            <ul className="divide-y divide-white/5">
              {data.cohorts.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-ink">{c.name}</span>
                  <span className="num text-xs text-faint">{c.memberCount} founders</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default AdminDashboard;
