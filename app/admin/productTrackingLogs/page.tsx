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

    const successCount = logs.filter((log) => log.status === 'SUCCESS').length;
    const failedCount = logs.filter((log) => log.status === 'FAILED').length;
    const loginCount = logs.filter((log) => log.action === 'LOGIN').length;
    const signupCount = logs.filter((log) => log.action === 'SIGNUP').length;

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
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></span>
                                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse animation-delay-150"></span>
                                    <span className="w-3 h-3 rounded-full bg-slate-400 animate-pulse animation-delay-300"></span>
                                </div>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                User Activity Logs
                            </h1>
                            <p className="text-slate-300 text-lg font-light">Monitor user authentication and system access</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { 
                                title: 'Total Logs', 
                                value: logs.length, 
                                gradient: 'from-teal-400 to-cyan-400',
                                icon: '📊',
                                accentColor: 'teal'
                            },
                            { 
                                title: 'Successful', 
                                value: successCount, 
                                gradient: 'from-emerald-400 to-teal-400',
                                icon: '✅',
                                accentColor: 'emerald'
                            },
                            { 
                                title: 'Failed Attempts', 
                                value: failedCount, 
                                gradient: 'from-red-400 to-orange-400',
                                icon: '❌',
                                accentColor: 'red'
                            },
                            { 
                                title: 'Login/Signup', 
                                value: `${loginCount}/${signupCount}`, 
                                gradient: 'from-cyan-400 to-blue-400',
                                icon: '🔐',
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
                                            {/* Note: Tailwind JIT/AOT sometimes requires utility classes to be fully present (e.g., 'bg-red-400') instead of being built dynamically in the final output. */}
                                            <span className={`w-2 h-2 rounded-full ${card.accentColor === 'teal' ? 'bg-teal-400' : card.accentColor === 'emerald' ? 'bg-emerald-400' : card.accentColor === 'red' ? 'bg-red-400' : 'bg-cyan-400'} animate-pulse`}></span>
                                            <span className={`w-2 h-2 rounded-full ${card.accentColor === 'teal' ? 'bg-teal-400' : card.accentColor === 'emerald' ? 'bg-emerald-400' : card.accentColor === 'red' ? 'bg-red-400' : 'bg-cyan-400'} animate-pulse animation-delay-150`}></span>
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

                    {/* Recent Logs - Desktop Table View */}
                    <div className="hidden md:block relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                        <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                                <h3 className="font-bold text-slate-100 text-xl">Recent 20 Logs by Users</h3>
                            </div>
                            <div className="max-h-[700px] overflow-y-auto rounded-2xl border border-slate-700/50 logs-table-container"> {/* Added logs-table-container class */}
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-900/60 backdrop-blur-xl sticky top-0">
                                        <tr>
                                            <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Date</th>
                                            <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Email</th>
                                            <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Username</th>
                                            <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Action</th>
                                            <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                                        {logs.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                                                    No logs found
                                                </td>
                                            </tr>
                                        ) : (
                                            logs.slice(0, 20).map((log, idx) => (
                                                <tr
                                                    key={log._id}
                                                    className="hover:bg-slate-700/30 transition-all duration-300 group"
                                                    style={{ animationDelay: `${idx * 30}ms` }}
                                                >
                                                    <td className="p-4 whitespace-nowrap text-slate-300 font-medium">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="p-4 max-w-[250px]">
                                                        <div className="truncate text-slate-200 group-hover:text-teal-300 transition-colors">
                                                            {log.email}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-medium text-slate-200">{log.username}</td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                                            log.action === 'LOGIN' 
                                                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                                                                : 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                                        }`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                                            log.status === 'SUCCESS'
                                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                                                : 'bg-red-500/20 text-red-300 border-red-500/50'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Recent Logs - Mobile Card View */}
                    <div className="md:hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-10"></div>
                        <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-1 h-10 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full"></div>
                                <h3 className="font-bold text-slate-100 text-lg">Recent 20 Logs by Users</h3>
                            </div>
                            <div className="max-h-[700px] overflow-y-auto space-y-4 logs-mobile-container"> {/* Added logs-mobile-container class */}
                                {logs.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 italic border border-slate-700/50 rounded-2xl bg-slate-800/30">
                                        No logs found
                                    </div>
                                ) : (
                                    logs.slice(0, 20).map((log, idx) => (
                                        <div
                                            key={log._id}
                                            className="bg-slate-700/30 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-4 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
                                            style={{ animationDelay: `${idx * 30}ms` }}
                                        >
                                            <div className="flex justify-between items-start gap-2 mb-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                                    log.status === 'SUCCESS'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                                        : 'bg-red-500/20 text-red-300 border-red-500/50'
                                                }`}>
                                                    {log.status}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Username</div>
                                                    <div className="font-medium text-slate-200 text-sm">{log.username}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Email</div>
                                                    <div className="text-sm text-slate-300 break-all">{log.email}</div>
                                                </div>

                                                <div className="pt-3 border-t border-slate-600/50">
                                                    <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Action</div>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                                        log.action === 'LOGIN' 
                                                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                                                            : 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                                    }`}>
                                                        {log.action}
                                                    </span>
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

            <style jsx>{`
                /* --- Existing CSS --- */
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(50px, -80px) scale(1.1); }
                    66% { transform: translate(-30px, 40px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 8s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-150 {
                    animation-delay: 150ms;
                }
                .animation-delay-300 {
                    animation-delay: 300ms;
                }

                /* --------------------------------------------------------------------- */
                /* --- Custom Scrollbar Styles to match the Teal/Slate dark theme --- */
                /* --------------------------------------------------------------------- */

                /* Target both the table and mobile containers */
                .logs-table-container::-webkit-scrollbar, 
                .logs-mobile-container::-webkit-scrollbar {
                    width: 8px; /* Vertical scrollbar width */
                    height: 8px; /* Horizontal scrollbar height */
                }

                /* Scrollbar Track (the background) */
                .logs-table-container::-webkit-scrollbar-track, 
                .logs-mobile-container::-webkit-scrollbar-track {
                    /* Used a translucent dark color to blend with slate-900/950 */
                    background: rgba(15, 23, 42, 0.5); /* Background: slate-950/50 */
                    border-radius: 10px;
                }

                /* Scrollbar Thumb (the draggable part) */
                .logs-table-container::-webkit-scrollbar-thumb, 
                .logs-mobile-container::-webkit-scrollbar-thumb {
                    background-color: #0d9488; /* Thumb color: teal-600 */
                    border-radius: 10px;
                    /* Adding a transparent border makes the thumb look thinner inside a larger track space */
                    border: 2px solid rgba(15, 23, 42, 0.7); 
                    background-clip: content-box; /* Ensures the background color respects the padding from the border */
                    transition: background-color 0.3s;
                }

                /* Scrollbar Thumb Hover Effect */
                .logs-table-container::-webkit-scrollbar-thumb:hover, 
                .logs-mobile-container::-webkit-scrollbar-thumb:hover {
                    background-color: #2dd4bf; /* Hover color: teal-400 */
                }

                /* Custom Scrollbar Styles (Firefox) - Limited support, sets color and width */
                .logs-table-container, 
                .logs-mobile-container {
                    scrollbar-width: thin; /* 'auto' or 'thin' */
                    /* thumb-color track-color */
                    scrollbar-color: #0d9488 rgba(15, 23, 42, 0.5); 
                }
            `}</style>
        </div>
    );
}