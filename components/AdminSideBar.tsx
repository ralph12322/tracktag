'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, User, Users, List, Tag, MessageSquare, Menu, X } from 'lucide-react';

export default function AdminSideBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/auth/admin', label: 'Home', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { href: '/admin/userLogs', label: 'User Logs', icon: <User size={18} /> },
    { href: '/admin/userFeedback', label: 'User Feedback', icon: <MessageSquare size={18} /> },
    { href: '/admin/productTrackingLogs', label: 'Product Tracking Logs', icon: <List size={18} /> },
    { href: '/admin/discountLogs', label: 'Discount Alert Logs', icon: <Tag size={18} /> },


  ];

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-11 left-6 z-50 bg-slate-800/80 backdrop-blur-xl p-3 rounded-xl border border-teal-500/30 hover:border-teal-400/60 shadow-md text-teal-300 transition-all duration-300"
      >
        <Menu size={22} />
      </button>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`
    fixed lg:static top-0 left-0 z-50 lg:z-40
    h-full lg:h-fit w-64 transform transition-transform duration-500
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `}
      >

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-10 lg:opacity-10"></div>

        {/* Sidebar container */}
        <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-none lg:rounded-3xl shadow-lg border border-teal-500/30 p-6 h-full lg:h-auto flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">

              {/* Close button (Mobile only) */}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-slate-300 hover:text-teal-400 transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col space-y-2">
              {links.map(({ href, label, icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`group/link relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 shadow-lg shadow-teal-500/10'
                      : 'text-slate-300 hover:text-teal-300 hover:bg-slate-700/30'
                      }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-r-full"></div>
                    )}

                    {/* Hover glow */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/link:opacity-10 transition-opacity duration-300 ${isActive ? 'opacity-5' : ''
                        }`}
                    ></div>

                    {/* Icon */}
                    <span
                      className={`relative z-10 transition-transform duration-300 group-hover/link:scale-110 ${isActive ? 'text-teal-400' : ''
                        }`}
                    >
                      {icon}
                    </span>

                    {/* Label */}
                    <span className="relative z-10 truncate">{label}</span>

                    {/* Active dot */}
                    {isActive && (
                      <span className="relative z-10 ml-auto w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Decorative bottom line */}
          <div className="mt-8 pt-4 border-t border-slate-700/50">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
          </div>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </>
  );
}
