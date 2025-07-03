"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const reason = searchParams.get('reason');

    if (reason === 'unauthorized') {
      toast.error('You must be logged in first to access this page.');
      router.replace('/auth/login'); 
    }

    if (reason === 'expired') {
      toast.error('Your session has expired. Please log in again.');
      router.replace('/auth/login'); 
    }
  }, [searchParams, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (res.ok) {
        toast.success('✅ Login successful!');
        if (data.role === 'Admin') {
          router.push('/auth/admin');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          router.push('/auth/admin');
          setTimeout(() => window.location.reload(), 2000);


        }
      } else {
        toast.error(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('❌ Login failed. Please try again.');
    }
  };


  return (
    <div className="flex min-h-screen mx-60 items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Login to TrackTag</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-red-500 hover:text-red-600">
              Sign up
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm mb-4"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md bg-[#0d1321] text-white hover:bg-[#1b1f2d] focus:outline-none"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
