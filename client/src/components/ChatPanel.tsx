import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { Pin, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API, cn, errorMessage } from "../lib/api";
import { Avatar } from "./ui/primitives";

interface ChatMessage {
  _id: string;
  user: { _id: string; name: string; slug?: string };
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

interface ChatResponse {
  messages: ChatMessage[];
  isCheckInDay: boolean;
  sessionActive?: boolean;
}

const ChatPanel = ({ cohortId, moderator = false }: { cohortId: string; moderator?: boolean }) => {
  const { user } = useAuth();
  const [data, setData] = useState<ChatResponse | null>(null);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const userId = user?._id;

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/messages/${cohortId}/messages`);
      setData(res.data);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't load chat"));
    }
  };

  useEffect(() => {
    fetchMessages();
    const s = io(API.replace(/\/api\/?$/, ""));
    socketRef.current = s;
    s.emit("join-cohort", { cohortId, userId, name: user?.name });
    s.on("message", (payload: any) => {
      setData((prev) => (prev && !prev.messages.some((m) => m._id === payload.message._id) ? { ...prev, messages: [...prev.messages, payload.message] } : prev));
    });
    s.on("session", (p: any) => setData((prev) => (prev ? { ...prev, sessionActive: p.active } : prev)));
    s.on("presence", (payload: any) => Array.isArray(payload?.users) && setOnlineUsers(payload.users));
    s.on("typing", (payload: any) => {
      if (!payload?.userId || String(payload.userId) === String(userId)) return;
      window.clearTimeout(typingTimeoutRef.current);
      setTypingUser(payload.name || "Someone");
      typingTimeoutRef.current = window.setTimeout(() => setTypingUser(null), 2000);
    });
    return () => {
      s.emit("leave-cohort", { cohortId, userId });
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId, userId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [data?.messages.length]);

  const open = !!data && (data.isCheckInDay || !!data.sessionActive);

  const send = async () => {
    if (!text.trim()) return;
    try {
      const res = await axios.post(`${API}/messages/${cohortId}/messages`, { content: text.trim() });
      setText("");
      setData((prev) => (prev && !prev.messages.some((m) => m._id === res.data._id) ? { ...prev, messages: [...prev.messages, res.data] } : prev));
    } catch (e) {
      toast.error(errorMessage(e, "Failed to send"));
    }
  };

  const moderate = async (id: string, action: "pin" | "mute") => {
    try {
      await axios.patch(`${API}/messages/messages/${id}/${action}`);
      fetchMessages();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (!data) return <p className="py-8 text-center text-sm text-faint">Loading chat…</p>;

  const pinned = data.messages.filter((m) => m.isPinned);

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className={cn("pill", open ? "pill-lime" : "")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", open ? "bg-lime" : "bg-white/30")} />
          {data.sessionActive ? "Live session" : data.isCheckInDay ? "Check-in day · open" : "Opens on check-in day"}
        </span>
        {onlineUsers.length > 0 && <span className="text-faint">{onlineUsers.length} online · {onlineUsers.map((u) => u.name.split(" ")[0]).join(", ")}</span>}
      </div>

      {pinned.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {pinned.map((m) => (
            <p key={m._id} className="flex items-start gap-2 rounded-xl border border-gold/20 bg-gold/[0.05] px-3 py-2 text-sm text-ink">
              <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              <span><span className="text-subtle">{m.user.name}:</span> {m.content}</span>
            </p>
          ))}
        </div>
      )}

      <div ref={listRef} className="scroll-thin max-h-[420px] min-h-[200px] space-y-4 overflow-y-auto pr-1">
        {data.messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-faint">No messages this week yet.</p>
        ) : (
          data.messages.map((m) => {
            const isMe = m.user?._id === userId;
            return (
              <div key={m._id} className={cn("group flex gap-3", isMe && "flex-row-reverse")}>
                <Avatar name={m.user?.name} size={30} />
                <div className={cn("max-w-[80%]", isMe && "text-right")}>
                  <p className="text-[11px] text-faint">
                    {m.user?.slug ? <Link to={`/f/${m.user.slug}`} className="hover:text-ink">{m.user.name}</Link> : m.user?.name} ·{" "}
                    {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p className={cn("mt-1 inline-block rounded-2xl px-3.5 py-2 text-left text-sm", isMe ? "bg-lime/15 text-ink" : "bg-white/[0.05] text-ink")}>{m.content}</p>
                  {moderator && (
                    <span className="ml-2 hidden gap-2 text-[11px] text-faint group-hover:inline-flex">
                      <button type="button" onClick={() => moderate(m._id, "pin")} className="hover:text-gold">{m.isPinned ? "Unpin" : "Pin"}</button>
                      <button type="button" onClick={() => moderate(m._id, "mute")} className="hover:text-danger">Hide</button>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="h-5 pt-1 text-xs text-faint">{typingUser && `${typingUser} is typing…`}</p>
      <form
        className="mt-1 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          className="input"
          value={text}
          maxLength={500}
          onChange={(e) => {
            setText(e.target.value);
            socketRef.current?.emit("typing", { cohortId, userId, name: user?.name });
          }}
          placeholder={open ? "Share a win, a blocker, or an ask…" : "Chat opens on check-in day (Monday) or during a live session"}
          disabled={!open}
        />
        <button type="submit" disabled={!open || !text.trim()} className="btn btn-primary shrink-0 px-3" aria-label="Send">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
