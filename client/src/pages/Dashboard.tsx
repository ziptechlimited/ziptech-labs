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

interface Goal {
  _id: string;
  description: string;
  visibility: "public" | "private";
  status: string;
  user: { _id: string; name: string };
  subTasks?: string[];
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
      } else {
        // Combine public goals with user's own goals for display
        const allGoals = [...(res.data.publicGoals || [])];
        setGoals(allGoals);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setGoals([]); // Set empty array on error
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Ziptech Labs</h1>
              {cohort && (
                <span className="ml-4 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                  {cohort.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("goals")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "goals"
                        ? "border-accent text-accent"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                            ? "border-accent text-accent"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Meetings
                      </button>
                      <button
                        onClick={() => setActiveTab("chat")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "chat"
                            ? "border-accent text-accent"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                    {/* My Goals */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          My Goals
                        </h3>
                        <button
                          onClick={() => setIsGoalFormOpen(!isGoalFormOpen)}
                          className={`inline-flex items-center px-3 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition ${!user?.isVerified ? "opacity-50 cursor-not-allowed" : ""}`}
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
                              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="text-gray-900 font-medium">
                                    {goal.description}
                                  </p>
                                  <span
                                    className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                                      goal.visibility === "public"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {goal.visibility}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    openCheckIn(goal._id, goal.description)
                                  }
                                  className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                >
                                  Check-in
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No goals yet. Create your first goal!
                        </p>
                      )}
                    </div>

                    {/* Cohort Goals */}
                    {cohort && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Cohort Updates
                        </h3>
                        {cohortGoals.length > 0 ? (
                          <div className="space-y-3">
                            {cohortGoals.map((goal) => (
                              <div
                                key={goal._id}
                                className="bg-white border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-semibold text-primary">
                                      {goal.user.name}
                                    </p>
                                    <p className="text-gray-700 mt-1">
                                      {goal.description}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      goal.status === "done"
                                        ? "bg-green-100 text-green-800"
                                        : goal.status === "partial"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
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
                          <p className="text-gray-500 italic">
                            No public goals from cohort members yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "meetings" && cohort && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Upcoming Meetings
                    </h3>
                    <MeetingsList cohortId={cohort._id} />
                  </div>
                )}

                {activeTab === "chat" && cohort && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Cohort Chat
                    </h3>
                    <p className="text-gray-500 italic">
                      Chat feature coming soon...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cohort Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  My Cohort
                </h3>
              </div>
              {cohort ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {cohort.members.length} members
                  </p>
                  <div className="space-y-2">
                    {cohort.members.slice(0, 5).map((member) => (
                      <div key={member._id} className="text-sm text-gray-700">
                        • {member.name}
                      </div>
                    ))}
                    {cohort.members.length > 5 && (
                      <p className="text-xs text-gray-500">
                        +{cohort.members.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    You're not in a cohort yet.
                  </p>
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Join a Cohort
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                This Week
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">My Goals</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {myGoals.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cohort Goals</span>
                  <span className="text-sm font-semibold text-gray-900">
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
