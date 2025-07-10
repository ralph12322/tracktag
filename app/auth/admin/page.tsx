'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

type ProductPriceData = {
  name: string;
  high: number;
  low: number;
};

type PlatformPriceData = {
  platform: string;
  itemCount: number;
};

type UserLog = {
  id: number;
  username: string;
  action: string;
  timestamp: string;
};

// Price fluctuation over time
const priceData: ProductPriceData[] = [
  { name: 'Jul 01', high: 999, low: 899 },
  { name: 'Jul 02', high: 979, low: 850 },
  { name: 'Jul 03', high: 930, low: 870 },
  { name: 'Jul 04', high: 940, low: 860 },
  { name: 'Jul 05', high: 910, low: 800 },
];

// Avg price and product count comparison
const platformData: PlatformPriceData[] = [
  { platform: 'Amazon', itemCount: 120 },
  { platform: 'Lazada', itemCount: 150 },
];

// Activity logs
const userLogs: UserLog[] = [
  { id: 1, username: 'ralph', action: 'Scraped Amazon product', timestamp: '2025-07-10 09:12' },
  { id: 2, username: 'geo', action: 'Scraped Lazada product', timestamp: '2025-07-10 09:35' },
  { id: 3, username: 'ralph', action: 'Checked product analytics', timestamp: '2025-07-10 10:15' },
];

export default function AdminPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">👑 Admin Dashboard</h1>

      {/* Line Chart */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">📈 Price Fluctuations</h2>
        <p className="text-sm text-gray-500 mb-4">High and low prices over time</p>
        <div className="w-full h-64 bg-white p-4 rounded-lg shadow-md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="high" stroke="#f87171" name="High Price" />
              <Line type="monotone" dataKey="low" stroke="#60a5fa" name="Low Price" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Bar Chart */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">🏷️ Platform Price Comparison</h2>
        <p className="text-sm text-gray-500 mb-4">Average product prices from Amazon and Lazada</p>
        <div className="w-full h-64 bg-white p-4 rounded-lg shadow-md">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="itemCount" fill="#818cf8" name="Scraped Products" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logs */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">📋 User Activity Logs</h2>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 border-b font-medium text-gray-600">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {userLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{log.username}</td>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
