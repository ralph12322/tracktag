'use client';

import AdminSideBar from '@/components/AdminSideBar';
import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Shield, Mail, Calendar } from "lucide-react";

type User = {
  _id: string;
  email: string;
  username: string;
  role: 'User' | 'Admin';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
};

export default function AllUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Adjust to your token storage key
        const res = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const response = await res.json();
        
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          console.error('Failed to fetch users:', response.message);
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const verifiedUsers = users.filter((user) => user.isVerified).length;
  const adminUsers = users.filter((user) => user.role === 'Admin').length;
  const recentUsers = users.filter((user) => {
    const createdDate = new Date(user.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate >= weekAgo;
  }).length;

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
              <h1 className="text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                All Users
              </h1>
              <p className="text-slate-300 text-lg font-light">Manage and monitor all registered users</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'Total Users', 
                value: totalUsers, 
                gradient: 'from-cyan-400 to-cyan-200',
                icon: <Users className="w-10 h-10 text-cyan-400" />,
                accentColor: 'teal'
              },
              { 
                title: 'Verified Users', 
                value: verifiedUsers, 
                gradient: 'from-green-400 to-teal-400',
                icon: <UserCheck className="w-10 h-10 text-green-400" />,
                accentColor: 'emerald'
              },
              { 
                title: 'Administrators', 
                value: adminUsers, 
                gradient: 'from-purple-400 to-pink-400',
                icon: <Shield className="w-10 h-10 text-purple-400" />,
                accentColor: 'purple'
              },
              { 
                title: 'New This Week', 
                value: recentUsers, 
                gradient: 'from-yellow-400 to-orange-400',
                icon: <Calendar className="w-10 h-10 text-yellow-400" />,
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
                    <div className="text-4xl">{card.icon}</div>
                    <div className="flex gap-1">
                      <span className={`w-2 h-2 rounded-full bg-teal-400 animate-pulse`}></span>
                      <span className={`w-2 h-2 rounded-full bg-teal-400 animate-pulse animation-delay-150`}></span>
                    </div>
                  </div>
                  <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-3">
                    {card.title}
                  </h3>
                  <p className={`text-4xl font-black bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Users Table - Desktop View */}
          <div className="hidden md:block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                <h3 className="font-bold text-slate-100 text-xl">Registered Users</h3>
              </div>
              <div className="max-h-[700px] overflow-y-auto rounded-2xl border border-slate-700/50">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/60 backdrop-blur-xl sticky top-0">
                    <tr>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Username</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Email</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Role</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Status</th>
                      <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user, idx) => (
                        <tr
                          key={user._id}
                          className="hover:bg-slate-700/30 transition-all duration-300 group"
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          <td className="p-4 font-medium text-slate-200">{user.username}</td>
                          <td className="p-4 max-w-[250px]">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="truncate text-slate-200 group-hover:text-teal-300 transition-colors">
                                {user.email}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                              user.role === 'Admin' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                              user.isVerified
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            }`}>
                              {user.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap text-slate-300 font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Users Cards - Mobile View */}
          <div className="md:hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-10"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                <h3 className="font-bold text-slate-100 text-lg">Registered Users</h3>
              </div>
              <div className="max-h-[700px] overflow-y-auto space-y-4">
                {users.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic border border-slate-700/50 rounded-2xl bg-slate-800/30">
                    No users found
                  </div>
                ) : (
                  users.map((user, idx) => (
                    <div
                      key={user._id}
                      className="bg-slate-700/30 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-4 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          user.isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          user.role === 'Admin' 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Username</div>
                          <div className="font-medium text-slate-200 text-sm">{user.username}</div>
                        </div>

                        <div>
                          <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Email</div>
                          <div className="text-sm text-slate-300 break-all flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {user.email}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-600/50 grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Joined</div>
                            <div className="text-sm text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}