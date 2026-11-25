import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Bookmark, BookmarkCheck, Flame, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API, PUBLIC_API, cn, errorMessage, pct } from "../lib/api";
import AppShell from "../components/ui/AppShell";
import ScoreRing from "../components/ui/ScoreRing";
import WeeklyBars from "../components/ui/WeeklyBars";
import { Avatar, EmptyState, Eyebrow, Spinner, TierPill } from "../components/ui/primitives";
import { FounderListing, STAGES, stageLabel } from "../types/record";

const SORTS = [
  { value: "score", label: "Top score" },
  { value: "streak", label: "Current streak" },
  { value: "recent", label: "Recently active" },
];

const Discover = ({ watchlist = false }: { watchlist?: boolean }) => {
  const { user, refreshUser } = useAuth();
  const [founders, setFounders] = useState<FounderListing[] | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [sector, setSector] = useState("");
  const [fundraising, setFundraising] = useState(false);
  const [sort, setSort] = useState("score");
  const canWatch = user?.role === "investor" || user?.role === "admin";
  const watchSet = new Set((user?.watchlist ?? []).map(String));

  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setFounders(null);
    if (watchlist) {
      axios
        .get(`${API}/users/me/watchlist`)
        .then((res) => setFounders(res.data))
        .catch((e) => {
          toast.error(errorMessage(e, "Couldn't load watchlist"));
          setFounders([]);
        });
      return;
    }
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (stage) params.set("stage", stage);
    if (sector) params.set("sector", sector);
    if (fundraising) params.set("fundraising", "true");
    params.set("sort", sort);
    axios
      .get(`${PUBLIC_API}/founders?${params}`)
      .then((res) => {
        setFounders(res.data.founders);
        setSectors(res.data.sectors ?? []);
      })
      .catch(() => setFounders([]));
  }, [watchlist, query, stage, sector, fundraising, sort]);

  const toggleWatch = async (id: string) => {
    try {
      const res = await axios.post(`${API}/users/me/watchlist/${id}`);
      await refreshUser();
      if (watchlist && !res.data.watching) setFounders((list) => list?.filter((f) => f.profile._id !== id) ?? null);
      toast.success(res.data.watching ? "Added to watchlist" : "Removed from watchlist");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <AppShell wide>
      <header className="mb-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <Eyebrow>{watchlist ? "Your watchlist" : "Founder discovery"}</Eyebrow>
          <h1 className="display mt-4 text-4xl font-medium sm:text-6xl">
            {watchlist ? (
              <>Founders you're <span className="text-lime">tracking.</span></>
            ) : (
              <>Ranked by what they <span className="text-lime">ship.</span></>
            )}
          </h1>
          <p className="mt-4 max-w-xl text-subtle">
            {watchlist
              ? "Follow execution week over week. Scores update with every check-in."
              : "Every founder here commits weekly in front of peers and reports the outcome. Filter by stage, sector and raise status, and sort by verified execution."}
          </p>
        </div>
        {!user && (
          <div className="flex gap-2">
            <Link to="/register?role=investor" className="btn btn-primary">Join as investor</Link>
          </div>
        )}
      </header>

      {!watchlist && (
        <div className="glass sticky top-24 z-30 mb-8 grid gap-2 rounded-2xl p-2 sm:grid-cols-2 lg:grid-cols-[1fr_170px_170px_190px_auto]">
          <label className="relative">
            <span className="sr-only">Search founders</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search founder, company, or idea" className="input border-transparent bg-white/[0.04] pl-9" />
          </label>
          <select aria-label="Stage" value={stage} onChange={(e) => setStage(e.target.value)} className="input border-transparent bg-white/[0.04]">
            <option value="">All stages</option>
            {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select aria-label="Sector" value={sector} onChange={(e) => setSector(e.target.value)} className="input border-transparent bg-white/[0.04]">
            <option value="">All sectors</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} className="input border-transparent bg-white/[0.04]">
            {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
          </select>
          <button
            type="button"
            aria-pressed={fundraising}
            onClick={() => setFundraising((v) => !v)}
            className={cn("btn h-auto min-h-10", fundraising ? "border border-gold/40 bg-gold/10 text-gold" : "btn-ghost")}
          >
            Raising now
          </button>
        </div>
      )}

      {founders === null ? (
        <Spinner label="Ranking founders" />
      ) : founders.length === 0 ? (
        <EmptyState
          title={watchlist ? "Nobody on your watchlist yet" : "No founders match"}
          body={watchlist ? "Watch founders from Discover to follow their execution here." : "Try widening your filters."}
          action={watchlist ? <Link to="/discover" className="btn btn-primary">Discover founders</Link> : undefined}
        />
      ) : (
        <>
          <p className="eyebrow mb-4 text-[10px]">{founders.length} founder{founders.length === 1 ? "" : "s"}</p>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {founders.map((f, i) => (
              <li key={f.profile._id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}>
                <FounderCard
                  listing={f}
                  rank={!watchlist && sort === "score" ? i + 1 : undefined}
                  watching={watchSet.has(f.profile._id)}
                  onWatch={canWatch ? () => toggleWatch(f.profile._id) : undefined}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
};

const FounderCard = ({
  listing: { profile, summary },
  rank,
  watching,
  onWatch,
}: {
  listing: FounderListing;
  rank?: number;
  watching: boolean;
  onWatch?: () => void;
}) => (
  <article className="card card-hover group relative flex h-full flex-col p-5">
    <Link to={`/f/${profile.slug}`} className="absolute inset-0 z-0 rounded-[20px]" aria-label={`Open ${profile.name}'s execution record`} />
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={profile.name} src={profile.avatarUrl} size={44} />
        <div className="min-w-0">
          <p className="truncate font-display text-[17px] font-medium text-ink">{profile.name}</p>
          <p className="truncate text-sm text-subtle">{profile.company || profile.headline || "Founder"}</p>
        </div>
      </div>
      <div className="relative">
        <ScoreRing score={summary.score} size={56} stroke={4} muted={summary.provisional} />
        {rank && rank <= 3 && !summary.provisional && (
          <span className="num absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-lime text-[10px] font-medium text-bg">{rank}</span>
        )}
      </div>
    </div>

    {profile.companyOneLiner && <p className="mt-4 line-clamp-2 text-sm text-subtle">{profile.companyOneLiner}</p>}

    <div className="mt-4 flex flex-wrap gap-1.5">
      <TierPill tier={summary.tier} provisional={summary.provisional} />
      {profile.fundraising && <span className="pill pill-gold">Raising{profile.raiseAmount ? ` ${profile.raiseAmount}` : ""}</span>}
      {profile.stage && <span className="pill">{stageLabel(profile.stage)}</span>}
      {profile.sector && <span className="pill">{profile.sector}</span>}
    </div>

    <div className="mt-auto pt-6">
      <WeeklyBars weekly={summary.weekly} height={32} />
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-xs">
        <div>
          <p className="text-faint">Delivery</p>
          <p className="num mt-1 text-ink">{pct(summary.deliveryRate)}</p>
        </div>
        <div>
          <p className="text-faint">Streak</p>
          <p className="num mt-1 flex items-center gap-1 text-ink">
            {summary.currentStreak >= 4 && <Flame className="h-3 w-3 text-gold" />}
            {summary.currentStreak}w
          </p>
        </div>
        <div>
          <p className="text-faint">Endorsed</p>
          <p className="num mt-1 text-ink">{summary.endorsements}</p>
        </div>
      </div>
    </div>

    {onWatch && (
      <button
        type="button"
        onClick={onWatch}
        className={cn("btn btn-sm relative z-10 mt-4", watching ? "btn-secondary text-lime" : "btn-secondary")}
        aria-pressed={watching}
      >
        {watching ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        {watching ? "Watching" : "Add to watchlist"}
      </button>
    )}
  </article>
);

export default Discover;
