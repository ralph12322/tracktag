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
  const [feedback, setFeedback] = useState('');
  const [visibleCount, setVisibleCount] = useState(10); // For "Load More" functionality

  // Fetch user & stats
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

  // Fetch products
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
    setVisibleCount((prev) => prev + 5); // show 5 more on each click
  };

  const handleShowLess = () => {
    setVisibleCount(10); // reset to initial count
  }

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
    if (!feedback.trim()) return toast.error('Feedback cannot be empty!');
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      toast.success('Thank you for your feedback!');
      setFeedback('');
      setShowFeedback(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback.');
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#F1F5F9]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
          <div className="relative w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
            Loading...
          </div>
        </div>
      </div>
    );

  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!user) return null;

  const chartOption = stats
    ? {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: 'Tracking Stats',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, position: 'inside', formatter: '{b}\n{c}' },
          labelLine: { show: false },
          data: [
            { value: stats.activeTracks, name: 'Active Tracks' },
            { value: stats.pastTracks, name: 'Past Tracks' },
          ],
        },
      ],
    }
    : {};

  return (
    <>
      <div className="bg-gray-100 min-h-screen py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white shadow-lg rounded-2xl p-8 transform transition duration-300">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.username}!</h2>
                <p className="text-gray-500">{user.email}</p>
                {user.role && (
                  <span
                    className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${user.role.toLowerCase() === 'user'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-300 text-yellow-900'
                      }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Tracking Overview</h3>
                <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
                  <ReactECharts option={chartOption} style={{ height: 260 }} />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button
                onClick={() => setShowFeedback(true)}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-full font-medium shadow-md transition transform hover:-translate-y-1"
              >
                Give Us Feedback
              </button>

              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full font-medium shadow-md transition transform hover:-translate-y-1"
              >
                Logout
              </button>
            </div>

            <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Your Tracked Products
              </h3>

              {products.length === 0 ? (
                <p className="text-gray-500">No products tracked yet.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Original Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {visibleProducts.map((product) => (
                          <tr key={product._id}>
                            <td className="px-4 py-3 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                              <a
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                                title={product.title}
                              >
                                {product.title}
                              </a>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                              {product.currentPrice}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                              {product.originalPrice}
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                              {product.isActive ? 'Active' : 'Inactive'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {(visibleCount < products.length || visibleCount > 10) && (
                    <div className="mt-4 flex justify-center gap-4">
                      {visibleCount < products.length && (
                        <button
                          onClick={handleShowMore}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Show More
                        </button>
                      )}
                      {visibleCount > 10 && (
                        <button
                          onClick={handleShowLess}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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

        {/* Logout Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
              <h3 className="text-xl font-bold mb-3">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-3">Give Us Feedback</h3>
              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 mb-4 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
