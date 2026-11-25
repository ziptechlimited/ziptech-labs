import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Clock, Video } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API, cn, errorMessage } from "../lib/api";
import { EmptyState } from "./ui/primitives";

export interface Meeting {
  _id: string;
  title: string;
  agenda?: string;
  scheduledAt: string;
  duration: number;
  meetLink?: string;
  attendance?: string[];
  rsvps: Array<{ user: { _id: string; name: string }; status: "yes" | "maybe" | "no" }>;
}

const RSVP = [
  { value: "yes" as const, label: "Going" },
  { value: "maybe" as const, label: "Maybe" },
  { value: "no" as const, label: "Can't" },
];

export const MeetingDate = ({ iso }: { iso: string }) => {
  const d = new Date(iso);
  return (
    <div className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.02] py-2">
      <span className="eyebrow text-[9px]">{d.toLocaleDateString(undefined, { month: "short" })}</span>
      <span className="display text-xl font-medium">{d.getDate()}</span>
    </div>
  );
};

const MeetingsList = ({ cohortId }: { cohortId: string }) => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/meetings?cohort=${cohortId}`);
      setMeetings(res.data);
    } catch (error) {
      console.error(error);
      setMeetings([]);
    }
  }, [cohortId]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleRSVP = async (meetingId: string, status: "yes" | "maybe" | "no") => {
    try {
      await axios.post(`${API}/meetings/${meetingId}/rsvp`, { status });
      fetchMeetings();
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't save RSVP"));
    }
  };

  if (meetings === null) return <p className="py-8 text-center text-sm text-faint">Loading meetings…</p>;

  const now = Date.now();
  const upcoming = meetings.filter((m) => new Date(m.scheduledAt).getTime() + m.duration * 60000 >= now);
  if (upcoming.length === 0) return <EmptyState title="No upcoming meetings" body="Your facilitator will schedule cohort sessions here." />;

  return (
    <ul className="space-y-3">
      {upcoming.map((m) => {
        const mine = m.rsvps.find((r) => r.user?._id === user?._id)?.status;
        const going = m.rsvps.filter((r) => r.status === "yes");
        return (
          <li key={m._id} className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
            <MeetingDate iso={m.scheduledAt} />
            <div className="min-w-0 flex-1">
              <p className="text-ink">{m.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(m.scheduledAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} · {m.duration} min</span>
                <span>{going.length} going</span>
              </p>
              {m.agenda && <p className="mt-2 text-sm text-subtle">{m.agenda}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-white/[0.08] p-0.5" role="group" aria-label="RSVP">
                  {RSVP.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => handleRSVP(m._id, r.value)}
                      aria-pressed={mine === r.value}
                      className={cn("rounded-[10px] px-3 py-1 text-xs transition", mine === r.value ? "bg-lime text-bg" : "text-subtle hover:text-ink")}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {m.meetLink && (
                  <a href={m.meetLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <Video className="h-3.5 w-3.5" /> Join call
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MeetingsList;
