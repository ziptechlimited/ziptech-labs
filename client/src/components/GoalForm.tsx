import React, { useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import toast from 'react-hot-toast';

interface GoalFormProps {
    onSuccess?: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSuccess }) => {
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'public' | 'private'>('public');
    const [subTaskText, setSubTaskText] = useState('');
    const [subTasks, setSubTasks] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addSubTask = () => {
        const t = subTaskText.trim();
        if (!t) return;
        setSubTasks([...subTasks, t]);
        setSubTaskText('');
    };
    const removeSubTask = (idx: number) => {
        setSubTasks(subTasks.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${API_CONFIG.BASE_URL}/goals`, {
                description,
                type,
                subTasks: subTasks.map(t => ({ description: t, completed: false }))
            });
            toast.success('Goal created successfully');
            setDescription('');
            setSubTasks([]);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create goal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Set a New Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-muted">
                        Goal Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        required
                        className="mt-1 block w-full border border-white/10 rounded-2xl shadow-sm py-3 px-4 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 sm:text-sm"
                        placeholder="What needs to be done this week?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Visibility</label>
                    <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="accent-accent"
                                name="type"
                                value="public"
                                checked={type === 'public'}
                                onChange={() => setType('public')}
                            />
                            <span className="ml-2 text-sm text-muted">Public (Cohort)</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="accent-accent"
                                name="type"
                                value="private"
                                checked={type === 'private'}
                                onChange={() => setType('private')}
                            />
                            <span className="ml-2 text-sm text-muted">Private</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Subtasks</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={subTaskText}
                            onChange={(e) => setSubTaskText(e.target.value)}
                            className="flex-1 border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                            placeholder="Add a subtask and press Add"
                        />
                        <button
                            type="button"
                            onClick={addSubTask}
                            className="px-5 py-3 bg-white/10 text-primary rounded-2xl font-semibold hover:bg-white/15 transition"
                        >
                            Add
                        </button>
                    </div>
                    {subTasks.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {subTasks.map((t, idx) => (
                                <li key={idx} className="flex items-center justify-between text-sm text-primary bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                                    <span className="text-primary">{t}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSubTask(idx)}
                                        className="text-danger hover:brightness-95 transition"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-black bg-accent hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-accent/30 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Saving...' : 'Set Goal'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GoalForm;
