import { useEffect, useMemo, useRef } from "react";

interface Props {
  activity: { date: string; count: number }[];
  weeks?: number;
}

const DAY = 24 * 60 * 60 * 1000;
const LEVELS = ["rgb(255 255 255 / 0.05)", "rgb(163 230 53 / 0.25)", "rgb(163 230 53 / 0.45)", "rgb(163 230 53 / 0.7)", "rgb(163 230 53 / 1)"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL = 11;
const GAP = 3;

const levelFor = (n: number) => (n <= 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);
const utcMidnight = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

// GitHub-style heatmap of daily execution activity (commitments, check-ins, peer support given).
const ContributionGraph = ({ activity, weeks = 53 }: Props) => {
  const scroller = useRef<HTMLDivElement>(null);

  const { columns, monthLabels, total } = useMemo(() => {
    const counts = new Map(activity.map((a) => [a.date, a.count]));
    const today = utcMidnight(new Date());
    const dow = (today.getUTCDay() + 6) % 7; // Monday = 0
    const start = new Date(today.getTime() - (dow + (weeks - 1) * 7) * DAY);
    const cols: { date: string; count: number; future: boolean }[][] = [];
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    let sum = 0;
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start.getTime() + (w * 7 + d) * DAY);
        const key = date.toISOString().slice(0, 10);
        const count = counts.get(key) ?? 0;
        sum += count;
        col.push({ date: key, count, future: date > today });
        if (d === 0 && date.getUTCMonth() !== lastMonth) {
          lastMonth = date.getUTCMonth();
          const prev = labels[labels.length - 1];
          // Skip labels that would collide with the previous one or overflow the end.
          if (w < weeks - 2 && (!prev || w - prev.col >= 3)) labels.push({ col: w, label: MONTHS[lastMonth] });
        }
      }
      cols.push(col);
    }
    return { columns: cols, monthLabels: labels, total: sum };
  }, [activity, weeks]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, [columns]);

  const width = weeks * (CELL + GAP);

  return (
    <div>
      <div ref={scroller} className="scroll-thin overflow-x-auto pb-2">
        <div style={{ width: width + 28 }} className="relative">
          <div className="relative ml-7 h-4" aria-hidden="true">
            {monthLabels.map((m) => (
              <span key={`${m.col}-${m.label}`} className="num absolute text-[10px] text-faint" style={{ left: m.col * (CELL + GAP) }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex">
            <div className="num mr-1.5 flex w-[22px] flex-col text-[9px] text-faint" style={{ gap: GAP }} aria-hidden="true">
              {["Mon", "", "Wed", "", "Fri", "", ""].map((d, i) => (
                <span key={i} style={{ height: CELL, lineHeight: `${CELL}px` }}>{d}</span>
              ))}
            </div>
            <div className="flex" style={{ gap: GAP }} role="img" aria-label={`${total} execution events in the last year`}>
              {columns.map((col, i) => (
                <div key={i} className="flex flex-col" style={{ gap: GAP }}>
                  {col.map((cell) => (
                    <span
                      key={cell.date}
                      data-heat
                      title={cell.future ? "" : `${cell.count} event${cell.count === 1 ? "" : "s"} · ${new Date(cell.date + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`}
                      className="rounded-[3px]"
                      style={{
                        width: CELL,
                        height: CELL,
                        background: cell.future ? "transparent" : LEVELS[levelFor(cell.count)],
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-faint">
        <span className="num">{total} events · last 12 months</span>
        <span className="flex items-center gap-1.5">
          Less
          {LEVELS.map((c) => (
            <span key={c} data-heat className="rounded-[3px]" style={{ width: CELL, height: CELL, background: c }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
};

export default ContributionGraph;
