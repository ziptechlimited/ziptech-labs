import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Target, Users, TrendingUp } from 'lucide-react';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary">Ziptech Labs</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                                    <Link
                                        to="/dashboard"
                                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Go to Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-600 hover:text-gray-900 font-medium"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h2 className="text-5xl font-extrabold text-primary mb-6">
                        Build. Ship. Repeat.
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        An execution-first incubation platform for early-stage founders.
                        Accountability, peer visibility, and structured progress — not social media.
                    </p>
                    {!user && (
                        <Link
                            to="/register"
                            className="inline-flex items-center px-6 py-3 bg-accent text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            Start Building
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <Target className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Weekly Goals</h3>
                        <p className="text-gray-600">
                            Set one public and one private goal each week. Stay focused on what matters.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cohort Accountability</h3>
                        <p className="text-gray-600">
                            Join a cohort of founders. See their progress, offer support, stay motivated.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
                        <p className="text-gray-600">
                            Weekly check-ins, completion rates, and streaks. Build momentum over time.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-500 text-sm">
                        © 2026 Ziptech Labs. Built for builders.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
