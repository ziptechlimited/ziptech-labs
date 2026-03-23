import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserRole } from '../types/shared';
import BackToHomeButton from '../components/BackToHomeButton';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.FOUNDER);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            toast.success('Registered successfully');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="mb-4">
                    <BackToHomeButton />
                </div>
                <div className="space-y-8 bg-surface p-10 rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
                    <div>
                        <div className="text-center text-xs uppercase tracking-[0.35em] text-muted">
                            Ziptech Labs
                        </div>
                        <h2 className="mt-4 text-center text-3xl font-semibold tracking-[-0.03em] text-primary">
                            Create account
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="name" className="sr-only">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full px-4 py-3 border border-white/10 bg-black/20 placeholder:text-muted/70 text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 sm:text-sm"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full px-4 py-3 border border-white/10 bg-black/20 placeholder:text-muted/70 text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full px-4 py-3 border border-white/10 bg-black/20 placeholder:text-muted/70 text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-muted mb-2">I am a…</label>
                                <select
                                    id="role"
                                    name="role"
                                    className="block w-full px-4 py-3 border border-white/10 bg-black/20 rounded-2xl shadow-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 sm:text-sm"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                >
                                    <option value={UserRole.FOUNDER}>Founder (Incubatee)</option>
                                    <option value={UserRole.FACILITATOR}>Facilitator (Coach)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-2xl text-black bg-accent hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-accent/30"
                            >
                                Register
                            </button>
                        </div>
                    </form>
                    <div className="text-center">
                        <p className="text-sm text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:text-white transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
