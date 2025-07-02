'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  username: string;
  email: string;
  role?: string;
}

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Cache-Control': 'no-store',
          },
        });

        if (!res.ok) throw new Error('Unauthorized');
        console.log('User response:', await res.clone().json());
        const data = await res.json();
        console.log('✅ User data:', data);
        setUser(data.user);
      } catch (err) {
        setError('You must be logged in to view this page.');
        setTimeout(() => router.push('/auth/login'), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        router.push('/auth/login');
      } else {
        alert('Failed to log out.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Something went wrong during logout.');
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!user) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-sm mx-auto mt-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Welcome, {user.username}!</h2>
      </div>

      <div className="mb-3">
        <span className="text-gray-600">Email:</span>
        <p className="text-gray-900 font-medium">{user.email}</p>
      </div>

      {user.role && (
        <div className="mb-5">
          <span className="text-gray-600">Role:</span>
          <p className="text-gray-900 font-medium capitalize">
            {user.role}
            {user.role.toLowerCase() === 'admin' && (
              <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded">
                Admin
              </span>
            )}
          </p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-semibold"
      >
        🚪 Logout
      </button>
    </div>
  );
}
