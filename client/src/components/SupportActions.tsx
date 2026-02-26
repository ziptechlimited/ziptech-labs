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
                <p className="text-xs text-red-600 mb-2">{error}</p>
            )}
            
            {!showHelpInput ? (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleSupport('support')}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                    >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Support
                    </button>
                    <button
                        onClick={() => setShowHelpInput(true)}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition disabled:opacity-50"
                    >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Offer Help
                    </button>
                    <button
                        onClick={() => handleSupport('endorse')}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition disabled:opacity-50"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="How can you help? (max 120 chars)"
                        rows={2}
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{helpMessage.length}/120</span>
                        <div className="space-x-2">
                            <button
                                onClick={() => {
                                    setShowHelpInput(false);
                                    setHelpMessage('');
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleHelpSubmit}
                                disabled={!helpMessage.trim() || loading}
                                className="px-3 py-1 text-sm bg-accent text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
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
