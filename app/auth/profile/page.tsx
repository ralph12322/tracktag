'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me'); // Create this endpoint to return user info
        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        router.push('/auth/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    router.push('/auth/login');
  };

  if (!user) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🗿 Profile</h2>
      <div className="mb-2">
        <span className="text-gray-600">Username:</span>
        <p className="text-gray-900 font-medium">{user.username}</p>
      </div>
      <div className="mb-4">
        <span className="text-gray-600">Email:</span>
        <p className="text-gray-900 font-medium">{user.email}</p>
      </div>
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-semibold"
      >
        🚪 Logout
      </button>
    </div>
  );
}
