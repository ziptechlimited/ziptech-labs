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
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${API_CONFIG.BASE_URL}/goals`, {
                description,
                type,
                subTasks: [] // Optional for now
            });
            toast.success('Goal created successfully');
            setDescription('');
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
