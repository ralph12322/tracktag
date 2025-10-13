'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

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
  const activeTracking = products.filter(p => p.discount !== '').length;

  const platformCount = products.reduce((acc: any, product: any) => {
    acc[product.platform] = (acc[product.platform] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(platformCount).map(([name, value]) => ({ name, value }));

  const monthPlatformMap: { [month: string]: { lazada: number; amazon: number } } = {};
  products.forEach(p => {
    const date = new Date(p.createdAt);
    const month = date.toLocaleString('default', { month: 'short' });

    if (!monthPlatformMap[month]) {
      monthPlatformMap[month] = { lazada: 0, amazon: 0 };
    }

    if (p.platform.toLowerCase() === 'lazada') {
      monthPlatformMap[month].lazada++;
    } else if (p.platform.toLowerCase() === 'amazon') {
      monthPlatformMap[month].amazon++;
    }
  });

  const barData = Object.entries(monthPlatformMap).map(([month, value]) => ({
    month,
    ...value
  }));

  const topPlatform = (Object.entries(platformCount) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#F1F5F9]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
        <div className="relative w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
          Loading...
        </div>
      </div>
    </div>
  );

  // ✅ ECharts Options with animations
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: 0 },
    series: [
      {
        name: 'Platform Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        data: pieData,
        animationDuration: 1200,
        animationEasing: 'cubicOut',
        animationType: 'scale',
        label: { show: true, formatter: '{b}: {c}' },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const barOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Lazada', 'Amazon'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: barData.map(d => d.month) },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Lazada',
        type: 'bar',
        data: barData.map(d => d.lazada),
        itemStyle: { color: '#f97316' },
        animationDuration: 1000,
        animationEasing: 'elasticOut'
      },
      {
        name: 'Amazon',
        type: 'bar',
        data: barData.map(d => d.amazon),
        itemStyle: { color: '#3b82f6' },
        animationDuration: 1000,
        animationEasing: 'elasticOut'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white p-4 md:p-6 border shadow-md rounded-lg mb-6 md:mb-0 md:mr-7">
          <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
          <ul className="space-y-2 text-sm md:text-base">
            <li><Link href="/admin/userLogs" className="text-blue-600 hover:underline">User Logs</Link></li>
            <li><Link href="/admin/productTrackingLogs" className="text-blue-600 hover:underline">Product Tracking Logs</Link></li>
            <li><Link href="/admin/discountAlertLogs" className="text-blue-600 hover:underline">Discount Alert Logs</Link></li>
            <li><Link href="/admin/userFeedback" className="text-blue-600 hover:underline">User Feedback</Link></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col justify-center items-center bg-white p-4 shadow rounded text-center">
              <h3 className="font-semibold mb-2">Total Tracked Products</h3>
              <p className="text-2xl font-bold">{totalTracked}</p>
            </div>
            <div className="flex flex-col justify-center items-center bg-white p-4 shadow rounded text-center">
              <h3 className="font-semibold mb-2">Active Tracking</h3>
              <p className="text-2xl font-bold">{activeTracking}</p>
            </div>
            <div className="flex flex-col justify-center items-center bg-white p-4 shadow rounded text-center">
              <h3 className="font-semibold mb-2">Top Platform</h3>
              <p className="text-2xl font-bold">{topPlatform}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2 text-center md:text-left">Platform Distribution</h3>
              <ReactECharts option={pieOption} style={{ height: '300px', width: '100%' }} />
            </div>

            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2 text-center md:text-left">Active Tracking Logs by Month</h3>
              <ReactECharts option={barOption} style={{ height: '300px', width: '100%' }} />
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white p-4 shadow rounded overflow-x-auto">
            <h3 className="font-semibold mb-4">Recent Logs</h3>
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Platform</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">User</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((p: any) => (
                  <tr key={p._id} className="border-b">
                    <td className="p-2 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 truncate max-w-[200px]">{p.title}</td>
                    <td className="p-2">{p.platform}</td>
                    <td className="p-2">{p.currentPrice}</td>
                    <td className="p-2">{p.user?.username || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
