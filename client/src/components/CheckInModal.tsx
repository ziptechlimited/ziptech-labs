import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalId: string;
    goalDescription: string;
    onSuccess: () => void;
}

const CheckInModal = ({ isOpen, onClose, goalId, goalDescription, onSuccess }: CheckInModalProps) => {
    const [status, setStatus] = useState<'done' | 'partial' | 'not_done'>('done');
    const [blocker, setBlocker] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_CONFIG.BASE_URL}/checkins`, {
                goal: goalId,
                status,
                blocker: blocker || undefined
            });
            onSuccess();
            onClose();
            setStatus('done');
            setBlocker('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit check-in');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-3xl border border-white/10 p-6 w-full max-w-md shadow-2xl shadow-black/40">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-primary">Weekly Check-in</h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-primary transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4 p-4 bg-black/20 border border-white/10 rounded-2xl">
                    <p className="text-sm text-muted font-medium">Goal</p>
                    <p className="text-primary mt-1">{goalDescription}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-muted mb-2">
                            Status
                        </label>
                        <div className="space-y-2">
                            <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition ${status === 'done' ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                <input
                                    type="radio"
                                    value="done"
                                    checked={status === 'done'}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="mr-3 accent-accent"
                                />
                                <div>
                                    <span className="font-semibold text-success">✓ Done</span>
                                    <p className="text-xs text-muted">Completed all tasks</p>
                                </div>
                            </label>
                            <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition ${status === 'partial' ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                <input
                                    type="radio"
                                    value="partial"
                                    checked={status === 'partial'}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="mr-3 accent-accent"
                                />
                                <div>
                                    <span className="font-semibold text-warning">⚡ Partial</span>
                                    <p className="text-xs text-muted">Made progress, not finished</p>
                                </div>
                            </label>
                            <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition ${status === 'not_done' ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                <input
                                    type="radio"
                                    value="not_done"
                                    checked={status === 'not_done'}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="mr-3 accent-accent"
                                />
                                <div>
                                    <span className="font-semibold text-danger">✗ Not Done</span>
                                    <p className="text-xs text-muted">Didn't make progress</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-muted mb-2">
                            Blocker (Optional)
                        </label>
                        <textarea
                            value={blocker}
                            onChange={(e) => setBlocker(e.target.value)}
                            maxLength={200}
                            className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                            placeholder="What's blocking you? (max 200 chars)"
                            rows={3}
                        />
                        <p className="text-xs text-muted mt-1">{blocker.length}/200</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-2xl">
                            <p className="text-sm text-danger">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-primary bg-white/5 hover:bg-white/10 rounded-full font-semibold border border-white/10 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-accent text-black rounded-full font-semibold hover:brightness-95 transition disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Check-in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckInModal;
