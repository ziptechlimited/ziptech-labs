import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_CONFIG } from "../config/api";
import { useAuth } from "../context/AuthContext";

interface PublicUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  company?: string;
  website?: string;
  location?: string;
  createdAt: string;
}

interface Stats {
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  checkIns: { total: number; done: number; partial: number; notDone: number };
}

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{
    name?: string;
    bio?: string;
    company?: string;
    website?: string;
    location?: string;
    avatarUrl?: string;
  }>({});

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      const u = await axios.get(`${API_CONFIG.BASE_URL}/users/${id}`);
      setProfile(u.data);
      const s = await axios.get(`${API_CONFIG.BASE_URL}/users/${id}/stats`);
      setStats({
        totalGoals: s.data.totalGoals,
        completedGoals: s.data.completedGoals,
        completionRate: s.data.completionRate,
        checkIns: {
          total: s.data.checkIns.total,
          done: s.data.checkIns.done,
          partial: s.data.checkIns.partial,
          notDone: s.data.checkIns.notDone,
        },
      });
      setForm({
        name: u.data.name,
        bio: u.data.bio || "",
        company: u.data.company || "",
        website: u.data.website || "",
        location: u.data.location || "",
        avatarUrl: u.data.avatarUrl || "",
      });
    };
    run();
  }, [id]);

  const isMe = user?._id === id || (user as any)?.id === id;

  const save = async () => {
    const res = await axios.patch(`${API_CONFIG.BASE_URL}/users/me`, form);
    setProfile(res.data);
    setEditing(false);
  };

  if (!profile) {
    return <div className="min-h-screen bg-background text-text p-8">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-4xl mx-auto p-6">
      <div className="bg-surface rounded-3xl border border-white/10 p-6 mb-6">
        <div className="flex items-center">
          <img
            src={
              profile.avatarUrl || "https://www.gravatar.com/avatar/?d=mp&s=128"
            }
            className="w-20 h-20 rounded-full mr-4"
          />
          <div className="flex-1">
            {!editing ? (
              <>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-primary">
                  {profile.name}
                </h2>
                <p className="text-sm text-muted">{profile.email}</p>
                <p className="text-xs text-muted mt-1">
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                {profile.bio && (
                  <p className="mt-2 text-muted">{profile.bio}</p>
                )}
                {isMe && (
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 px-5 py-2.5 bg-accent text-black rounded-full font-semibold hover:brightness-95 transition"
                  >
                    Edit Profile
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted">Name</label>
                  <input
                    className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted">Bio</label>
                  <textarea
                    className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                    value={form.bio || ""}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted">Company</label>
                    <input
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={form.company || ""}
                      onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted">Location</label>
                    <input
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={form.location || ""}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted">Website</label>
                    <input
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={form.website || ""}
                      onChange={(e) =>
                        setForm({ ...form, website: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted">Avatar URL</label>
                    <input
                      className="w-full border border-white/10 rounded-2xl px-4 py-3 bg-black/20 text-primary placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                      value={form.avatarUrl || ""}
                      onChange={(e) =>
                        setForm({ ...form, avatarUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={save}
                    className="px-5 py-2.5 bg-accent text-black rounded-full font-semibold hover:brightness-95 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-5 py-2.5 bg-white/5 text-primary rounded-full font-semibold border border-white/10 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {stats && (
        <div className="bg-surface rounded-3xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-black/20 border border-white/10 rounded-2xl">
              <p className="text-sm text-muted">Total Goals</p>
              <p className="text-2xl font-semibold text-primary">
                {stats.totalGoals}
              </p>
            </div>
            <div className="p-4 bg-black/20 border border-white/10 rounded-2xl">
              <p className="text-sm text-muted">Completed</p>
              <p className="text-2xl font-semibold text-primary">
                {stats.completedGoals}
              </p>
            </div>
            <div className="p-4 bg-black/20 border border-white/10 rounded-2xl">
              <p className="text-sm text-muted">Completion Rate</p>
              <p className="text-2xl font-semibold text-primary">
                {stats.completionRate}%
              </p>
            </div>
            <div className="p-4 bg-black/20 border border-white/10 rounded-2xl">
              <p className="text-sm text-muted">Check-ins</p>
              <p className="text-2xl font-semibold text-primary">
                {stats.checkIns.total}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted">
            <p>
              Done: {stats.checkIns.done} • Partial: {stats.checkIns.partial} •
              Not done: {stats.checkIns.notDone}
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserProfile;
