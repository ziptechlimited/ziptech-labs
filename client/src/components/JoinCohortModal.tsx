import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API, errorMessage } from "../lib/api";
import Modal from "./ui/Modal";

interface JoinCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCode?: string;
}

const JoinCohortModal = ({ isOpen, onClose, onSuccess, initialCode = "" }: JoinCohortModalProps) => {
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialCode) setInviteCode(initialCode);
  }, [isOpen, initialCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/cohorts/join`, { inviteCode: inviteCode.trim().toUpperCase() });
      toast.success("Welcome to the cohort");
      setInviteCode("");
      onSuccess();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to join cohort"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Join your cohort" eyebrow="Invite code" width="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="invite" className="field-label">Your facilitator shared a six-character code</label>
          <input
            id="invite"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="input num text-center text-2xl uppercase tracking-[0.5em]"
            placeholder="XXXXXX"
            maxLength={12}
            autoComplete="off"
            required
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" disabled={loading || !inviteCode.trim()} className="btn btn-primary">{loading ? "Joining…" : "Join cohort"}</button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinCohortModal;
