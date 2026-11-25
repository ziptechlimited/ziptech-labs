import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MailCheck } from "lucide-react";
import { API, errorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const VerificationBanner = () => {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-verification`);
      toast.success("Verification email sent");
    } catch (e) {
      toast.error(errorMessage(e, "Failed to send"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <div>
          <p className="text-sm font-medium text-ink">Verify your email to start building your record.</p>
          <p className="mt-0.5 text-xs text-subtle">Commitments, check-ins and cohort features unlock once you confirm your address.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => refreshUser()} className="btn btn-ghost btn-sm">I've verified</button>
        <button type="button" onClick={resend} disabled={loading} className="btn btn-secondary btn-sm">
          {loading ? "Sending…" : "Resend email"}
        </button>
      </div>
    </div>
  );
};

export default VerificationBanner;
