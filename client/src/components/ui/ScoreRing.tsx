import { cn } from "../../lib/api";

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  muted?: boolean;
  className?: string;
}

const ScoreRing = ({ score, size = 160, stroke = 8, label, muted, className }: Props) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const id = `ring-${size}`;
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-lime)" />
            <stop offset="100%" stopColor={muted ? "var(--color-lime-dim)" : "var(--color-gold)"} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.2,0.7,0.2,1)", opacity: muted ? 0.6 : 1 }}
          className="print-bar"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="display font-medium text-ink" style={{ fontSize: size * 0.3 }} role="img" aria-label={`Execution score ${clamped} out of 100`}>
          {clamped}
        </span>
        {label && <span className="eyebrow mt-1 text-[9px]">{label}</span>}
      </div>
    </div>
  );
};

export default ScoreRing;
