'use client';

import Link from 'next/link';
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
  const activeTracking = products.filter((p) => p.discount !== '').length;

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

  const topPlatform =
    (Object.entries(platformCount) as [string, number][])
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-ping opacity-75"></div>
          <div className="relative w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            Loading
          </div>
        </div>
      </div>
    );

  // ECharts Options with modern styling
  const pieOption = {
    tooltip: { 
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: { 
      orient: 'horizontal', 
      bottom: 0,
      textStyle: { fontSize: 12 }
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
          fontSize: 12
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
          scale: true,
          scaleSize: 8
        },
      },
    ],
    color: ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444']
  };

  const barOption = {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: { 
      data: ['Lazada', 'Amazon'],
      textStyle: { fontSize: 12 }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: barData.map((d) => d.month),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: { 
      type: 'value',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [
      {
        name: 'Lazada',
        type: 'bar',
        data: barData.map((d) => d.lazada),
        itemStyle: { 
          color: '#f97316',
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
          color: '#3b82f6',
          borderRadius: [6, 6, 0, 0]
        },
        animationDuration: 1000,
        barMaxWidth: 40
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-white to-purple-50 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6">
      {/* Sidebar */}
      <div className="lg:sticky lg:top-20 lg:self-start w-full lg:w-auto">
        <AdminSideBar />
      </div>

      {/* Main Content */}
      <main className="flex-1 space-y-6 sm:space-y-8">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100 text-sm sm:text-base opacity-90">Analytics overview and platform tracking</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { 
              title: 'Total Tracked Products', 
              value: totalTracked, 
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100',
              icon: '📦'
            },
            { 
              title: 'Active Tracking', 
              value: activeTracking, 
              gradient: 'from-green-500 to-green-600',
              bgGradient: 'from-green-50 to-green-100',
              icon: '✅'
            },
            { 
              title: 'Top Platform', 
              value: topPlatform, 
              gradient: 'from-orange-500 to-orange-600',
              bgGradient: 'from-orange-50 to-orange-100',
              icon: '🏆'
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.bgGradient} rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{card.icon}</span>
                </div>
                <h3 className="text-gray-600 font-medium text-sm uppercase tracking-wide mb-2">{card.title}</h3>
                <p className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                Platform Distribution
              </h3>
            </div>
            <ReactECharts option={pieOption} style={{ height: '320px', width: '100%' }} />
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-blue-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                Active Tracking Logs by Month
              </h3>
            </div>
            <ReactECharts option={barOption} style={{ height: '320px', width: '100%' }} />
          </div>
        </div>

        {/* Recent Logs - Desktop Table View */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 hidden md:block">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
            <h3 className="font-semibold text-gray-800 text-lg">Recent Logs</h3>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">Date</th>
                  <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">Product</th>
                  <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">Platform</th>
                  <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">Price</th>
                  <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.slice(0, 5).map((p, idx) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                  >
                    <td className="p-4 whitespace-nowrap text-gray-600">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 max-w-[250px]">
                      <div className="truncate font-medium text-gray-800">{p.title}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        p.platform.toLowerCase() === 'lazada' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {p.platform}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-green-600 text-base">${typeof p.currentPrice === 'number' ? p.currentPrice.toFixed(2) : p.currentPrice}</td>
                    <td className="p-4 text-gray-600">{p.user?.username || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Logs - Mobile Card View */}
        <div className="md:hidden bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
            <h3 className="font-semibold text-gray-800 text-base">Recent Logs</h3>
          </div>
          <div className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <div
                key={p._id}
                className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    p.platform.toLowerCase() === 'lazada' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.platform}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Product</div>
                    <div className="font-medium text-gray-800 text-sm line-clamp-2">{p.title}</div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Price</div>
                      <div className="text-xl font-bold text-green-600">${typeof p.currentPrice === 'number' ? p.currentPrice.toFixed(2) : p.currentPrice}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">User</div>
                      <div className="text-sm text-gray-700 font-medium">{p.user?.username || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}