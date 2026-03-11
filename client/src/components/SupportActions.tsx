import { useState } from 'react';
import { ThumbsUp, MessageCircle, Star } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

interface SupportActionsProps {
    goalId: string;
    onSuccess: () => void;
}

const SupportActions = ({ goalId, onSuccess }: SupportActionsProps) => {
    const [showHelpInput, setShowHelpInput] = useState(false);
    const [helpMessage, setHelpMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSupport = async (type: 'support' | 'help' | 'endorse', message?: string) => {
        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_CONFIG.BASE_URL}/support/${goalId}`, {
                type,
                message
            });
            onSuccess();
            setShowHelpInput(false);
            setHelpMessage('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add support');
        } finally {
            setLoading(false);
        }
    };

    const handleHelpSubmit = () => {
        if (helpMessage.trim()) {
            handleSupport('help', helpMessage);
        }
    };

    return (
        <div className="mt-3">
            {error && (
                <p className="text-xs text-danger mb-2">{error}</p>
            )}
            
            {!showHelpInput ? (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleSupport('support')}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 text-sm bg-white/5 text-primary rounded-full border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
                    >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Support
                    </button>
                    <button
                        onClick={() => setShowHelpInput(true)}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 text-sm bg-white/5 text-primary rounded-full border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
                    >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Offer Help
                    </button>
                    <button
                        onClick={() => handleSupport('endorse')}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 text-sm bg-white/5 text-primary rounded-full border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
                    >
                        <Star className="w-4 h-4 mr-1" />
                        Endorse
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <textarea
                        value={helpMessage}
                        onChange={(e) => setHelpMessage(e.target.value)}
                        maxLength={120}
                        className="w-full px-4 py-3 text-sm border border-white/10 rounded-2xl bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                        placeholder="How can you help? (max 120 chars)"
                        rows={2}
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted">{helpMessage.length}/120</span>
                        <div className="space-x-2">
                            <button
                                onClick={() => {
                                    setShowHelpInput(false);
                                    setHelpMessage('');
                                }}
                                className="px-4 py-2 text-sm text-primary bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleHelpSubmit}
                                disabled={!helpMessage.trim() || loading}
                                className="px-4 py-2 text-sm bg-accent text-black rounded-full font-semibold hover:brightness-95 transition disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportActions;
