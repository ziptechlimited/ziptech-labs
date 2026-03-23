import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Calendar, MessageSquare } from "lucide-react";
import axios from "axios";
import { API_CONFIG } from "../config/api";
import GoalForm from "../components/GoalForm";
import JoinCohortModal from "../components/JoinCohortModal";
import CheckInModal from "../components/CheckInModal";
import SupportActions from "../components/SupportActions";
import MeetingsList from "../components/MeetingsList";
import VerificationBanner from "../components/VerificationBanner";
import ChatPanel from "../components/ChatPanel";

interface SubTask {
  description: string;
  completed: boolean;
}
interface Goal {
  _id: string;
  description: string;
  visibility: "public" | "private";
  status: string;
  user: { _id: string; name: string };
  subTasks?: SubTask[];
}

interface Cohort {
  _id: string;
  name: string;
  inviteCode: string;
  members: Array<{ _id: string; name: string }>;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [myPrivateGoal, setMyPrivateGoal] = useState<Goal | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [checkInModal, setCheckInModal] = useState<{
    isOpen: boolean;
    goalId: string;
    description: string;
  }>({
    isOpen: false,
    goalId: "",
    description: "",
  });
  const [activeTab, setActiveTab] = useState<"goals" | "meetings" | "chat">(
    "goals",
  );

  useEffect(() => {
    fetchGoals();
    if (user?.cohort) {
      fetchCohort();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/goals`);
      // API returns { week, publicGoals: [], myPrivateGoal: {} } or [] if no cohort
      if (Array.isArray(res.data)) {
        // User not in cohort, empty array
        setGoals([]);
        setMyPrivateGoal(null);
      } else {
        // Combine public goals with user's own goals for display
        const allGoals = [...(res.data.publicGoals || [])];
        setGoals(allGoals);
        setMyPrivateGoal(res.data.myPrivateGoal || null);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setGoals([]); // Set empty array on error
      setMyPrivateGoal(null);
    }
  };

  const fetchCohort = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/cohorts/my-cohort`);
      setCohort(res.data);
    } catch (error) {
      console.error("Error fetching cohort:", error);
      setCohort(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openCheckIn = (goalId: string, description: string) => {
    setCheckInModal({ isOpen: true, goalId, description });
  };

  // Fetch user's own goals separately
  const myGoals = goals.filter((g) => {
    const goalUserId = g.user?._id || (g.user as any);
    const currentUserId = (user as any)?._id;
    return goalUserId === currentUserId;
  });
  const cohortGoals = goals.filter((g) => {
    const goalUserId = g.user?._id || (g.user as any);
    const currentUserId = (user as any)?._id;
    return goalUserId !== currentUserId;
  });

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <nav className="border-b border-white/10 bg-background/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold tracking-[-0.02em] text-primary">
                Ziptech Labs
              </h1>
              {cohort && (
                <span className="ml-4 px-3 py-1 bg-white/5 text-muted text-sm rounded-full border border-white/10">
                  {cohort.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted">Welcome, {user?.name}</span>
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

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <VerificationBanner visible={!user?.isVerified} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-surface rounded-3xl border border-white/10">
              <div className="border-b border-white/10">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("goals")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "goals"
                        ? "border-accent text-primary"
                        : "border-transparent text-muted hover:text-primary hover:border-white/15"
                    }`}
                  >
                    Goals
                  </button>
                  {cohort && (
                    <>
                      <button
                        onClick={() => setActiveTab("meetings")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "meetings"
                            ? "border-accent text-primary"
                            : "border-transparent text-muted hover:text-primary hover:border-white/15"
                        }`}
                      >
                        Meetings
                      </button>
                      <button
                        onClick={() => setActiveTab("chat")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "chat"
                            ? "border-accent text-primary"
                            : "border-transparent text-muted hover:text-primary hover:border-white/15"
                        }`}
                      >
                        Chat
                      </button>
                    </>
                  )}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "goals" && (
                  <div className="space-y-6">
                    {/* My Private Goal */}
                    {myPrivateGoal && (
                      <div className="bg-black/20 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-primary mb-2">
                          My Private Goal
                        </h3>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-primary">
                            {myPrivateGoal.description}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              myPrivateGoal.status === "done"
                                ? "bg-success/15 text-success"
                                : myPrivateGoal.status === "partial"
                                  ? "bg-warning/15 text-warning"
                                  : "bg-white/10 text-muted"
                            }`}
                          >
                            {myPrivateGoal.status || "pending"}
                          </span>
                        </div>
                        {myPrivateGoal.subTasks &&
                          myPrivateGoal.subTasks.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-muted mb-2">
                                Subtasks
                              </p>
                              <ul className="space-y-2">
                                {myPrivateGoal.subTasks.map((st, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                                  >
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={st.completed}
                                        onChange={async () => {
                                          if (!user?.isVerified) return;
                                          const updated = [
                                            ...(myPrivateGoal.subTasks || []),
                                          ];
                                          updated[idx] = {
                                            ...st,
                                            completed: !st.completed,
                                          };
                                          try {
                                            await axios.patch(
                                              `${API_CONFIG.BASE_URL}/goals/${myPrivateGoal._id}`,
                                              { subTasks: updated },
                                            );
                                            setMyPrivateGoal({
                                              ...myPrivateGoal,
                                              subTasks: updated,
                                            });
                                          } catch (e) {
                                            console.error(e);
                                          }
                                        }}
                                        disabled={!user?.isVerified}
                                      />
                                      <span
                                        className={`${st.completed ? "line-through text-muted" : "text-primary"}`}
                                      >
                                        {st.description}
                                      </span>
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}

                    {/* My Goals */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-primary">
                          My Goals
                        </h3>
                        <button
                          onClick={() => setIsGoalFormOpen(!isGoalFormOpen)}
                          className={`inline-flex items-center px-4 py-2 bg-accent text-black rounded-full font-semibold hover:brightness-95 transition ${!user?.isVerified ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={!user?.isVerified}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          New Goal
                        </button>
                      </div>

                      {isGoalFormOpen && (
                        <div className="mb-4">
                          <GoalForm
                            onSuccess={() => {
                              fetchGoals();
                              setIsGoalFormOpen(false);
                            }}
                          />
                        </div>
                      )}

                      {myGoals.length > 0 ? (
                        <div className="space-y-3">
                          {myGoals.map((goal) => (
                            <div
                              key={goal._id}
                              className="bg-black/20 border border-white/10 rounded-2xl p-5"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="text-primary font-medium">
                                    {goal.description}
                                  </p>
                                  <span
                                    className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                                      goal.visibility === "public"
                                        ? "bg-white/10 text-muted"
                                        : "bg-white/5 text-muted"
                                    }`}
                                  >
                                    {goal.visibility}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() =>
                                      openCheckIn(goal._id, goal.description)
                                    }
                                    className="ml-4 px-3 py-1 bg-success text-black text-sm rounded-full font-semibold hover:brightness-95 transition"
                                  >
                                    Check-in
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await axios.patch(
                                          `${API_CONFIG.BASE_URL}/goals/${goal._id}`,
                                          { status: "done" },
                                        );
                                        fetchGoals();
                                      } catch (e) {}
                                    }}
                                    className="px-3 py-1 bg-white/10 text-primary text-sm rounded-full font-semibold hover:bg-white/15 transition"
                                  >
                                    Mark Done
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted italic">
                          No goals yet. Create your first goal!
                        </p>
                      )}
                    </div>

                    {/* Cohort Goals */}
                    {cohort && (
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-4">
                          Cohort Updates
                        </h3>
                        {cohortGoals.length > 0 ? (
                          <div className="space-y-3">
                            {cohortGoals.map((goal) => (
                              <div
                                key={goal._id}
                                className="bg-black/20 border border-white/10 rounded-2xl p-5"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <a
                                      href={`/profile/${goal.user._id}`}
                                      className="font-semibold text-primary hover:underline"
                                    >
                                      {goal.user.name}
                                    </a>
                                    <p className="text-muted mt-1">
                                      {goal.description}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      goal.status === "done"
                                        ? "bg-success/15 text-success"
                                        : goal.status === "partial"
                                          ? "bg-warning/15 text-warning"
                                          : "bg-white/10 text-muted"
                                    }`}
                                  >
                                    {goal.status || "pending"}
                                  </span>
                                </div>
                                <SupportActions
                                  goalId={goal._id}
                                  onSuccess={fetchGoals}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted italic">
                            No public goals from cohort members yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "meetings" && cohort && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Upcoming Meetings
                    </h3>
                    <MeetingsList cohortId={cohort._id} />
                  </div>
                )}

                {activeTab === "chat" && cohort && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Cohort Chat
                    </h3>
                    <ChatPanel cohortId={cohort._id} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cohort Card */}
            <div className="bg-surface rounded-3xl border border-white/10 p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-muted mr-2" />
                <h3 className="text-lg font-semibold text-primary">
                  My Cohort
                </h3>
              </div>
              {cohort ? (
                <div>
                  <p className="text-sm text-muted mb-2">
                    {cohort.members.length} members
                  </p>
                  <div className="space-y-2">
                    {cohort.members.slice(0, 5).map((member) => (
                      <div key={member._id} className="text-sm text-muted">
                        •{" "}
                        <a
                          href={`/profile/${member._id}`}
                          className="hover:underline text-primary"
                        >
                          {member.name}
                        </a>
                      </div>
                    ))}
                    {cohort.members.length > 5 && (
                      <p className="text-xs text-muted">
                        +{cohort.members.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted mb-3">
                    You're not in a cohort yet.
                  </p>
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full px-4 py-2 bg-accent text-black rounded-full font-semibold hover:brightness-95 transition"
                  >
                    Join a Cohort
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-surface rounded-3xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                This Week
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">My Goals</span>
                  <span className="text-sm font-semibold text-primary">
                    {myGoals.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Cohort Goals</span>
                  <span className="text-sm font-semibold text-primary">
                    {cohortGoals.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <JoinCohortModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => {
          setIsJoinModalOpen(false);
          window.location.reload();
        }}
      />
      <CheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() =>
          setCheckInModal({ isOpen: false, goalId: "", description: "" })
        }
        goalId={checkInModal.goalId}
        goalDescription={checkInModal.description}
        onSuccess={() => {
          setCheckInModal({ isOpen: false, goalId: "", description: "" });
          fetchGoals();
        }}
      />
    </div>
  );
};

export default Dashboard;
