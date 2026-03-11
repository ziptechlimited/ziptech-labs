import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

interface CreateCohortModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateCohortModal = ({ isOpen, onClose, onSuccess }: CreateCohortModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_URL}/cohorts`, formData);
            onSuccess();
            onClose();
            setFormData({ name: '', description: '', startDate: '', endDate: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create cohort');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-3xl border border-white/10 p-6 w-full max-w-md shadow-2xl shadow-black/40">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-primary">Create New Cohort</h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-primary transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-muted mb-2">
                            Cohort Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                            placeholder="e.g., Winter 2026 Batch"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-muted mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                            placeholder="Brief description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-black/20 text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-black/20 text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                            />
                        </div>
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
                            {loading ? 'Creating...' : 'Create Cohort'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCohortModal;
