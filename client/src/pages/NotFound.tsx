import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-background text-text flex items-center justify-center px-4">
            <div className="text-center">
                <div className="text-xs uppercase tracking-[0.35em] text-muted mb-4">Ziptech Labs</div>
                <h1 className="text-6xl font-semibold tracking-[-0.03em] text-primary mb-4">404</h1>
                <p className="text-lg text-muted mb-8">Page not found</p>
                <Link
                    to="/"
                    className="inline-flex items-center px-7 py-3.5 bg-accent text-black rounded-full font-semibold hover:brightness-95 transition"
                >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
