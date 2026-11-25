import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PUBLIC_API } from "../lib/api";
import { Footer, TopNav } from "../components/ui/AppShell";
import ScoreRing from "../components/ui/ScoreRing";
import ContributionGraph from "../components/ui/ContributionGraph";
import WeeklyBars from "../components/ui/WeeklyBars";
import { Avatar, Counter, Eyebrow } from "../components/ui/primitives";

// Deterministic sample data for the product preview.
const sampleActivity = () => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const out: { date: string; count: number }[] = [];
  const today = Date.now();
  for (let i = 0; i < 300; i++) {
    const r = rand();
    if (r < 0.55) continue;
    out.push({ date: new Date(today - i * 86400000).toISOString().slice(0, 10), count: r < 0.75 ? 1 : r < 0.88 ? 2 : r < 0.96 ? 4 : 6 });
  }
  return out;
};

const SAMPLE_WEEKS = [2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2].map((c, i) => ({
  weekOf: `${i}`,
  commitments: c,
  delivered: [2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 1, 2][i],
}));

const STEPS = [
  {
    title: "Commit in public",
    body: "Every week, one public and one private commitment, made before the work starts. Your cohort sees the public one and can back it.",
  },
  {
    title: "Check in honestly",
    body: "Report delivered, partial or missed. Outcomes are recorded only through check-ins and can't be edited afterward.",
  },
  {
    title: "Compound a record",
    body: "Each week adds to a timestamped history, scored for delivery, follow-through, consistency and peer validation.",
  },
];

const MARQUEE = ["Commit", "Ship", "Check in", "Get endorsed", "Compound", "Get funded"];

const LandingPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ founders: number; commitments: number; delivered: number } | null>(null);
  const activity = useMemo(sampleActivity, []);

  useEffect(() => {
    axios.get(`${PUBLIC_API}/stats`).then((r) => setStats(r.data)).catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg">
      <TopNav />

      {/* Hero */}
      <section className="grid-bg relative flex min-h-[100svh] flex-col items-center justify-center px-4 pb-20 pt-36 text-center">
        <div className="glow-lime pointer-events-none absolute left-1/2 top-1/3 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />

        <p className="eyebrow relative animate-rise text-lime">Execution-first incubation</p>
        <h1 className="display-caps relative mt-8 max-w-5xl animate-rise text-[2.4rem] font-semibold leading-[1.05] tracking-[0.06em] sm:text-6xl md:text-7xl lg:text-[5.5rem]" style={{ animationDelay: "80ms" }}>
          The execution record <span className="text-lime">for founders.</span>
        </h1>
        <div className="relative mt-8 h-px w-24 bg-lime/50" />
        <p className="relative mt-8 max-w-2xl animate-rise text-base text-subtle sm:text-lg" style={{ animationDelay: "160ms" }}>
          Founders commit weekly in front of peers and report what actually shipped. Investors get a verifiable,
          exportable record of who executes, not just who pitches well.
        </p>
        <div className="relative mt-10 flex animate-rise flex-col gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
          <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
            {user ? "Go to dashboard" : "Start your record"} <span aria-hidden="true">✦</span>
          </Link>
          <Link to="/discover" className="btn btn-secondary btn-lg">
            Discover founders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {stats && stats.commitments > 0 && (
          <dl className="relative mt-20 grid w-full max-w-2xl grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-6">
            {[
              ["Founders", stats.founders],
              ["Commitments", stats.commitments],
              ["Delivered", stats.delivered],
            ].map(([label, value]) => (
              <div key={label} className="px-2">
                <dt className="eyebrow text-[10px]">{label}</dt>
                <dd className="num mt-2 text-2xl text-ink sm:text-3xl">{Number(value).toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Marquee */}
      <div className="relative overflow-hidden border-y border-white/5 py-5" aria-hidden="true">
        <div className="marquee flex w-max gap-10">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i} className="display-caps flex items-center gap-10 whitespace-nowrap text-sm text-faint">
              {w} <span className="text-lime">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-28 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="display mt-5 text-4xl font-medium sm:text-5xl">
              Built on weekly promises.
            </h2>
            <p className="mt-5 max-w-sm text-subtle">Accountability you can see, and a history you can't fake.</p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card card-hover flex flex-col p-6">
                <Counter index={i + 1} total={STEPS.length} />
                <h3 className="display mt-10 text-xl font-medium">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-subtle">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Product preview */}
      <section className="relative border-y border-white/5 bg-surface/50 py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>The record</Eyebrow>
            <h2 className="display mt-5 text-4xl font-medium sm:text-5xl">
              Viewable. Exportable. <span className="text-lime">Investor-ready.</span>
            </h2>
            <p className="mt-5 text-subtle">
              Every founder gets a public execution record: score, streaks, a contribution graph and the full commitment log,
              with a one-click link, PDF or CSV export.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="glow-lime pointer-events-none absolute -inset-20 opacity-60" />
            <div className="glass relative rounded-[28px] p-3 shadow-2xl">
              <div className="rounded-[20px] border border-white/5 bg-bg p-6 sm:p-8">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar name="Amara Okafor" size={56} />
                    <div className="text-left">
                      <p className="display text-2xl font-medium">Amara Okafor</p>
                      <p className="text-sm text-subtle">Ledgerline · Automated bookkeeping for SMEs</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="pill pill-gold">Raising $1.5M</span>
                        <span className="pill">Seed</span>
                        <span className="pill">Fintech</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <dl className="hidden gap-6 text-left sm:flex">
                      {[
                        ["Delivery", "91%"],
                        ["Streak", "14w"],
                        ["Endorsed", "23"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="eyebrow text-[9px]">{k}</dt>
                          <dd className="num mt-1 text-xl">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <ScoreRing score={87} size={96} stroke={5} />
                  </div>
                </div>
                <div className="mt-8 border-t border-white/5 pt-6 text-left">
                  <ContributionGraph activity={activity} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-28 md:grid-cols-2 md:px-8">
        {[
          {
            eyebrow: "For founders",
            title: "Let your execution do the talking.",
            points: [
              "A cohort that holds you to your word every week",
              "Peer endorsements from founders who see the work",
              "A shareable record that turns consistency into credibility",
            ],
            cta: { to: "/register", label: "Start your record" },
          },
          {
            eyebrow: "For investors",
            title: "Diligence the founder, not the deck.",
            points: [
              "Rank founders by verified delivery, not polish",
              "Filter by stage, sector and who's raising now",
              "Watchlists, plus PDF and CSV exports for your IC memo",
            ],
            cta: { to: "/register?role=investor", label: "Join as investor" },
          },
        ].map((a, i) => (
          <article key={a.eyebrow} className="card relative overflow-hidden p-8 sm:p-10">
            {i === 1 && <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />}
            <Eyebrow>{a.eyebrow}</Eyebrow>
            <h3 className="display mt-6 max-w-sm text-3xl font-medium">{a.title}</h3>
            <ul className="mt-8 space-y-3">
              {a.points.map((p) => (
                <li key={p} className="flex gap-3 text-subtle">
                  <Check className={i === 0 ? "mt-0.5 h-4 w-4 shrink-0 text-lime" : "mt-0.5 h-4 w-4 shrink-0 text-gold"} />
                  {p}
                </li>
              ))}
            </ul>
            <Link to={user ? "/dashboard" : a.cta.to} className="btn btn-secondary mt-10">
              {user ? "Open dashboard" : a.cta.label} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>

      {/* Methodology */}
      <section className="mx-auto max-w-7xl px-4 pb-28 md:px-8">
        <div className="card grid gap-10 p-8 sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <Eyebrow>The score</Eyebrow>
            <h2 className="display mt-5 text-3xl font-medium sm:text-4xl">Transparent by design.</h2>
            <p className="mt-4 max-w-md text-subtle">
              One number from 0 to 100, built from behaviour, not self-reporting. The methodology is printed on every record.
            </p>
            <div className="mt-8 max-w-xs">
              <WeeklyBars weekly={SAMPLE_WEEKS} height={48} />
            </div>
          </div>
          <ul className="space-y-4">
            {[
              ["Delivery", 35, "Commitments delivered vs. resolved"],
              ["Follow-through", 25, "Every due commitment closed with a check-in"],
              ["Consistency", 20, "Weeks with a commitment, without gaps"],
              ["Peer validation", 10, "Endorsements from cohort founders"],
              ["Community", 10, "Help given and meetings attended"],
            ].map(([label, w, help]) => (
              <li key={label as string}>
                <div className="flex items-baseline justify-between">
                  <span className="text-ink">{label}</span>
                  <span className="num text-sm text-lime">{w}%</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-gradient-to-r from-lime to-gold" style={{ width: `${(Number(w) / 35) * 100}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-faint">{help}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="grid-bg relative overflow-hidden border-t border-white/5 px-4 py-32 text-center">
        <div className="glow-lime pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2" />
        <p className="eyebrow relative text-lime">✦ Exclusive cohorts</p>
        <h2 className="display-caps relative mx-auto mt-6 max-w-4xl text-3xl font-semibold leading-tight tracking-[0.08em] sm:text-5xl">
          Stop pitching potential. <span className="text-lime">Show your record.</span>
        </h2>
        <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg relative mt-12">
          {user ? "Go to dashboard" : "Get started"} <span aria-hidden="true">✦</span>
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
