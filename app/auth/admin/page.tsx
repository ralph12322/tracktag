'use client';

import { Package, Trophy, CheckSquare } from "lucide-react";
import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import AdminSideBar from '@/components/AdminSideBar';

type Product = {
  _id: string;
  title: string;
  platform: string;
  currentPrice: number;
  discount: string;
  createdAt: string;
  isActive: Boolean;
  user?: {
    _id: string;
    username: string;
  };
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const totalTracked = products.length;
  const activeTracking = products.filter((p) => p.isActive === true).length;

  const platformCount = products.reduce((acc: any, product: any) => {
    acc[product.platform] = (acc[product.platform] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(platformCount).map(([name, value]) => ({
    name,
    value,
  }));

  const monthPlatformMap: { [month: string]: { lazada: number; amazon: number } } = {};
  products.forEach((p) => {
    const date = new Date(p.createdAt);
    const month = date.toLocaleString('default', { month: 'short' });
    if (!monthPlatformMap[month]) {
      monthPlatformMap[month] = { lazada: 0, amazon: 0 };
    }
    if (p.platform.toLowerCase() === 'lazada') monthPlatformMap[month].lazada++;
    else if (p.platform.toLowerCase() === 'amazon') monthPlatformMap[month].amazon++;
  });

  const barData = Object.entries(monthPlatformMap).map(([month, value]) => ({
    month,
    ...value,
  }));

  const formatPrice = (price: number | string, platform: string) => {
    if (!price) return "N/A";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "N/A";
    const symbol = platform.toLowerCase() === "amazon" ? "$" : "₱";
    return `${symbol}${numPrice.toFixed(2)}`;
  };

  const topPlatform =
    (Object.entries(platformCount) as [string, number][])
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

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

  // ECharts Options with dark theme styling
  const pieOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e293b',
      borderColor: 'rgba(20, 184, 166, 0.3)',
      textStyle: { color: '#e2e8f0' }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: '#cbd5e1', fontSize: 12 }
    },
    series: [
      {
        name: 'Platform Distribution',
        type: 'pie',
        radius: ['45%', '75%'],
        data: pieData,
        animationDuration: 1200,
        animationEasing: 'cubicOut',
        label: {
          show: true,
          formatter: '{b}: {c}',
          fontSize: 12,
          color: '#e2e8f0'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(20, 184, 166, 0.5)',
          },
          scale: true,
          scaleSize: 8
        },
      },
    ],
    color: ['#14b8a6', '#06b6d4', '#10b981', '#8b5cf6', '#f97316']
  };

  const barOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: 'rgba(20, 184, 166, 0.3)',
      textStyle: { color: '#e2e8f0' }
    },
    legend: {
      data: ['Lazada', 'Amazon'],
      textStyle: { color: '#cbd5e1', fontSize: 12 }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: barData.map((d) => d.month),
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#334155' } }
    },
    series: [
      {
        name: 'Lazada',
        type: 'bar',
        data: barData.map((d) => d.lazada),
        itemStyle: {
          color: '#14b8a6',
          borderRadius: [6, 6, 0, 0]
        },
        animationDuration: 1000,
        barMaxWidth: 40
      },
      {
        name: 'Amazon',
        type: 'bar',
        data: barData.map((d) => d.amazon),
        itemStyle: {
          color: '#06b6d4',
          borderRadius: [6, 6, 0, 0]
        },
        animationDuration: 1000,
        barMaxWidth: 40
      },
    ],
  };

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
                Admin Dashboard
              </h1>
              <p className="text-slate-300 text-lg font-light">Analytics overview and platform tracking</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Total Tracked Products',
                value: totalTracked,
                gradient: 'from-teal-400 to-cyan-400',
                icon: <Package className="w-8 h-8 text-cyan-400" />,
                accentColor: 'teal'
              },
              {
                title: 'Active Tracking',
                value: activeTracking,
                gradient: 'from-emerald-400 to-teal-400',
                icon: <CheckSquare className="w-8 h-8 text-green-400" />  ,
                accentColor: 'emerald'
              },
              {
                title: 'Top Platform',
                value: topPlatform,
                gradient: 'from-cyan-400 to-blue-400',
                icon: <Trophy className="w-8 h-8 text-yellow-400" />,
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
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse animation-delay-150"></span>
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-6 hover:border-teal-400/60 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-10 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full"></div>
                  <h3 className="font-bold text-slate-100 text-xl">
                    Platform Distribution
                  </h3>
                </div>
                <div className="bg-slate-900/40 rounded-2xl p-4 border border-teal-500/20">
                  <ReactECharts option={pieOption} style={{ height: '320px', width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-6 hover:border-teal-400/60 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-10 bg-gradient-to-b from-cyan-400 to-teal-400 rounded-full"></div>
                  <h3 className="font-bold text-slate-100 text-xl">
                    Active Tracking Logs by Month
                  </h3>
                </div>
                <div className="bg-slate-900/40 rounded-2xl p-4 border border-teal-500/20">
                  <ReactECharts option={barOption} style={{ height: '320px', width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Logs - Desktop Table View */}
          <div className="hidden md:block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                <h3 className="font-bold text-slate-100 text-xl">Recent Logs</h3>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/60 backdrop-blur-xl">
                    <tr>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Date</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Product</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Platform</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Price</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">User</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                    {products.slice(0, 5).map((p, idx) => (
                      <tr
                        key={p._id}
                        className="hover:bg-slate-700/30 transition-all duration-300 group"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="p-4 whitespace-nowrap text-slate-300 font-medium">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 max-w-[300px]">
                          <div className="truncate font-medium text-slate-200 group-hover:text-teal-300 transition-colors">
                            {p.title}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${p.platform.toLowerCase() === 'lazada'
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            }`}>
                            {p.platform}
                          </span>
                        </td>
                        <td className="p-4 font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent text-base">
                          {formatPrice(p.currentPrice, p.platform)}
                        </td>
                        <td className="p-4 text-slate-300 font-medium">{p.user?.username || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Logs - Mobile Card View */}
          <div className="md:hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-10"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                <h3 className="font-bold text-slate-100 text-lg">Recent Logs</h3>
              </div>
              <div className="space-y-4">
                {products.slice(0, 5).map((p, idx) => (
                  <div
                    key={p._id}
                    className="bg-slate-700/30 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-4 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${p.platform.toLowerCase() === 'lazada'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        }`}>
                        {p.platform}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Product</div>
                        <div className="font-medium text-slate-200 text-sm line-clamp-2">{p.title}</div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-600/50">
                        <div>
                          <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Price</div>
                          <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            {formatPrice(p.currentPrice, p.platform)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">User</div>
                          <div className="text-sm text-slate-200 font-medium">{p.user?.username || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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