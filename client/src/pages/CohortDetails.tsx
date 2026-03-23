import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const CohortDetails = () => {
    const { id } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background text-text">
            <nav className="border-b border-white/10 bg-background/70 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-semibold tracking-[-0.02em] text-primary">Ziptech Labs</h1>
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
                <div className="px-4 py-6 sm:px-0">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center text-sm text-muted hover:text-primary mb-6 transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </button>

                    <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-primary mb-6">Cohort Details</h2>
                    
                    <div className="bg-surface border border-white/10 rounded-3xl p-6">
                        <p className="text-muted italic">Loading cohort {id}...</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CohortDetails;
