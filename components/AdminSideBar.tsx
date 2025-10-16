'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, List, Tag, MessageSquare } from 'lucide-react';

export default function AdminSideBar() {
  const pathname = usePathname();

  const links = [
    { href: '/auth/admin', label: 'Home', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/userLogs', label: 'User Logs', icon: <User size={18} /> },
    { href: '/admin/productTrackingLogs', label: 'Product Tracking Logs', icon: <List size={18} /> },
    { href: '/admin/discountLogs', label: 'Discount Alert Logs', icon: <Tag size={18} /> },
    { href: '/admin/userFeedback', label: 'User Feedback', icon: <MessageSquare size={18} /> },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 h-fit">
      <nav className="flex flex-col space-y-1 sm:space-y-2">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition ${
              pathname === href ? 'bg-blue-50 text-blue-600 font-medium' : ''
            }`}
          >
            {icon}
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}