'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReactECharts from 'echarts-for-react';

interface UserData {
  username: string;
  email: string;
  role: string;
}

interface FeedbackData {
  name: string;
  email: string;
  message: string;
}

interface UserStats {
  activeTracks: number;
  pastTracks: number;
}

interface Product {
  _id: string;
  url: string;
  title: string;
  currentPrice: string;
  originalPrice: string;
  isActive: boolean;
}

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    name: user?.username || '',
    email: user?.email || '',
    message: '',
  });

  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/user/stats', { credentials: 'include' }),
        ]);

        if (!userRes.ok) throw new Error('Unauthorized');
        if (!statsRes.ok) throw new Error('Failed to fetch stats');

        const userData = await userRes.json();
        const statsData = await statsRes.json();

        setUser(userData.user);
        setStats(statsData);
      } catch (err) {
        console.error(err);
        setError('You must be logged in to view this page.');
        setTimeout(() => router.push('/auth/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndStats();
  }, [router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/user/products', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const handleShowLess = () => {
    setVisibleCount(10);
  };

  const visibleProducts = products.slice(0, visibleCount);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out!');
        window.dispatchEvent(new Event('user-updated'));
        router.push('/auth/login');
      } else {
        toast.error('Failed to log out.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Something went wrong during logout.');
    } finally {
      setShowConfirm(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback || !feedback.message) {
      toast.error('Please enter your feedback.');
      return;
    }
    try {
      await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.username,
          email: user?.email,
          message: feedback.message,
        }),
      });
      toast.success('Thank you for your feedback!');
      setFeedback({ name: user?.username || '', email: user?.email || '', message: '' });
      setShowFeedback(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback.');
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center p-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/20">
          <h1 className="text-2xl font-bold text-red-400 mb-2">{error}</h1>
          <p className="text-slate-300">Redirecting...</p>
        </div>
      </div>
    );

  if (!user) return null;

  const chartOption = stats
    ? {
      tooltip: { 
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: 'rgba(20, 184, 166, 0.3)',
        textStyle: { color: '#e2e8f0' }
      },
      legend: { 
        bottom: 0,
        textStyle: { color: '#cbd5e1' }
      },
      series: [
        {
          name: 'Tracking Stats',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 2 },
          label: { 
            show: true, 
            position: 'inside', 
            formatter: '{b}\n{c}',
            color: '#e2e8f0',
            fontSize: 12,
            fontWeight: 'bold'
          },
          labelLine: { show: false },
          data: [
            { value: stats.activeTracks, name: 'Active Tracks', itemStyle: { color: '#14b8a6' } },
            { value: stats.pastTracks, name: 'Past Tracks', itemStyle: { color: '#06b6d4' } },
          ],
        },
      ],
    }
    : {};

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
        {/* Enhanced Animated Background - matching homepage */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-slate-700 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        </div>

        <div className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Profile Header Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-teal-500/30 hover:border-teal-400/60 transition-all duration-300">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-teal-500/30 border-4 border-slate-900/50">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="space-y-3">
                      <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                        {user.username}
                      </h1>
                      <p className="text-lg text-slate-300 font-light">{user.email}</p>
                      {user.role && (
                        <div className="inline-flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-full border border-teal-500/30">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                          </span>
                          <span className="text-sm font-semibold text-teal-300">
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="group relative px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="relative z-10">Give Feedback</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="group relative px-6 py-3 bg-slate-700/50 backdrop-blur-xl rounded-xl font-semibold border border-red-500/30 hover:border-red-500/60 shadow-lg hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="relative z-10 text-red-400">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            {stats && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="relative bg-slate-800/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-teal-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></span>
                      <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse animation-delay-150"></span>
                    </div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                      Tracking Overview
                    </h2>
                  </div>
                  <div className="bg-slate-900/40 rounded-2xl p-6 border border-teal-500/20">
                    <ReactECharts option={chartOption} style={{ height: 280 }} />
                  </div>
                </div>
              </div>
            )}

            {/* Products Table Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-teal-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse animation-delay-150"></span>
                  </div>
                  <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                    Your Tracked Products
                  </h2>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-700/40 border border-teal-500/30 mb-4">
                      <span className="text-4xl">📦</span>
                    </div>
                    <p className="text-slate-400 text-lg">No products tracked yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
                      <table className="min-w-full divide-y divide-slate-700/50">
                        <thead className="bg-slate-900/60 backdrop-blur-xl">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-teal-300 uppercase tracking-wider">
                              Product Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-teal-300 uppercase tracking-wider">
                              Current Price
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-teal-300 uppercase tracking-wider">
                              Original Price
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-teal-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                          {visibleProducts.map((product, idx) => (
                            <tr 
                              key={product._id} 
                              className="hover:bg-slate-700/30 transition-all duration-300 group"
                              style={{ animationDelay: `${idx * 50}ms` }}
                            >
                              <td className="px-6 py-4">
                                <a
                                  href={product.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-200 hover:text-teal-300 transition-colors font-medium max-w-md block truncate group-hover:underline"
                                  title={product.title}
                                >
                                  {product.title}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                  {product.currentPrice}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-400 line-through">
                                {product.originalPrice}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                                  product.isActive 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                                    : 'bg-red-500/20 text-red-300 border-red-500/50'
                                }`}>
                                  <span className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></span>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {(visibleCount < products.length || visibleCount > 10) && (
                      <div className="mt-6 flex justify-center gap-4">
                        {visibleCount < products.length && (
                          <button
                            onClick={handleShowMore}
                            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-500/20 transform hover:scale-105"
                          >
                            Show More Products
                          </button>
                        )}
                        {visibleCount > 10 && (
                          <button
                            onClick={handleShowLess}
                            className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-xl text-slate-100 rounded-xl font-semibold transition-all duration-300 border border-slate-600/50 hover:border-teal-500/50"
                          >
                            Show Less
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-slate-800/95 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-96 border border-red-500/30">
                <h3 className="text-2xl font-black text-slate-100 mb-3 bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">
                  Confirm Logout
                </h3>
                <p className="text-slate-300 mb-6 font-light">Are you sure you want to log out of your account?</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-xl text-slate-100 rounded-xl font-semibold transition-all duration-300 border border-slate-600/50 hover:border-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-slate-800/95 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl max-w-md w-full border border-teal-500/30">
                <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Share Your Feedback
                </h3>
                <textarea
                  className="w-full bg-slate-900/50 border border-teal-500/30 rounded-2xl p-4 mb-6 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-slate-100 placeholder-slate-500 transition-all backdrop-blur-xl"
                  placeholder="Tell us what you think..."
                  value={feedback?.message || ''}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-xl text-slate-100 rounded-xl font-semibold transition-all duration-300 border border-slate-600/50 hover:border-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFeedbackSubmit}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-500/30 transform hover:scale-105"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -80px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </>
  );
}