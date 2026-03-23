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
  if (loading) return <div className="min-h-screen bg-background text-text p-8">Loading…</div>;
  if (error) return <div className="min-h-screen bg-background text-danger p-8">{error}</div>;
  if (!user) return null;
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="max-w-3xl mx-auto p-6">
      <div className="bg-surface rounded-3xl border border-white/10 p-6">
        <div className="flex items-center">
          <img
            src={user.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp&s=128'}
            alt={`${user.name}'s avatar`}
            className="w-20 h-20 rounded-full mr-4"
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-primary">{user.name}</h1>
            {user.location && <p className="text-muted">{user.location}</p>}
          </div>
        </div>
        {user.bio && <p className="mt-4 text-muted">{user.bio}</p>}
        <div className="mt-4 space-y-1">
          {user.company && <div className="text-sm text-muted">Company: {user.company}</div>}
          {user.website && (
            <div className="text-sm">
              Website:{' '}
              <a className="text-primary underline" href={user.website} target="_blank" rel="noreferrer">
                {user.website}
              </a>
            </div>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
