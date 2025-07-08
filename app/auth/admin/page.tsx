'use client';

import { useEffect } from "react";
import Chart from "chart.js/auto";

export default function AdminPage() {
  useEffect(() => {
    // Pie Chart
    const pieCtx = document.getElementById("platformPieChart") as HTMLCanvasElement | null;
    const barCtx = document.getElementById("trackingBarChart") as HTMLCanvasElement | null;

    let pieChart: Chart | undefined;
    let barChart: Chart | undefined;

    if (pieCtx) {
      pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
          labels: ["Lazada", "Amazon"],
          datasets: [{
            label: "Platforms",
            data: [55, 45],
            backgroundColor: ["#f97316", "#3b82f6"]
          }]
        }
      });
    }

    if (barCtx) {
      barChart = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: ["June", "July", "August"],
          datasets: [{
            label: "Active Tracking Logs",
            data: [10, 20, 15],
            backgroundColor: "#3b82f6"
          }]
        }
      });
    }

    return () => {
      pieChart?.destroy();
      barChart?.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-6 border-r">
          <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
          <ul className="space-y-2">
            <li><a className="text-blue-600 font-semibold" href="#">Home</a></li>
            <li><a href="#">Product Tracking Logs</a></li>
            <li><a href="#">Sentiment Analysis Logs</a></li>
            <li><a href="#">Discount Alert Logs</a></li>
            <li><a href="#">Authentication & Access</a></li>
            <li><a href="#">User Feedback</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">Total Tracked Products</h3>
              <p className="text-2xl font-bold">##</p>
            </div>
            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">Active Tracking</h3>
              <p className="text-2xl font-bold">#</p>
            </div>
            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">Top Platform</h3>
              <p className="text-2xl font-bold">Platform</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 shadow rounded">
              <canvas id="platformPieChart" width="400" height="300" />
            </div>
            <div className="bg-white p-4 shadow rounded">
              <canvas id="trackingBarChart" width="400" height="300" />
            </div>
          </div>

          {/* Log Table */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold mb-4">Recent Logs (sample)</h3>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Platform</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
