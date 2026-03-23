import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackToHomeButton = () => {
    return (
        <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-white/10 transition"
        >
            <ChevronLeft className="w-4 h-4" />
            <span>Home</span>
        </Link>
    );
};

export default BackToHomeButton;
