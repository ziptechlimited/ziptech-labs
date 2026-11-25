import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Globe2, Lock, Plus, X } from "lucide-react";
import { API, cn, errorMessage } from "../lib/api";
import Modal from "./ui/Modal";

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: "public" | "private";
  takenTypes?: ("public" | "private")[];
  week?: number | null;
}

const MAX = 100;

const GoalForm = ({ open, onClose, onSuccess, defaultType = "public", takenTypes = [], week }: GoalFormProps) => {
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "private">(defaultType);
  const [subTaskText, setSubTaskText] = useState("");
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setType(defaultType);
  }, [open, defaultType]);

  const addSubTask = () => {
    const t = subTaskText.trim();
    if (!t || subTasks.length >= 10) return;
    setSubTasks([...subTasks, t]);
    setSubTaskText("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/goals`, {
        description,
        type,
        subTasks: subTasks.map((t) => ({ description: t, completed: false })),
      });
      toast.success(type === "public" ? "Commitment published to your cohort" : "Private commitment set");
      setDescription("");
      setSubTasks([]);
      onSuccess();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to create commitment"));
    } finally {
      setLoading(false);
    }
  };

  const options = [
    { value: "public" as const, icon: Globe2, title: "Public", body: "Visible to your cohort and on your record. Peers can endorse it." },
    { value: "private" as const, icon: Lock, title: "Private", body: "Only you see the content. The outcome still counts toward your score." },
  ];

  return (
    <Modal open={open} onClose={onClose} title="What will you ship this week?" eyebrow={week ? `Week ${week} commitment` : "Weekly commitment"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="goal-desc" className="field-label">Commitment</label>
          <textarea
            id="goal-desc"
            rows={3}
            required
            maxLength={MAX}
            className="input resize-none text-base"
            placeholder="e.g. Close 3 paid pilots with pharmacy chains"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="mt-1.5 flex justify-between text-xs text-faint">
            <span>Specific and verifiable beats ambitious and vague.</span>
            <span className="num">{description.length}/{MAX}</span>
          </div>
        </div>

        <fieldset>
          <legend className="field-label">Visibility</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o) => {
              const taken = takenTypes.includes(o.value);
              return (
                <label
                  key={o.value}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-2xl border p-4 transition",
                    type === o.value ? "border-lime/50 bg-lime/[0.06]" : "border-white/[0.08] hover:border-white/15",
                    taken && "cursor-not-allowed opacity-40",
                  )}
                >
                  <input type="radio" name="type" value={o.value} checked={type === o.value} disabled={taken} onChange={() => setType(o.value)} className="sr-only" />
                  <o.icon className={cn("mt-0.5 h-4 w-4 shrink-0", type === o.value ? "text-lime" : "text-subtle")} />
                  <span>
                    <span className="block text-sm text-ink">{o.title}{taken && " · set"}</span>
                    <span className="mt-1 block text-xs text-faint">{o.body}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="subtask" className="field-label">Milestones <span className="text-faint">(optional)</span></label>
          <div className="flex gap-2">
            <input
              id="subtask"
              type="text"
              value={subTaskText}
              onChange={(e) => setSubTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubTask();
                }
              }}
              className="input"
              placeholder="Break it down, press Enter"
            />
            <button type="button" onClick={addSubTask} className="btn btn-secondary shrink-0 px-3" aria-label="Add milestone">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {subTasks.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {subTasks.map((t, idx) => (
                <li key={idx} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                  <span className="flex items-center gap-2.5"><span className="num text-[10px] text-faint">{String(idx + 1).padStart(2, "0")}</span>{t}</span>
                  <button type="button" onClick={() => setSubTasks(subTasks.filter((_, i) => i !== idx))} className="text-faint hover:text-danger" aria-label={`Remove ${t}`}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" disabled={loading || !description.trim()} className="btn btn-primary">
            {loading ? "Committing…" : "Commit"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalForm;
