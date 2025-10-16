'use client';

import AdminSideBar from '@/components/AdminSideBar';
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
        const res = await fetch('/api/admin/userLogs');
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch user logs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F1F5F9] gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6">
      {/* Sidebar */}
      <div className="lg:sticky lg:top-20 lg:self-start w-full lg:w-auto">
        <AdminSideBar />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="bg-white shadow rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
            Recent 20 Logs by Users
          </h2>

          {/* Desktop Table View */}
          <div className="hidden md:block max-h-[700px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-100 text-left sticky top-0">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Username</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-gray-500 italic"
                    >
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 20).map((log) => (
                    <tr
                      key={log._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-2 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2">{log.email}</td>
                      <td className="p-2 font-medium text-gray-700">
                        {log.username}
                      </td>
                      <td className="p-2 font-medium text-blue-600">
                        {log.action}
                      </td>
                      <td
                        className={`p-2 font-medium ${log.status === 'SUCCESS'
                          ? 'text-green-600'
                          : 'text-red-600'
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

          {/* Mobile Card View */}
          <div className="md:hidden max-h-[700px] overflow-y-auto space-y-3">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 italic border border-gray-200 rounded-lg">
                No logs found
              </div>
            ) : (
              logs.slice(0, 20).map((log) => (
                <div
                  key={log._id}
                  className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          log.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Username</div>
                      <div className="font-medium text-gray-700">{log.username}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <div className="text-sm text-gray-600 break-all">{log.email}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Action</div>
                      <div className="text-sm font-medium text-blue-600">{log.action}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}