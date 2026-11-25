import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn, initials } from "../../lib/api";
import type { GoalStatus } from "../../types/record";

export const Logo = ({ to = "/", compact = false }: { to?: string; compact?: boolean }) => (
  <Link to={to} className="group inline-flex items-center gap-2.5" aria-label="Ziptech Labs home">
    <span className="grid h-8 w-8 place-items-center rounded-[10px] border border-white/10 bg-black/60 transition-colors group-hover:border-lime/40">
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <path d="M9 10h14L9 22h14" fill="none" stroke="var(--color-lime)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    {!compact && (
      <span className="display-caps text-[12px] font-semibold text-ink">
        Ziptech<span className="text-lime"> Labs</span>
      </span>
    )}
  </Link>
);

export const Eyebrow = ({ children, className, spark = true }: { children: ReactNode; className?: string; spark?: boolean }) => (
  <p className={cn("eyebrow inline-flex items-center gap-2", className)}>
    {spark && <span className="text-lime">✦</span>}
    {children}
  </p>
);

export const Counter = ({ index, total }: { index: number; total: number }) => (
  <span className="num text-[11px] tracking-widest text-faint">
    [{String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}]
  </span>
);

export const Avatar = ({ name, src, size = 40, className }: { name?: string; src?: string; size?: number; className?: string }) =>
  src ? (
    <img src={src} alt="" width={size} height={size} className={cn("shrink-0 rounded-full object-cover ring-1 ring-white/10", className)} style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] font-display font-medium text-ink ring-1 ring-white/10", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );

const STATUS: Record<GoalStatus, { label: string; cls: string }> = {
  done: { label: "Delivered", cls: "pill-lime" },
  partial: { label: "Partial", cls: "pill-warn" },
  not_done: { label: "Missed", cls: "pill-danger" },
  pending: { label: "In progress", cls: "" },
};

export const StatusPill = ({ status }: { status: GoalStatus }) => (
  <span className={cn("pill", STATUS[status]?.cls)}>{STATUS[status]?.label ?? status}</span>
);

export const TierPill = ({ tier, provisional }: { tier: string; provisional?: boolean }) => (
  <span className={cn("pill", tier === "Exceptional" ? "pill-gold" : tier === "Strong" ? "pill-lime" : "")}>
    {provisional ? "Provisional" : tier}
  </span>
);

export const Spinner = ({ label = "Loading" }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-24" role="status">
    <div className="zl-loader" />
    <span className="eyebrow">{label}</span>
  </div>
);

export const EmptyState = ({ title, body, action }: { title: string; body?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
    <span className="text-lime">✦</span>
    <p className="mt-3 font-display text-lg text-ink">{title}</p>
    {body && <p className="mt-1 max-w-sm text-sm text-subtle">{body}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Stat = ({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean }) => (
  <div className="min-w-0">
    <p className="eyebrow text-[10px]">{label}</p>
    <p className={cn("num mt-2 text-2xl font-medium tracking-tight", accent ? "text-lime" : "text-ink")}>{value}</p>
    {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
  </div>
);

export const SectionHeading = ({ eyebrow, title, action, className }: { eyebrow?: string; title: ReactNode; action?: ReactNode; className?: string }) => (
  <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
    <div>
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <h2 className="display text-xl font-medium text-ink sm:text-2xl">{title}</h2>
    </div>
    {action}
  </div>
);
