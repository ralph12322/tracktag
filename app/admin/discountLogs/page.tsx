'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminSideBar from '@/components/AdminSideBar';

type DiscountLog = {
  _id: string;
  productTitle: string;
  platform: string;
  previousPrice: number;
  currentPrice: number;
  discountPercent: number;
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
};

export default function DiscountLogsPage() {
  const [logs, setLogs] = useState<DiscountLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/discountLogs');
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch discount logs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const avgDiscount =
    logs.length > 0
      ? (logs.reduce((sum, log) => sum + log.discountPercent, 0) / logs.length).toFixed(2)
      : 0;

  const topDiscount =
    logs.length > 0 ? Math.max(...logs.map((log) => log.discountPercent)) : 0;

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
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-teal-700 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-teal-500/20 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Alerts</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="relative flex flex-col lg:flex-row gap-0 lg:gap-6 p-0 lg:p-6">
       
        <AdminSideBar/>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-0 w-full">
          {/* Header */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-teal-600 rounded-2xl sm:rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-emerald-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                Discount Alert Logs
              </h1>
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-light">
                Track and analyze triggered discount alerts from Amazon and Lazada
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[
              { title: 'Total Alerts', value: logs.length, gradient: 'from-teal-400 to-cyan-400', icon: '📢' },
              { title: 'Top Discount', value: `${topDiscount}%`, gradient: 'from-emerald-400 to-teal-400', icon: '🔥' },
              { title: 'Average Discount', value: `${avgDiscount}%`, gradient: 'from-blue-400 to-cyan-400', icon: '💸' },
            ].map((card, i) => (
              <div key={i} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 p-4 sm:p-6 border border-slate-700/50 hover:border-emerald-500/50 transform hover:-translate-y-1 sm:hover:-translate-y-2">
                  <div className="mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl">{card.icon}</div>
                  </div>
                  <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-2 sm:mb-3">
                    {card.title}
                  </h3>
                  <p className={`text-2xl sm:text-4xl font-black bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Logs Table - Desktop */}
          <div className="hidden md:block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                <h3 className="font-bold text-slate-100 text-xl">Recent Discount Alerts</h3>
              </div>
              <div className="max-h-[700px] overflow-y-auto rounded-2xl border border-slate-700/50">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/60 backdrop-blur-xl sticky top-0">
                    <tr>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Date</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Product</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Platform</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Discount</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Price Drop</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                          No discount alerts found
                        </td>
                      </tr>
                    ) : (
                      logs.slice(0, 20).map((log) => (
                        <tr key={log._id} className="hover:bg-slate-700/30 transition-all duration-300 group">
                          <td className="p-4 whitespace-nowrap text-slate-300 font-medium text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 max-w-xs truncate text-slate-200 group-hover:text-emerald-300 transition-colors text-sm">
                            {log.productTitle}
                          </td>
                          <td className="p-4 font-medium text-slate-200 text-sm">{log.platform}</td>
                          <td className="p-4 text-emerald-300 font-semibold text-sm">{log.discountPercent}%</td>
                          <td className="p-4 text-slate-400 text-sm">
                            ₱{log.previousPrice.toFixed(2)} → ₱{log.currentPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Logs Cards - Mobile & Tablet */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
              <h3 className="font-bold text-slate-100 text-lg">Recent Alerts</h3>
            </div>
            {logs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 italic bg-slate-800/20 rounded-2xl border border-slate-700/50">
                No discount alerts found
              </div>
            ) : (
              logs.slice(0, 20).map((log) => (
                <div key={log._id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-100 text-sm line-clamp-2 mb-1">
                          {log.productTitle}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-300 font-bold text-xl">{log.discountPercent}%</p>
                        <p className="text-xs text-slate-400 font-medium">{log.platform}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-700/30 pt-3">
                      <p className="text-xs text-slate-400 mb-2">Price Drop</p>
                      <p className="text-sm text-slate-300">
                        <span className="text-slate-400">₱{log.previousPrice.toFixed(2)}</span>
                        <span className="text-slate-500 mx-2">→</span>
                        <span className="text-emerald-300 font-semibold">₱{log.currentPrice.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
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
      `}</style>
    </div>
  );
}