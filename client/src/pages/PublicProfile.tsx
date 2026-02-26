import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

interface PublicUser {
  name: string;
  bio?: string;
  avatarUrl?: string;
  company?: string;
  website?: string;
  location?: string;
  createdAt?: string;
}

export default function PublicProfile() {
  const { slug } = useParams();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get(`${API_CONFIG.BASE_URL.replace('/api','')}/public/profile/${slug}`);
        setUser(res.data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (slug) run();
  }, [slug]);
  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!user) return null;
  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <img
            src={user.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp&s=128'}
            alt={`${user.name}'s avatar`}
            className="w-20 h-20 rounded-full mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.location && <p className="text-gray-600">{user.location}</p>}
          </div>
        </div>
        {user.bio && <p className="mt-4 text-gray-800">{user.bio}</p>}
        <div className="mt-4 space-y-1">
          {user.company && <div className="text-sm text-gray-700">Company: {user.company}</div>}
          {user.website && (
            <div className="text-sm">
              Website:{' '}
              <a className="text-blue-700 underline" href={user.website} target="_blank" rel="noreferrer">
                {user.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
