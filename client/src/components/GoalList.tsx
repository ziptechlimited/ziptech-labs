import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IGoal } from '../types/shared';
import { API_CONFIG } from '../config/api';
import toast from 'react-hot-toast';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const GoalList: React.FC = () => {
    const [goals, setGoals] = useState<{ publicGoals: IGoal[], myPrivateGoal: IGoal | null }>({ publicGoals: [], myPrivateGoal: null });
    const [loading, setLoading] = useState(true);

    const fetchGoals = async () => {
        try {
            const res = await axios.get(`${API_CONFIG.BASE_URL}/goals`);
            // API returns { week: number, publicGoals: [], myPrivateGoal: {} } or [] if no cohort
            if (Array.isArray(res.data)) {
                 // Handle empty array case or specific format
                 setGoals({ publicGoals: [], myPrivateGoal: null });
            } else {
                 setGoals({
                    publicGoals: res.data.publicGoals || [],
                    myPrivateGoal: res.data.myPrivateGoal || null
                 });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch goals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    if (loading) {
        return <div className="text-center py-4">Loading goals...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                     <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Cohort Goals (This Week)
                     </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {goals.publicGoals.length === 0 ? (
                        <li className="px-4 py-4 text-gray-500 text-sm">No public goals set yet.</li>
                    ) : (
                        goals.publicGoals.map((goal) => (
                            <li key={goal._id as string} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {goal.status === 'done' ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : goal.status === 'partial' ? (
                                                <Clock className="h-5 w-5 text-yellow-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                {(goal.user as any)?.name || 'Unknown User'}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {goal.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${goal.status === 'done' ? 'bg-green-100 text-green-800' : 
                                              goal.status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-gray-100 text-gray-800'}`}>
                                            {goal.status === 'pending' ? 'PENDING' : goal.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {goals.myPrivateGoal && (
                 <div className="bg-white shadow rounded-lg overflow-hidden border-l-4 border-indigo-500">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            My Private Goal
                        </h3>
                        <div className="mt-2 flex items-start space-x-3">
                             <div className="flex-shrink-0 mt-1">
                                {goals.myPrivateGoal.status === 'done' ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-300" />
                                )}
                             </div>
                             <p className="text-sm text-gray-900">{goals.myPrivateGoal.description}</p>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default GoalList;
