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
    meetLink?: string;
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
        return <div className="text-muted">Loading meetings...</div>;
    }

    if (meetings.length === 0) {
        return <div className="text-muted italic">No upcoming meetings</div>;
    }

    return (
        <div className="space-y-4">
            {meetings.map((meeting) => (
                <div key={meeting._id} className="bg-black/20 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h4 className="font-semibold text-primary">{meeting.title}</h4>
                            <div className="flex items-center text-sm text-muted mt-1">
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
                        <p className="text-sm text-muted mb-3">{meeting.agenda}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted">
                            <Users className="w-4 h-4 mr-1" />
                            {meeting.rsvps.filter(r => r.status === 'yes').length} attending
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleRSVP(meeting._id, 'yes')}
                                className="px-3 py-1 text-xs bg-success/15 text-success rounded-full border border-success/25 hover:bg-success/20 transition"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => handleRSVP(meeting._id, 'maybe')}
                                className="px-3 py-1 text-xs bg-warning/15 text-warning rounded-full border border-warning/25 hover:bg-warning/20 transition"
                            >
                                Maybe
                            </button>
                            <button
                                onClick={() => handleRSVP(meeting._id, 'no')}
                                className="px-3 py-1 text-xs bg-white/10 text-muted rounded-full border border-white/10 hover:bg-white/15 transition"
                            >
                                No
                            </button>
                        </div>
                    </div>
                    {meeting.rsvps.length > 0 && (
                        <div className="mt-3 text-xs text-muted">
                            Attendees:{" "}
                            {meeting.rsvps
                                .filter(r => r.status === 'yes')
                                .map(r => (
                                    <a
                                        key={r.user._id}
                                        href={`/profile/${r.user._id}`}
                                        className="hover:underline text-primary mr-2"
                                    >
                                        {r.user.name}
                                    </a>
                                ))}
                        </div>
                    )}
                    {meeting.meetLink && (
                        <div className="mt-3 text-xs">
                            <a
                                href={meeting.meetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline mr-2"
                            >
                                Join via Google Meet
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MeetingsList;
