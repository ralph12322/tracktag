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
        const res = await fetch('/api/admin/feedback');
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

      {/* Main content */}
      <main className="flex-1">
        <div className="bg-white shadow rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
            Recent 20 Feedback Submissions
          </h2>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No feedback found
                    </td>
                  </tr>
                ) : (
                  feedbacks.slice(0, 20).map((fb) => (
                    <tr
                      key={fb._id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedFeedback(fb)}
                    >
                      <td className="p-2 whitespace-nowrap">{new Date(fb.createdAt).toLocaleString()}</td>
                      <td className="p-2 font-medium">{fb.name}</td>
                      <td className="p-2">{fb.email}</td>
                      <td className="p-2 max-w-sm truncate text-blue-600 hover:underline">
                        {fb.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {feedbacks.length === 0 ? (
              <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                No feedback found
              </div>
            ) : (
              feedbacks.slice(0, 20).map((fb) => (
                <div
                  key={fb._id}
                  className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedFeedback(fb)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-gray-700">{fb.name}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 break-all">
                      {fb.email}
                    </div>

                    <div className="text-sm text-blue-600 line-clamp-2">
                      {fb.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-4 sm:p-6 border-b">
              <div className="flex-1 pr-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Feedback from {selectedFeedback.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Email:</label>
                <p className="text-gray-800 break-all">{selectedFeedback.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Message:</label>
                <p className="text-gray-800 whitespace-pre-wrap mt-2">{selectedFeedback.message}</p>
              </div>
            </div>
            <div className="flex justify-end p-4 sm:p-6 border-t">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
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