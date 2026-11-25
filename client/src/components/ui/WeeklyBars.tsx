import type { WeeklyPoint } from "../../types/record";

interface Props {
  weekly: WeeklyPoint[];
  height?: number;
  showAxis?: boolean;
}

// Twelve-week sparkline: outline = commitments made, fill = delivered.
const WeeklyBars = ({ weekly, height = 36, showAxis = false }: Props) => {
  const max = Math.max(2, ...weekly.map((w) => w.commitments));
  const delivered = weekly.reduce((s, w) => s + w.delivered, 0);
  const made = weekly.reduce((s, w) => s + w.commitments, 0);
  return (
    <div>
      <div
        className="flex items-end gap-[3px]"
        style={{ height }}
        role="img"
        aria-label={`Last ${weekly.length} weeks: ${delivered} of ${made} commitments delivered`}
      >
        {weekly.map((w) => (
          <div
            key={w.weekOf}
            title={`Week of ${w.weekOf}: ${w.delivered}/${w.commitments} delivered`}
            className="relative flex-1 rounded-[3px] bg-white/[0.06]"
            style={{ height: `${Math.max(8, (w.commitments / max) * 100)}%` }}
          >
            {w.commitments > 0 && (
              <div
                className="print-bar absolute inset-x-0 bottom-0 rounded-[3px] bg-lime"
                style={{ height: `${(w.delivered / w.commitments) * 100}%` }}
              />
            )}
          </div>
        ))}
      </div>
      {showAxis && weekly.length > 0 && (
        <div className="num mt-2 flex justify-between text-[10px] text-faint">
          <span>{new Date(weekly[0].weekOf).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          <span>This week</span>
        </div>
      )}
    </div>
  );
};

export default WeeklyBars;
