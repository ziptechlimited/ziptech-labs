import { useState, useEffect } from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

interface Meeting {
    _id: string;
    title: string;
    agenda: string;
    scheduledAt: string;
    duration: number;
    rsvps: Array<{
        user: { _id: string; name: string };
        status: 'yes' | 'maybe' | 'no';
    }>;
}

interface MeetingsListProps {
    cohortId: string;
}

const MeetingsList = ({ cohortId }: MeetingsListProps) => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, [cohortId]);

    const fetchMeetings = async () => {
        try {
            const res = await axios.get(`${API_CONFIG.BASE_URL}/meetings?cohort=${cohortId}`);
            setMeetings(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (meetingId: string, status: 'yes' | 'maybe' | 'no') => {
        try {
            await axios.post(`${API_CONFIG.BASE_URL}/meetings/${meetingId}/rsvp`, { status });
            fetchMeetings();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div className="text-gray-500">Loading meetings...</div>;
    }

    if (meetings.length === 0) {
        return <div className="text-gray-500 italic">No upcoming meetings</div>;
    }

    return (
        <div className="space-y-4">
            {meetings.map((meeting) => (
                <div key={meeting._id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                <Clock className="w-4 h-4 ml-3 mr-1" />
                                {meeting.duration} min
                            </div>
                        </div>
                    </div>

                    {meeting.agenda && (
                        <p className="text-sm text-gray-700 mb-3">{meeting.agenda}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            {meeting.rsvps.filter(r => r.status === 'yes').length} attending
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleRSVP(meeting._id, 'yes')}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => handleRSVP(meeting._id, 'maybe')}
                                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                            >
                                Maybe
                            </button>
                            <button
                                onClick={() => handleRSVP(meeting._id, 'no')}
                                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MeetingsList;
