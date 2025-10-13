'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type UserLog = {
  _id: string;
  email: string;
  username: string;
  action: 'LOGIN' | 'SIGNUP';
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
};

export default function UserLogsPage() {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/userLogs'); // Adjust API route if needed
        const data = await res.json();
        setLogs(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user logs', error);
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);
  
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
      <div className="flex md:flex-row gap-6">
        <aside className="w-64 bg-white p-6 border shadow-md rounded-lg mr-12">
          <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/auth/admin" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/admin/discountAlertLogs" className="text-blue-600 hover:underline">
                Discount Alert Logs
              </Link>
            </li>
            <li>
              <Link href="/admin/userFeedback" className="text-blue-600 hover:underline">
                User Feedback
              </Link>
            </li>
          </ul>
        </aside>

        <div className="w-full bg-white shadow-md rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent 20 logs by users:
          </h2>

          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Email</th>
                <th className="p-2">Username</th>
                <th className="p-2">Action</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.slice(0, 20).map((log) => (
                  <tr key={log._id} className="border-b">
                    <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-2">{log.email}</td>
                    <td className="p-2">{log.username}</td>
                    <td className="p-2 font-medium text-blue-600">{log.action}</td>
                    <td
                      className={`p-2 font-medium ${log.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {log.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
