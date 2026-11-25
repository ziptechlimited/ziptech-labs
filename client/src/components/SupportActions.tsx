import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { HandHelping, Star, ThumbsUp } from "lucide-react";
import { API, cn, errorMessage } from "../lib/api";

interface SupportActionsProps {
  goalId: string;
  given?: string[];
  counts?: { endorse: number; support: number; help: number };
  onSuccess: () => void;
}

const SupportActions = ({ goalId, given = [], counts, onSuccess }: SupportActionsProps) => {
  const [showHelpInput, setShowHelpInput] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (type: "support" | "help" | "endorse", message?: string) => {
    setLoading(true);
    try {
      await axios.post(`${API}/support/${goalId}`, { type, message });
      toast.success(type === "endorse" ? "Endorsed" : type === "help" ? "Help offer sent" : "Support sent");
      setShowHelpInput(false);
      setHelpMessage("");
      onSuccess();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to send"));
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { type: "support" as const, label: "Support", icon: ThumbsUp, count: counts?.support, on: "text-lime border-lime/30 bg-lime/[0.06]" },
    { type: "endorse" as const, label: "Endorse", icon: Star, count: counts?.endorse, on: "text-gold border-gold/30 bg-gold/[0.06]" },
  ];

  if (showHelpInput) {
    return (
      <div className="mt-4 space-y-2">
        <textarea
          value={helpMessage}
          onChange={(e) => setHelpMessage(e.target.value)}
          maxLength={120}
          className="input resize-none text-sm"
          placeholder="How can you help? An intro, a template, an hour of your time…"
          rows={2}
          autoFocus
        />
        <div className="flex items-center justify-between">
          <span className="num text-xs text-faint">{helpMessage.length}/120</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowHelpInput(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="button" onClick={() => send("help", helpMessage.trim())} disabled={!helpMessage.trim() || loading} className="btn btn-primary btn-sm">Send offer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((a) => {
        const done = given.includes(a.type);
        return (
          <button
            key={a.type}
            type="button"
            onClick={() => send(a.type)}
            disabled={loading || done}
            aria-pressed={done}
            className={cn("btn btn-sm border border-white/[0.08] text-subtle hover:border-white/20 hover:text-ink disabled:opacity-100", done && a.on)}
          >
            <a.icon className="h-3.5 w-3.5" />
            {a.label}
            {!!a.count && <span className="num text-[11px] opacity-70">{a.count}</span>}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setShowHelpInput(true)}
        disabled={loading || given.includes("help")}
        className={cn("btn btn-sm border border-white/[0.08] text-subtle hover:border-white/20 hover:text-ink disabled:opacity-100", given.includes("help") && "border-white/20 text-ink")}
      >
        <HandHelping className="h-3.5 w-3.5" />
        {given.includes("help") ? "Help offered" : "Offer help"}
        {!!counts?.help && <span className="num text-[11px] opacity-70">{counts.help}</span>}
      </button>
    </div>
  );
};

export default SupportActions;
