import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

interface ChatMessage {
  _id: string;
  user: { _id: string; name: string };
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

interface ChatResponse {
  messages: ChatMessage[];
  isCheckInDay: boolean;
}

interface Props {
  cohortId: string;
}

const ChatPanel = ({ cohortId }: Props) => {
  const [data, setData] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/messages/${cohortId}/messages`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMessages();
  }, [cohortId]);
  const send = async () => {
    if (!text.trim()) return;
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/messages/${cohortId}/messages`, { content: text.trim() });
      setText('');
      fetchMessages();
    } catch (e: any) {
      // Surface server message (e.g., not check-in day)
      alert(e.response?.data?.message || 'Failed to send');
    }
  };
  if (loading) return <div className="text-gray-500">Loading chat…</div>;
  if (!data) return null;
  return (
    <div className="space-y-3">
      {!data.isCheckInDay && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
          Chat is limited to check-in day. You can still read past messages.
        </div>
      )}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {data.messages.length === 0 ? (
          <div className="text-gray-500 italic">No messages yet</div>
        ) : (
          data.messages.map((m) => (
            <div key={m._id} className="border border-gray-200 rounded p-3 bg-white">
              <div className="text-sm font-semibold text-gray-800">{m.user.name}</div>
              <div className="text-gray-800">{m.content}</div>
              <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
      <div className="flex space-x-2">
        <input
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={data.isCheckInDay ? 'Write a message…' : 'Chat locked until check-in day'}
          disabled={!data.isCheckInDay}
        />
        <button
          onClick={send}
          disabled={!data.isCheckInDay || !text.trim()}
          className="px-4 py-2 bg-accent text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;

