'use client';

import Link from 'next/link';
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
        const res = await fetch('/api/admin/feedback', { method: 'GET' });
        const data = await res.json();
        setFeedbacks(data.data);
      } catch (error) {
        console.error('Failed to fetch user feedback', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const refreshFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', { method: 'GET' });
      const data = await res.json();
      setFeedbacks(data.data);
    } catch (error) {
      console.error('Failed to refresh feedbacks', error);
    }
    setLoading(false);
  };

  const closeModal = () => setSelectedFeedback(null);

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-6 border shadow-md rounded-lg mr-12">
          <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
          <ul className="space-y-2">
            <li><Link href="/auth/admin" className="text-blue-600 hover:underline">Admin Home</Link></li>
            <li><Link href="/admin/userLogs" className="text-blue-600 hover:underline">User Logs</Link></li>
            <li><Link href="/admin/productTrackingLogs" className="text-blue-600 hover:underline">Product Tracking Logs</Link></li>
            <li><Link href="/admin/discountAlertLogs" className="text-blue-600 hover:underline">Discount Alert Logs</Link></li>
            <li><Link href="/admin/userFeedback" className="text-blue-600 hover:underline">User Feedback</Link></li>
          </ul>
        </aside>

        {/* Feedback Table */}
        <div className="w-full bg-white shadow-md rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent 20 Feedback Submissions:
          </h2>

          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No feedback found
                  </td>
                </tr>
              ) : (
                feedbacks
                  .slice(0, 20)
                  .map((fb) => (
                    <tr key={fb._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(fb.createdAt).toLocaleString()}</td>
                      <td className="p-2 font-medium">{fb.name}</td>
                      <td className="p-2">{fb.email}</td>
                      <td 
                        className="p-2 max-w-sm truncate cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={() => setSelectedFeedback(fb)}
                        title="Click to view full message"
                      >
                        {fb.message}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          
          <button
            onClick={refreshFeedbacks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedFeedback && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Feedback from {selectedFeedback.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Email:</label>
                <p className="text-gray-800">{selectedFeedback.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Message:</label>
                <p className="text-gray-800 whitespace-pre-wrap break-words mt-2">{selectedFeedback.message}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}