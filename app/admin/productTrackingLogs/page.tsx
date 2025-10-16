'use client';

import AdminSideBar from '@/components/AdminSideBar';
import { useEffect, useState } from 'react';

type UserTrack = {
    _id: string;
    user: {
        _id: string;
        username: string;
        email: string;
        password?: string;
    };
    title: string;
    url: string;
    createdAt: string;
};

export default function UserTracksPage() {
    const [tracks, setTracks] = useState<UserTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState<'user' | 'product'>('user');

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                // NOTE: The original path '/api/admin/products' seems to return 'UserTrack[]' based on the usage.
                // Assuming this is the correct API endpoint for fetching the tracked products.
                const res = await fetch('/api/admin/products');
                const data = await res.json();
                setTracks(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch user tracks', error);
                setLoading(false);
            }
        };

        fetchTracks();
    }, []);

    const filteredTracks = tracks.filter((t) => {
        const username = t.user?.username?.toLowerCase() || '';
        const productName = t.title?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        return filterBy === 'user'
            ? username.includes(search)
            : productName.includes(search);
    });

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
                <main className="flex-1">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                        
                        <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-lg border border-teal-500/30 p-6">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-10 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-slate-100">
                                    User Tracked Products
                                </h2>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                                <div className="relative group/select">
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/select:opacity-10 transition-opacity duration-300"></div>
                                    <select
                                        value={filterBy}
                                        onChange={(e) =>
                                            setFilterBy(e.target.value as 'user' | 'product')
                                        }
                                        className="relative appearance-none rounded-xl px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 cursor-pointer"
                                    >
                                        <option value="user" className="bg-slate-900">User</option>
                                        <option value="product" className="bg-slate-900">Product</option>
                                    </select>
                                </div>

                                <div className="relative group/input flex-1 sm:max-w-md">
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/input:opacity-10 transition-opacity duration-300"></div>
                                    <input
                                        type="text"
                                        placeholder={`Search by ${filterBy}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="relative appearance-none rounded-xl w-full px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block max-h-[700px] overflow-y-auto rounded-2xl border border-slate-700/50 **custom-scrollbar**">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-900/60 backdrop-blur-xl sticky top-0">
                                        <tr>
                                            <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Date</th>
                                            <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Username</th>
                                            <th className="p-4 text-left font-bold text-teal-300 uppercase text-xs tracking-wider">Product Tracked</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-slate-800/20 divide-y divide-slate-700/30">
                                        {filteredTracks.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-slate-400">
                                                    No tracks found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTracks.map((track, idx) => (
                                                <tr
                                                    key={track._id}
                                                    className="hover:bg-slate-700/30 transition-all duration-300 group/row"
                                                    style={{ animationDelay: `${idx * 50}ms` }}
                                                >
                                                    <td className="p-4 whitespace-nowrap text-slate-300 font-medium">
                                                        {new Date(track.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-slate-200 font-medium">
                                                        {track.user?.username || 'Unknown User'}
                                                    </td>
                                                    <td className="p-4 max-w-[400px]">
                                                        <a
                                                            href={track.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-teal-400 hover:text-teal-300 font-medium truncate block hover:underline transition-colors duration-300"
                                                        >
                                                            {track.title}
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden max-h-[700px] overflow-y-auto space-y-4">
                                {filteredTracks.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 border border-slate-700/50 rounded-2xl bg-slate-900/40">
                                        No tracks found
                                    </div>
                                ) : (
                                    filteredTracks.map((track, idx) => (
                                        <div
                                            key={track._id}
                                            className="bg-slate-700/30 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-4 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {new Date(track.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                
                                                <div>
                                                    <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">User</div>
                                                    <div className="font-medium text-slate-200">
                                                        {track.user?.username || 'Unknown User'}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">Product</div>
                                                    <a
                                                        href={track.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-teal-400 hover:text-teal-300 font-medium hover:underline break-words transition-colors duration-300"
                                                    >
                                                        {track.title}
                                                    </a>
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
                
                /* Custom Scrollbar Styling (Themed) */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px; /* Width for vertical scrollbar */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #0d9488; /* Teal-600 */
                    border-radius: 4px; /* Rounded corners */
                    border: 2px solid transparent; /* Keeps the thumb thin but visible */
                    background-clip: content-box; /* Ensures border doesn't cover the track */
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background-color: #1e293b; /* Slate-800 */
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #2dd4bf; /* Teal-400 for hover */
                }

                /* Optional: Hide scrollbar in Firefox for an overlay effect (less supported) */
                /* .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #0d9488 #1e293b; 
                } */
            `}</style>
        </div>
    );
}