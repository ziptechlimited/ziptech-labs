import { useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import toast from 'react-hot-toast';

interface Props {
  visible: boolean;
}

const VerificationBanner = ({ visible }: Props) => {
  const [loading, setLoading] = useState(false);
  if (!visible) return null;
  const resend = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/auth/send-verification`);
      toast.success('Verification email sent');
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to send';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mb-4 p-4 rounded-2xl border border-warning/30 bg-warning/10 flex items-center justify-between">
      <div>
        <p className="text-sm text-primary font-semibold">
          Please verify your email to unlock all features.
        </p>
        <p className="text-xs text-muted">
          Check your inbox or resend the verification email.
        </p>
      </div>
      <button
        onClick={resend}
        disabled={loading}
        className="px-4 py-2 text-sm bg-warning text-black rounded-full font-semibold hover:brightness-95 disabled:opacity-50 transition"
      >
        {loading ? 'Sending…' : 'Resend'}
      </button>
    </div>
  );
};

export default VerificationBanner;

