import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Plus,
  Menu,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { API_CONFIG } from "../config/api";
import CreateCohortModal from "../components/CreateCohortModal";
import VerificationBanner from "../components/VerificationBanner";
import ChatPanel from "../components/ChatPanel";
import MeetingsList from "../components/MeetingsList";
import { ICohort } from "../types/shared";
import toast from "react-hot-toast";

interface Analytics {
  cohort: {
    name: string;
    memberCount: number;
  };
  metrics: {
    totalGoals: number;
    completedGoals: number;
    completionRate: number;
    submissionRate: number;
    engagementScore: number;
  };
  members: Array<{ _id: string; name: string; email: string }>;
}

const FacilitatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [cohortId, setCohortId] = useState<string>("");
  const [cohortDetails, setCohortDetails] = useState<ICohort | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [mTitle, setMTitle] = useState("");
  const [mAgenda, setMAgenda] = useState("");
  const [mDate, setMDate] = useState<string>("");
  const [mTime, setMTime] = useState<string>("");
  const [mDuration, setMDuration] = useState<number>(60);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<
    "analytics" | "cohort" | "members" | "chat" | "meetings"
  >("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSession = async (open: boolean) => {
    try {
      if (!cohortId) return;
      if (open) {
        const res = await axios.post(
          `${API_CONFIG.BASE_URL}/checkin-sessions/start`,
          { cohortId },
        );
        setSessionActive(res.data.active);
      } else {
        const res = await axios.post(
          `${API_CONFIG.BASE_URL}/checkin-sessions/stop`,
          { cohortId },
        );
        setSessionActive(res.data.active);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCohort = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/cohorts/my-cohort`);
      setCohortDetails(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.cohort) {
      const id =
        typeof user.cohort === "string"
          ? user.cohort
          : (user.cohort as any)._id;
      setCohortId(id);
      setLoading(true);
      const run = async () => {
        try {
          await Promise.all([fetchAnalytics(id), fetchCohort()]);
        } finally {
          setLoading(false);
        }
      };
      run();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAnalytics = async (id: string) => {
    try {
      const res = await axios.get(
        `${API_CONFIG.BASE_URL}/analytics/cohort/${id}`,
      );
      setAnalytics(res.data);
      const ms = await axios.get(
        `${API_CONFIG.BASE_URL}/meetings?cohort=${id}`,
      );
      setMeetings(ms.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCopyInviteCode = async () => {
    if (!cohortDetails?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(cohortDetails.inviteCode);
      toast.success("Invite code copied");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy invite code");
    }
  };

  const handleShareInviteEmail = () => {
    if (!cohortDetails?.inviteCode) return;
    const subject = "Join my Ziptech Labs cohort";
    const body = `Hi,\n\nHere is the invite code to join my cohort: ${cohortDetails.inviteCode}.\n\nSign up or log in to Ziptech Labs, then use this code to join the cohort.\n\nThanks.`;
    const mailto = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const handleCopyInviteLink = async () => {
    if (!cohortDetails?.inviteCode) return;
    const link = `${window.location.origin}/register?invite=${cohortDetails.inviteCode}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Shareable link copied");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!user?.cohort) {
    return (
      <div className="min-h-screen bg-background text-text">
        <nav className="border-b border-white/10 bg-background/70 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="shrink-0 flex items-center">
                  <h1 className="text-xl font-semibold tracking-[-0.02em] text-primary">
                    Ziptech Labs
                  </h1>
                  <span className="ml-3 px-2 py-1 text-xs font-semibold bg-white/10 text-muted rounded-full border border-white/10">
                    Facilitator
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-muted mr-4">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-muted hover:text-primary transition"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <VerificationBanner visible={!user?.isVerified} />
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.35em] text-muted mb-4">
              Facilitator Console
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-primary mb-4">
              Create Your First Cohort
            </h2>
            <p className="text-muted mb-8 max-w-xl mx-auto">
              Get started by creating a cohort for your founders.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={`inline-flex items-center px-7 py-3.5 bg-accent text-black rounded-full font-semibold hover:brightness-95 transition ${!user?.isVerified ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!user?.isVerified}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Cohort
            </button>
          </div>
        </main>

        <CreateCohortModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <nav className="border-b border-white/10 bg-background/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="mr-3 lg:hidden text-muted hover:text-primary transition"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="shrink-0 flex items-center">
                <h1 className="text-xl font-semibold tracking-[-0.02em] text-primary">
                  Ziptech Labs
                </h1>
                <span className="ml-3 px-2 py-1 text-xs font-semibold bg-white/10 text-muted rounded-full border border-white/10">
                  Facilitator
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-muted mr-4">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-muted hover:text-primary transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full flex">
        <aside
          className={`bg-surface border-r border-white/10 w-64 p-4 space-y-2 transform transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <VerificationBanner visible={!user?.isVerified} />
          <h2 className="text-sm font-semibold text-muted mb-2">
            Navigation
          </h2>
          <button
            type="button"
            onClick={() => setActiveSection("analytics")}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              activeSection === "analytics"
                ? "bg-accent text-black"
                : "text-muted hover:bg-white/5 hover:text-primary"
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("cohort")}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              activeSection === "cohort"
                ? "bg-accent text-black"
                : "text-muted hover:bg-white/5 hover:text-primary"
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Cohort Management
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("members")}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              activeSection === "members"
                ? "bg-accent text-black"
                : "text-muted hover:bg-white/5 hover:text-primary"
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Member Profiles
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("chat")}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              activeSection === "chat"
                ? "bg-accent text-black"
                : "text-muted hover:bg-white/5 hover:text-primary"
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Cohort Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("meetings")}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              activeSection === "meetings"
                ? "bg-accent text-black"
                : "text-muted hover:bg-white/5 hover:text-primary"
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Meetings
          </button>
        </aside>

        <section className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-primary mb-6">
            {analytics?.cohort.name || "Facilitator Dashboard"}
          </h2>

          {!analytics && (
            <div className="bg-surface rounded-3xl border border-white/10 p-6">
              <p className="text-muted">No analytics available yet.</p>
            </div>
          )}

          {analytics && activeSection === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface rounded-3xl border border-white/10 p-6">
                  <div className="flex items-center">
                    <div className="shrink-0 bg-white/5 rounded-2xl p-3 border border-white/10">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted">
                        Total Members
                      </p>
                      <p className="text-2xl font-semibold text-primary">
                        {analytics.cohort.memberCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-3xl border border-white/10 p-6">
                  <div className="flex items-center">
                    <div className="shrink-0 bg-white/5 rounded-2xl p-3 border border-white/10">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-semibold text-primary">
                        {analytics.metrics.completionRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-3xl border border-white/10 p-6">
                  <div className="flex items-center">
                    <div className="shrink-0 bg-white/5 rounded-2xl p-3 border border-white/10">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted">
                        Submission Rate
                      </p>
                      <p className="text-2xl font-semibold text-primary">
                        {analytics.metrics.submissionRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-3xl border border-white/10 p-6">
                  <div className="flex items-center">
                    <div className="shrink-0 bg-white/5 rounded-2xl p-3 border border-white/10">
                      <MessageSquare className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted">
                        Engagement Score
                      </p>
                      <p className="text-2xl font-semibold text-primary">
                        {analytics.metrics.engagementScore}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analytics && activeSection === "members" && (
            <div className="bg-surface border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Cohort Members
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-white/5 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 bg-white/5 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {analytics.members.map((member) => (
                      <tr key={member._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                          <button
                            type="button"
                            onClick={() => navigate(`/profile/${member._id}`)}
                            className="text-primary hover:underline"
                          >
                            {member.name}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {member.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "cohort" && (
            <div className="space-y-6">
              <div className="bg-surface rounded-3xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Cohort Invite
                </h3>
                {cohortDetails ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted mb-1">Cohort</p>
                      <p className="text-base font-semibold text-primary">
                        {cohortDetails.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted mb-1">Invite Code</p>
                      <div className="flex items-center space-x-3">
                        <code className="bg-white/5 px-3 py-1 rounded-xl text-lg font-mono text-accent border border-white/10">
                          {cohortDetails.inviteCode || "No Code"}
                        </code>
                        {cohortDetails.inviteCode && (
                          <>
                            <button
                              type="button"
                              onClick={handleCopyInviteCode}
                              className="px-4 py-2 text-sm bg-accent text-black rounded-full font-semibold hover:brightness-95 transition"
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={handleShareInviteEmail}
                              className="px-4 py-2 text-sm bg-white/5 text-primary rounded-full font-semibold border border-white/10 hover:bg-white/10 transition"
                            >
                              Share via Email
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {cohortDetails.inviteCode && (
                      <div>
                        <p className="text-sm text-muted mb-1">
                          Shareable Link
                        </p>
                        <div className="flex items-center space-x-2">
                          <input
                            readOnly
                            value={`${window.location.origin}/register?invite=${cohortDetails.inviteCode}`}
                            className="flex-1 border border-white/10 rounded-xl px-3 py-2 text-xs text-muted bg-black/20"
                          />
                          <button
                            type="button"
                            onClick={handleCopyInviteLink}
                            className="px-4 py-2 text-sm bg-white/10 text-primary rounded-full font-semibold hover:bg-white/15 transition"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted">
                    Cohort details not available yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeSection === "chat" && (
            <div className="space-y-6">
              <div className="bg-surface border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">
                    Check-in Session
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      sessionActive
                        ? "bg-success/15 text-success"
                        : "bg-white/10 text-muted"
                    }`}
                  >
                    {sessionActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => toggleSession(true)}
                    className="px-4 py-2 bg-success text-black rounded-full font-semibold hover:brightness-95 transition"
                  >
                    Start Session
                  </button>
                  <button
                    onClick={() => toggleSession(false)}
                    className="px-4 py-2 bg-white/10 text-primary rounded-full font-semibold hover:bg-white/15 transition"
                  >
                    Stop Session
                  </button>
                </div>
              </div>

              {cohortId && (
                <div className="bg-surface border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Cohort Chat
                  </h3>
                  <ChatPanel cohortId={cohortId} />
                </div>
              )}
            </div>
          )}

          {activeSection === "meetings" && (
            <div className="space-y-6">
              <div className="bg-surface border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Schedule Meeting
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted">Title</label>
                    <input
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={mTitle}
                      onChange={(e) => setMTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={mDuration}
                      onChange={(e) =>
                        setMDuration(parseInt(e.target.value || "0"))
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted">Agenda</label>
                    <textarea
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={mAgenda}
                      onChange={(e) => setMAgenda(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted">Date</label>
                    <input
                      type="date"
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={mDate}
                      onChange={(e) => setMDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted">Time</label>
                    <input
                      type="time"
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={mTime}
                      onChange={(e) => setMTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      if (!mTitle || !mDate || !mTime) {
                        toast.error("Title, date, and time are required");
                        return;
                      }
                      setCreatingMeeting(true);
                      try {
                        const scheduledAt = new Date(`${mDate}T${mTime}:00`);
                        await axios.post(`${API_CONFIG.BASE_URL}/meetings`, {
                          cohort: cohortId,
                          title: mTitle,
                          agenda: mAgenda,
                          scheduledAt,
                          duration: mDuration,
                        });
                        const ms = await axios.get(
                          `${API_CONFIG.BASE_URL}/meetings?cohort=${cohortId}`,
                        );
                        setMeetings(ms.data);
                        setMTitle("");
                        setMAgenda("");
                        setMDate("");
                        setMTime("");
                        toast.success("Meeting scheduled");
                      } catch (e: any) {
                        console.error(e);
                        const msg =
                          e.response?.data?.message ||
                          "Failed to schedule meeting";
                        toast.error(msg);
                      } finally {
                        setCreatingMeeting(false);
                      }
                    }}
                    disabled={creatingMeeting}
                    className="px-6 py-2.5 bg-accent text-black rounded-full font-semibold hover:brightness-95 disabled:opacity-50 transition"
                  >
                    {creatingMeeting ? "Scheduling…" : "Create Meeting"}
                  </button>
                </div>
              </div>

              <div className="bg-surface border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Upcoming Meetings
                </h3>
                <div className="space-y-3">
                  {meetings.map((m) => (
                    <div
                      key={m._id}
                      className="border border-white/10 rounded-2xl p-5 bg-black/20 flex justify-between items-start"
                    >
                      <div>
                        <div className="font-semibold text-primary">
                          {m.title}
                        </div>
                        {m.agenda && (
                          <div className="text-sm text-muted">
                            {m.agenda}
                          </div>
                        )}
                        <div className="text-xs text-muted">
                          {format(new Date(m.scheduledAt), "PPpp")} •{" "}
                          {m.duration} min
                        </div>
                        {m.meetLink && (
                          <div className="mt-2 text-xs text-primary">
                            <a
                              href={m.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="underline mr-2"
                            >
                              Open Google Meet
                            </a>
                            <button
                              type="button"
                              className="text-primary underline"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    m.meetLink,
                                  );
                                  toast.success("Google Meet link copied");
                                } catch (e) {
                                  console.error(e);
                                  toast.error("Failed to copy link");
                                }
                              }}
                            >
                              Copy link
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={async () => {
                            const expiresInMinutes = 60;
                            try {
                              const inv = await axios.post(
                                `${API_CONFIG.BASE_URL}/invite-codes/meeting/${m._id}`,
                                { expiresInMinutes },
                              );
                              const code = inv.data.code;
                              await navigator.clipboard.writeText(code);
                              toast.success("Meeting invite code copied");
                            } catch (e: any) {
                              console.error(e);
                              const msg =
                                e.response?.data?.message ||
                                "Failed to generate invite";
                              toast.error(msg);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-white/10 text-primary rounded-full font-semibold hover:bg-white/15 transition"
                        >
                          Generate Invite
                        </button>
                        <button
                          onClick={async () => {
                            const newDate = window.prompt(
                              "Enter new date (YYYY-MM-DD)",
                            );
                            const newTime = window.prompt(
                              "Enter new time (HH:MM, 24h)",
                            );
                            if (!newDate || !newTime) {
                              return;
                            }
                            try {
                              const scheduledAt = new Date(
                                `${newDate}T${newTime}:00`,
                              );
                              await axios.patch(
                                `${API_CONFIG.BASE_URL}/meetings/${m._id}`,
                                {
                                  title: m.title,
                                  agenda: m.agenda,
                                  scheduledAt,
                                  duration: m.duration,
                                },
                              );
                              const ms = await axios.get(
                                `${API_CONFIG.BASE_URL}/meetings?cohort=${cohortId}`,
                              );
                              setMeetings(ms.data);
                              toast.success("Meeting updated");
                            } catch (e: any) {
                              console.error(e);
                              const msg =
                                e.response?.data?.message ||
                                "Failed to update meeting";
                              toast.error(msg);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-accent text-black rounded-full font-semibold hover:brightness-95 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await axios.delete(
                                `${API_CONFIG.BASE_URL}/meetings/${m._id}`,
                              );
                              setMeetings(
                                meetings.filter((x) => x._id !== m._id),
                              );
                              toast.success("Meeting deleted");
                            } catch (e: any) {
                              console.error(e);
                              const msg =
                                e.response?.data?.message ||
                                "Failed to delete meeting";
                              toast.error(msg);
                            }
                          }}
                          className="px-3 py-1 text-xs bg-danger text-black rounded-full font-semibold hover:brightness-95 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {meetings.length === 0 && (
                    <div className="text-muted italic">
                      No meetings scheduled
                    </div>
                  )}
                </div>
              </div>

              {cohortId && (
                <div className="bg-surface border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Member Calendar View
                  </h3>
                  <MeetingsList cohortId={cohortId} />
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FacilitatorDashboard;
