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
    <div className="mb-4 p-4 rounded-lg border border-yellow-300 bg-yellow-50 flex items-center justify-between">
      <div>
        <p className="text-sm text-yellow-900 font-medium">
          Please verify your email to unlock all features.
        </p>
        <p className="text-xs text-yellow-800">
          Check your inbox or resend the verification email.
        </p>
      </div>
      <button
        onClick={resend}
        disabled={loading}
        className="px-3 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Resend'}
      </button>
    </div>
  );
};

export default VerificationBanner;

