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
                    <div className="flex flex-col gap-3 mb-4">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                            User Tracked Products
                        </h2>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <select
                                value={filterBy}
                                onChange={(e) =>
                                    setFilterBy(e.target.value as 'user' | 'product')
                                }
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="user">User</option>
                                <option value="product">Product</option>
                            </select>

                            <input
                                type="text"
                                placeholder={`Search by ${filterBy}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block max-h-[700px] overflow-y-auto rounded-md border border-gray-200">
                        <table className="w-full table-auto text-sm">
                            <thead className="bg-gray-100 text-left sticky top-0">
                                <tr>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Username</th>
                                    <th className="p-2">Product Tracked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTracks.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-4 text-center text-gray-500">
                                            No tracks found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTracks.map((track) => (
                                        <tr
                                            key={track._id}
                                            className="border-b hover:bg-gray-50 transition"
                                        >
                                            <td className="p-2 whitespace-nowrap">
                                                {new Date(track.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-2 font-medium text-gray-700">
                                                {track.user?.username || 'Unknown User'}
                                            </td>
                                            <td className="p-2 text-blue-600 font-medium truncate max-w-[200px]">
                                                <a
                                                    href={track.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
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
                    <div className="md:hidden max-h-[700px] overflow-y-auto space-y-3">
                        {filteredTracks.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                                No tracks found
                            </div>
                        ) : (
                            filteredTracks.map((track) => (
                                <div
                                    key={track._id}
                                    className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs text-gray-500">
                                                {new Date(track.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">User</div>
                                            <div className="font-medium text-gray-700">
                                                {track.user?.username || 'Unknown User'}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Product</div>
                                            <a
                                                href={track.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 font-medium hover:underline break-words"
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
            </main>
        </div>
    );
}