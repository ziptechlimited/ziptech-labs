import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_CONFIG } from "../config/api";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

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
  sessionActive?: boolean;
}

interface Props {
  cohortId: string;
}

const ChatPanel = ({ cohortId }: Props) => {
  const { user } = useAuth();
  const [data, setData] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}/messages/${cohortId}/messages`,
      );
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMessages();
    const s = io((API_CONFIG.BASE_URL as string).replace("/api", ""));
    socketRef.current = s;
    const userId = (user as any)?._id || (user as any)?.id;
    s.emit("join-cohort", {
      cohortId,
      userId,
      name: user?.name,
    });
    s.on("message", (payload: any) => {
      setData((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, payload.message] }
          : prev,
      );
    });
    s.on("session", (p: any) => {
      setData((prev) =>
        prev
          ? ({
              ...prev,
              isCheckInDay: prev.isCheckInDay,
              sessionActive: p.active,
            } as any)
          : prev,
      );
    });
    s.on("presence", (payload: any) => {
      if (Array.isArray(payload?.users)) {
        setOnlineUsers(payload.users);
      }
    });
    s.on("typing", (payload: any) => {
      const currentId = userId?.toString();
      if (!payload?.userId || payload.userId.toString() === currentId) {
        return;
      }
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      setTypingUser(payload.name || "Someone");
      typingTimeoutRef.current = window.setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    });
    return () => {
      s.emit("leave-cohort", { cohortId, userId });
      s.disconnect();
    };
  }, [cohortId, user]);
  const send = async () => {
    if (!text.trim()) return;
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/messages/${cohortId}/messages`, {
        content: text.trim(),
      });
      setText("");
      fetchMessages();
    } catch (e: any) {
      // Surface server message (e.g., not check-in day)
      alert(e.response?.data?.message || "Failed to send");
    }
  };
  if (loading) return <div className="text-muted">Loading chat…</div>;
  if (!data) return null;
  return (
    <div className="space-y-3">
      {!data.isCheckInDay && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-muted">
          Chat is limited to check-in day. You can still read past messages.
        </div>
      )}
      {data.sessionActive && (
        <div className="p-3 bg-success/10 border border-success/25 rounded-2xl text-xs text-success">
          Live session is active
        </div>
      )}
      {onlineUsers.length > 0 && (
        <div className="text-xs text-muted">
          {onlineUsers.length} online:{" "}
          {onlineUsers.map((u) => u.name).join(", ")}
        </div>
      )}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {data.messages.length === 0 ? (
          <div className="text-muted italic">No messages yet</div>
        ) : (
          data.messages.map((m) => (
            <div
              key={m._id}
              className="border border-white/10 rounded-2xl p-4 bg-black/20"
            >
              <div className="text-sm font-semibold text-primary">
                <button
                  type="button"
                  onClick={() => {
                    if (m.user?._id) {
                      window.location.href = `/profile/${m.user._id}`;
                    }
                  }}
                  className="text-primary hover:underline"
                >
                  {m.user.name}
                </button>
              </div>
              <div className="text-primary">{m.content}</div>
              <div className="text-xs text-muted">
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
      {typingUser && (
        <div className="text-xs text-muted">{typingUser} is typing…</div>
      )}
      <div className="flex space-x-2">
        <input
          className="flex-1 border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const s = socketRef.current;
            const userId = (user as any)?._id || (user as any)?.id;
            if (s && cohortId && userId) {
              s.emit("typing", {
                cohortId,
                userId,
                name: user?.name,
              });
            }
          }}
          placeholder={
            data.isCheckInDay || data.sessionActive
              ? "Write a message…"
              : "Chat locked until check-in day"
          }
          disabled={!data.isCheckInDay && !data.sessionActive}
        />
        <button
          onClick={send}
          disabled={(!data.isCheckInDay && !data.sessionActive) || !text.trim()}
          className="px-5 py-3 bg-accent text-black rounded-2xl font-semibold hover:brightness-95 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
