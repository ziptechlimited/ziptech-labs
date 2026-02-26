import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Calendar, MessageSquare, Plus } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import CreateCohortModal from '../components/CreateCohortModal';
import VerificationBanner from '../components/VerificationBanner';

interface Analytics {
    cohort: {
        name: string;
        memberCount: number;
    };
    metrics: {
        totalGoals: number;
        completedGoals: number;
        completionRate: number;
        submissionRate: number;
        engagementScore: number;
    };
    members: Array<{ _id: string; name: string; email: string }>;
}

const FacilitatorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [cohortId, setCohortId] = useState<string>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.cohort) {
            const id = typeof user.cohort === 'string' ? user.cohort : (user.cohort as any)._id;
            setCohortId(id);
            fetchAnalytics(id);
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAnalytics = async (id: string) => {
        try {
            const res = await axios.get(`${API_CONFIG.BASE_URL}/analytics/cohort/${id}`);
            setAnalytics(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user?.cohort) {
        return (
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="shrink-0 flex items-center">
                                    <h1 className="text-xl font-bold text-gray-900">Ziptech Labs</h1>
                                    <span className="ml-3 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                                        Facilitator
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-700 mr-4">Welcome, {user?.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <VerificationBanner visible={!user?.isVerified} />
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your First Cohort</h2>
                        <p className="text-gray-600 mb-6">Get started by creating a cohort for your founders.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className={`inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition ${!user?.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!user?.isVerified}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Cohort
                        </button>
                    </div>
                </main>

                <CreateCohortModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">Ziptech Labs</h1>
                                <span className="ml-3 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                                    Facilitator
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700 mr-4">Welcome, {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <VerificationBanner visible={!user?.isVerified} />
                <div className="px-4 py-6 sm:px-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {analytics?.cohort.name || 'Facilitator Dashboard'}
                    </h2>
                    
                    {analytics && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-blue-100 rounded-md p-3">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total Members</p>
                                            <p className="text-2xl font-semibold text-gray-900">{analytics.cohort.memberCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-green-100 rounded-md p-3">
                                            <TrendingUp className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                                            <p className="text-2xl font-semibold text-gray-900">{analytics.metrics.completionRate}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-purple-100 rounded-md p-3">
                                            <Calendar className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Submission Rate</p>
                                            <p className="text-2xl font-semibold text-gray-900">{analytics.metrics.submissionRate}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-yellow-100 rounded-md p-3">
                                            <MessageSquare className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Engagement Score</p>
                                            <p className="text-2xl font-semibold text-gray-900">{analytics.metrics.engagementScore}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Cohort Members</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {analytics.members.map((member) => (
                                                <tr key={member._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {member.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {member.email}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FacilitatorDashboard;
