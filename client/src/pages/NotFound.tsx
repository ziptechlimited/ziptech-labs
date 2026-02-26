import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
