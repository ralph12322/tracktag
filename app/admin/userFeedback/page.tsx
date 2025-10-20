'use client';

import AdminSideBar from '@/components/AdminSideBar';
import { useEffect, useState } from 'react';

type Feedback = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export default function UserFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch('/api/admin/feedbackAdmin');
        const data = await res.json();
        setFeedbacks(data.data);
      } catch (error) {
        console.error('Failed to fetch feedbacks', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const todayCount = feedbacks.filter((fb) => {
    const today = new Date();
    const fbDate = new Date(fb.createdAt);
    return fbDate.toDateString() === today.toDateString();
  }).length;

  const thisWeekCount = feedbacks.filter((fb) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fbDate = new Date(fb.createdAt);
    return fbDate >= weekAgo;
  }).length;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-slate-700 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      </div>

      <div className="relative flex flex-col lg:flex-row gap-6 p-6">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-6 lg:self-start w-full lg:w-auto">
          <AdminSideBar />
        </div>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          {/* Header */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-teal-500/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">

              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                User Feedback
              </h1>
              <p className="text-slate-300 text-lg font-light">Customer insights and suggestions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: 'Total Feedback', 
                value: feedbacks.length, 
                gradient: 'from-teal-400 to-cyan-400',
                icon: '💬',
                accentColor: 'teal'
              },
              { 
                title: 'Today', 
                value: todayCount, 
                gradient: 'from-emerald-400 to-teal-400',
                icon: '📅',
                accentColor: 'emerald'
              },
              { 
                title: 'This Week', 
                value: thisWeekCount, 
                gradient: 'from-cyan-400 to-blue-400',
                icon: '📊',
                accentColor: 'cyan'
              },
            ].map((card, i) => (
              <div
                key={i}
                className="relative group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 p-6 border border-slate-700/50 hover:border-teal-500/50 transform hover:-translate-y-2">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{card.icon}</div>
                    <div className="flex gap-1">
                      <span className={`w-2 h-2 rounded-full bg-${card.accentColor}-400 animate-pulse`}></span>
                      <span className={`w-2 h-2 rounded-full bg-${card.accentColor}-400 animate-pulse animation-delay-150`}></span>
                    </div>
                  </div>
                  <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-3">
                    {card.title}
                  </h3>
                  <p className={`text-5xl font-black bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Feedback - Desktop Table View */}
          <div className="hidden md:block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                <h3 className="font-bold text-slate-100 text-xl">Recent 20 Feedback Submissions</h3>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/60 backdrop-blur-xl">
                    <tr>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Date</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Name</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Email</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Message</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                    {feedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                          No feedback found
                        </td>
                      </tr>
                    ) : (
                      feedbacks.slice(0, 20).map((fb, idx) => (
                        <tr
                          key={fb._id}
                          className="hover:bg-slate-700/30 transition-all duration-300 group cursor-pointer"
                          onClick={() => setSelectedFeedback(fb)}
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          <td className="p-4 whitespace-nowrap text-slate-300 font-medium">
                            {new Date(fb.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-medium text-slate-200">{fb.name}</td>
                          <td className="p-4 max-w-[200px]">
                            <div className="truncate text-slate-300">
                              {fb.email}
                            </div>
                          </td>
                          <td className="p-4 max-w-md">
                            <div className="truncate text-cyan-400 group-hover:text-cyan-300 transition-colors hover:underline">
                              {fb.message}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Feedback - Mobile Card View */}
          <div className="md:hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-10"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                <h3 className="font-bold text-slate-100 text-lg">Recent 20 Feedback Submissions</h3>
              </div>
              <div className="space-y-4">
                {feedbacks.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic border border-slate-700/50 rounded-2xl bg-slate-800/30">
                    No feedback found
                  </div>
                ) : (
                  feedbacks.slice(0, 20).map((fb, idx) => (
                    <div
                      key={fb._id}
                      className="bg-slate-700/30 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-4 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedFeedback(fb)}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="font-medium text-slate-200">{fb.name}</span>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Email</div>
                          <div className="text-sm text-slate-300 break-all">{fb.email}</div>
                        </div>

                        <div>
                          <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Message</div>
                          <div className="text-sm text-cyan-400 line-clamp-2">{fb.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="relative bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden border border-teal-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-20 pointer-events-none"></div>
            
            {/* Header */}
            <div className="relative flex justify-between items-start p-4 sm:p-6 border-b border-slate-700/50 bg-slate-900/40">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse animation-delay-150"></div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Feedback from {selectedFeedback.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-slate-400 hover:text-teal-300 text-3xl font-bold leading-none flex-shrink-0 transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            {/* Content */}
            <div className="relative p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)] sm:max-h-[calc(80vh-200px)]">
              <div>
                <label className="text-sm font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full"></span>
                  Email
                </label>
                <p className="text-slate-200 break-all bg-slate-900/40 rounded-xl p-3 border border-slate-700/50">
                  {selectedFeedback.email}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full"></span>
                  Message
                </label>
                <div className="text-slate-200 whitespace-pre-wrap bg-slate-900/40 rounded-xl p-4 border border-slate-700/50 leading-relaxed break-words">
                  {selectedFeedback.message}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="relative flex justify-end p-4 sm:p-6 border-t border-slate-700/50 bg-slate-900/40">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="relative group px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-teal-500/50 transform hover:-translate-y-0.5"
              >
                <span className="relative z-10">Close</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      )}

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
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}