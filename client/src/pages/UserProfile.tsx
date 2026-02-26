import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { useAuth } from '../context/AuthContext';

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
  const [form, setForm] = useState<{ name?: string; bio?: string; company?: string; website?: string; location?: string; avatarUrl?: string }>({});

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
          notDone: s.data.checkIns.notDone
        }
      });
      setForm({
        name: u.data.name,
        bio: u.data.bio || '',
        company: u.data.company || '',
        website: u.data.website || '',
        location: u.data.location || '',
        avatarUrl: u.data.avatarUrl || ''
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
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <img
            src={profile.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp&s=128'}
            className="w-20 h-20 rounded-full mr-4"
          />
          <div className="flex-1">
            {!editing ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-600">{profile.email}</p>
                {profile.bio && <p className="mt-2 text-gray-700">{profile.bio}</p>}
                {isMe && (
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-3 px-3 py-2 bg-accent text-white rounded-md"
                  >
                    Edit Profile
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700">Name</label>
                  <input className="w-full border rounded px-2 py-1" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Bio</label>
                  <textarea className="w-full border rounded px-2 py-1" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-700">Company</label>
                    <input className="w-full border rounded px-2 py-1" value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Location</label>
                    <input className="w-full border rounded px-2 py-1" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Website</label>
                    <input className="w-full border rounded px-2 py-1" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Avatar URL</label>
                    <input className="w-full border rounded px-2 py-1" value={form.avatarUrl || ''} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} />
                  </div>
                </div>
                <div className="space-x-2">
                  <button onClick={save} className="px-3 py-2 bg-accent text-white rounded-md">Save</button>
                  <button onClick={() => setEditing(false)} className="px-3 py-2 bg-gray-100 rounded-md">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedGoals}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.checkIns.total}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

