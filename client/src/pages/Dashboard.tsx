import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoalList from '../components/GoalList';
import GoalForm from '../components/GoalForm';
import JoinCohortModal from '../components/JoinCohortModal';
import FacilitatorDashboard from '../components/FacilitatorDashboard';
import { UserRole } from '../types/shared';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    if (user?.role === UserRole.FACILITATOR || user?.role === UserRole.ADMIN) {
        return (
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-bold text-indigo-600">Ziptech Labs (Facilitator)</h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700">Welcome, {user?.name}</span>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <FacilitatorDashboard />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600">Ziptech Labs</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.name}</span>
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Content will go here - Goal setting, Cohort view, etc. */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <GoalList />
                        </div>

                        {/* Sidebar / Form Area */}
                        <div className="space-y-6">
                            <GoalForm onSuccess={() => window.location.reload()} /> 
                            {/* Simple reload for now, ideally use context or prop to refresh list */}
                            
                            {/* Cohort Info Widget */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">My Cohort</h3>
                                {user?.cohort ? (
                                     <div className="mt-4">
                                        <p className="text-sm text-gray-500">You are a member of a cohort.</p>
                                        <p className="text-xs text-gray-400 mt-1">ID: {typeof user.cohort === 'string' ? user.cohort : (user.cohort as any)._id}</p>
                                     </div>
                                ) : (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">You are not in a cohort yet.</p>
                                        <button 
                                            onClick={() => setIsJoinModalOpen(true)}
                                            className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                        >
                                            Join a Cohort
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <JoinCohortModal 
                    isOpen={isJoinModalOpen} 
                    onClose={() => setIsJoinModalOpen(false)} 
                    onSuccess={() => window.location.reload()} 
                />
            </main>
        </div>
    );
};

export default Dashboard;
