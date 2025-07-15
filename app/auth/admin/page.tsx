'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#f97316', '#3b82f6'];

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
    )

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-6 border shadow-md rounded-lg mr-7">
          <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/admin/userLogs" className="text-blue-600 hover:underline">
                User Logs
              </Link>
            </li>
            <li>
              <Link href="/admin/productTrackingLogs" className="text-blue-600 hover:underline">
                Product Tracking Logs
              </Link>
            </li>
            <li>
              <Link href="/admin/sentimentAnalysisLogs" className="text-blue-600 hover:underline">
                Sentiment Analysis Logs
              </Link>
            </li>
            <li>
              <Link href="/admin/discountAlertLogs" className="text-blue-600 hover:underline">
                Discount Alert Logs
              </Link>
            </li>
            <li>
              <Link href="/admin/authenticationAccess" className="text-blue-600 hover:underline">
                Authentication & Access
              </Link>
            </li>
            <li>
              <Link href="/admin/userFeedback" className="text-blue-600 hover:underline">
                User Feedback
              </Link>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className=" flex flex-col justify-center items-center bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">Total Tracked Products</h3>
              <p className="text-2xl font-bold">{totalTracked}</p>
            </div>
            <div className=" flex flex-col justify-center items-center bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">Active Tracking</h3>
              <p className="text-2xl font-bold">{activeTracking}</p>
            </div>
            <div className=" flex flex-col justify-center items-center bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">Top Platform</h3>
              <p className="text-2xl font-bold">{topPlatform}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">Platform Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">Active Tracking Logs by Month</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lazada" fill="#f97316" name="Lazada" />
                  <Bar dataKey="amazon" fill="#3b82f6" name="Amazon" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold mb-4">Recent Logs</h3>
            <table className="w-full table-auto">
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
                    <td className="p-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 truncate max-w-[250px]">{p.title}</td>
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
