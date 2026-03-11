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
                <div className="text-muted">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text">
            <nav className="border-b border-white/10 bg-background/70 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <h1 className="text-xl font-semibold tracking-[-0.02em] text-primary">Ziptech Labs</h1>
                                <span className="ml-3 px-2 py-1 text-xs font-semibold bg-white/10 text-muted rounded-full border border-white/10">
                                    Admin
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-muted mr-4">Welcome, {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-muted hover:text-primary transition"
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
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-primary">Admin Dashboard</h2>
                        <button 
                            onClick={handleExport}
                            className="inline-flex items-center px-5 py-2.5 bg-accent text-black rounded-full font-semibold hover:brightness-95 transition"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export Reports
                        </button>
                    </div>
                    
                    {analytics && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-surface rounded-3xl border border-white/10 p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-white/5 rounded-2xl p-3 border border-white/10">
                                            <Users className="h-6 w-6 text-accent" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-muted">Total Cohorts</p>
                                            <p className="text-2xl font-semibold text-primary">{analytics.totalCohorts}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface rounded-3xl border border-white/10 p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-white/5 rounded-2xl p-3 border border-white/10">
                                            <TrendingUp className="h-6 w-6 text-accent" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-muted">Avg Completion</p>
                                            <p className="text-2xl font-semibold text-primary">{analytics.avgCompletionRate}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface rounded-3xl border border-white/10 p-6">
                                    <div className="flex items-center">
                                        <div className="shrink-0 bg-white/5 rounded-2xl p-3 border border-white/10">
                                            <BarChart3 className="h-6 w-6 text-accent" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-muted">Active Users</p>
                                            <p className="text-2xl font-semibold text-primary">{analytics.activeUsers}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-surface border border-white/10 rounded-3xl p-6">
                                    <h3 className="text-lg font-semibold text-primary mb-4">Platform Overview</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted">Total Users</span>
                                            <span className="text-sm font-semibold text-primary">{analytics.totalUsers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted">Total Goals</span>
                                            <span className="text-sm font-semibold text-primary">{analytics.totalGoals}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted">Completed Goals</span>
                                            <span className="text-sm font-semibold text-primary">{analytics.completedGoals}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface border border-white/10 rounded-3xl p-6">
                                    <h3 className="text-lg font-semibold text-primary mb-4">All Cohorts</h3>
                                    <div className="space-y-2">
                                        {analytics.cohorts.map((cohort) => (
                                            <div key={cohort.id} className="flex justify-between items-center p-3 bg-black/20 border border-white/10 rounded-2xl">
                                                <span className="text-sm text-primary">{cohort.name}</span>
                                                <span className="text-xs text-muted">{cohort.memberCount} members</span>
                                            </div>
                                        ))}
                                        {analytics.cohorts.length === 0 && (
                                            <p className="text-sm text-muted italic">No cohorts yet</p>
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
