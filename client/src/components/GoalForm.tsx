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
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Set a New Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Goal Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="What needs to be done this week?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                    <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-indigo-600"
                                name="type"
                                value="public"
                                checked={type === 'public'}
                                onChange={() => setType('public')}
                            />
                            <span className="ml-2 text-sm text-gray-700">Public (Cohort)</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-indigo-600"
                                name="type"
                                value="private"
                                checked={type === 'private'}
                                onChange={() => setType('private')}
                            />
                            <span className="ml-2 text-sm text-gray-700">Private</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtasks</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={subTaskText}
                            onChange={(e) => setSubTaskText(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Add a subtask and press Add"
                        />
                        <button
                            type="button"
                            onClick={addSubTask}
                            className="px-3 py-2 bg-gray-800 text-white rounded-md"
                        >
                            Add
                        </button>
                    </div>
                    {subTasks.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {subTasks.map((t, idx) => (
                                <li key={idx} className="flex items-center justify-between text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                                    <span>{t}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSubTask(idx)}
                                        className="text-red-600 hover:text-red-800"
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
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Saving...' : 'Set Goal'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GoalForm;
