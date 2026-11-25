import { FormEvent, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API, cn, errorMessage } from "../lib/api";
import Modal from "./ui/Modal";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  goalDescription: string;
  onSuccess: () => void;
}

const OPTIONS = [
  { value: "done" as const, label: "Delivered", body: "Shipped what I committed to.", dot: "bg-lime", active: "border-lime/50 bg-lime/[0.06]" },
  { value: "partial" as const, label: "Partial", body: "Real progress, not finished.", dot: "bg-warn", active: "border-warn/50 bg-warn/[0.06]" },
  { value: "not_done" as const, label: "Missed", body: "Didn't get there this week.", dot: "bg-danger", active: "border-danger/50 bg-danger/[0.06]" },
];

const CheckInModal = ({ isOpen, onClose, goalId, goalDescription, onSuccess }: CheckInModalProps) => {
  const [status, setStatus] = useState<"done" | "partial" | "not_done">("done");
  const [blocker, setBlocker] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/checkins`, { goal: goalId, status, blocker: blocker.trim() || undefined });
      toast.success("Check-in recorded");
      setStatus("done");
      setBlocker("");
      onSuccess();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to submit check-in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="How did it go?" eyebrow="Weekly check-in">
      <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="eyebrow text-[10px]">Commitment</p>
        <p className="mt-2 text-ink">{goalDescription}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset>
          <legend className="field-label">Outcome</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {OPTIONS.map((o) => (
              <label key={o.value} className={cn("cursor-pointer rounded-2xl border p-4 transition", status === o.value ? o.active : "border-white/[0.08] hover:border-white/15")}>
                <input type="radio" name="status" value={o.value} checked={status === o.value} onChange={() => setStatus(o.value)} className="sr-only" />
                <span className="flex items-center gap-2 text-sm text-ink"><span className={cn("h-2 w-2 rounded-full", o.dot)} />{o.label}</span>
                <span className="mt-1.5 block text-xs text-faint">{o.body}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="blocker" className="field-label">
            {status === "done" ? "Anything worth noting?" : "What got in the way?"} <span className="text-faint">(optional, only you see this)</span>
          </label>
          <textarea id="blocker" value={blocker} onChange={(e) => setBlocker(e.target.value)} maxLength={200} rows={3} className="input resize-none" placeholder="Waiting on bank API access…" />
          <p className="num mt-1.5 text-right text-xs text-faint">{blocker.length}/200</p>
        </div>
        <p className="text-xs text-faint">Check-ins are final. An honest record is worth more to investors than a perfect one.</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Recording…" : "Record outcome"}</button>
        </div>
      </form>
    </Modal>
  );
};

export default CheckInModal;
