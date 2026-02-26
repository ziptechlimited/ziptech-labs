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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Weekly Check-in</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Goal:</p>
                    <p className="text-gray-900">{goalDescription}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    value="done"
                                    checked={status === 'done'}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="mr-3"
                                />
                                <div>
                                    <span className="font-medium text-green-700">✓ Done</span>
                                    <p className="text-xs text-gray-500">Completed all tasks</p>
                                </div>
                            </label>
                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    value="partial"
                                    checked={status === 'partial'}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="mr-3"
                                />
                                <div>
                                    <span className="font-medium text-yellow-700">⚡ Partial</span>
                                    <p className="text-xs text-gray-500">Made progress, not finished</p>
                                </div>
                            </label>
                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    value="not_done"
                                    checked={status === 'not_done'}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="mr-3"
                                />
                                <div>
                                    <span className="font-medium text-red-700">✗ Not Done</span>
                                    <p className="text-xs text-gray-500">Didn't make progress</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blocker (Optional)
                        </label>
                        <textarea
                            value={blocker}
                            onChange={(e) => setBlocker(e.target.value)}
                            maxLength={200}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="What's blocking you? (max 200 chars)"
                            rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">{blocker.length}/200</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
