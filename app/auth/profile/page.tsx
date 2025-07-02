'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
  const [showConfirm, setShowConfirm] = useState(false); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Cache-Control': 'no-store',
          },
        });

        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
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
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('✅ Logged out!');
        router.push('/auth/login');
      } else {
        toast.error('❌ Failed to log out.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Something went wrong during logout.');
    } finally {
      setShowConfirm(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!user) return null;

  return (
    <>
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
          onClick={() => setShowConfirm(true)}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-semibold"
        >
          🚪 Logout
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-3">Confirm Logout</h3>
            <p className="text-gray-700 mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
