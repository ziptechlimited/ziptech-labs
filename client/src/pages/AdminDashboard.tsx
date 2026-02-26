import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Download } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import VerificationBanner from '../components/VerificationBanner';

interface AdminAnalytics {
    totalCohorts: number;
    totalUsers: number;
    activeUsers: number;
    totalGoals: number;
    completedGoals: number;
    avgCompletionRate: number;
    cohorts: Array<{
        id: string;
        name: string;
        memberCount: number;
    }>;
}

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${API_CONFIG.BASE_URL}/analytics/admin`);
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

    const handleExport = () => {
        if (analytics) {
            const dataStr = JSON.stringify(analytics, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ziptech-analytics-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
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
                                <span className="ml-3 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                                    Admin
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
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                        <button 
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export Reports
                        </button>
                    </div>
                    
                    {analytics && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-blue-100 rounded-md p-3">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total Cohorts</p>
                                            <p className="text-2xl font-semibold text-gray-900">{analytics.totalCohorts}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-green-100 rounded-md p-3">
                                            <TrendingUp className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Avg Completion</p>
                                            <p className="text-2xl font-semibold text-gray-900">{analytics.avgCompletionRate}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-purple-100 rounded-md p-3">
                                            <BarChart3 className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Active Users</p>
                                            <p className="text-2xl font-semibold text-gray-900">{analytics.activeUsers}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Overview</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Users</span>
                                            <span className="text-sm font-semibold text-gray-900">{analytics.totalUsers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Goals</span>
                                            <span className="text-sm font-semibold text-gray-900">{analytics.totalGoals}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Completed Goals</span>
                                            <span className="text-sm font-semibold text-gray-900">{analytics.completedGoals}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">All Cohorts</h3>
                                    <div className="space-y-2">
                                        {analytics.cohorts.map((cohort) => (
                                            <div key={cohort.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                                <span className="text-sm text-gray-900">{cohort.name}</span>
                                                <span className="text-xs text-gray-500">{cohort.memberCount} members</span>
                                            </div>
                                        ))}
                                        {analytics.cohorts.length === 0 && (
                                            <p className="text-sm text-gray-500 italic">No cohorts yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
