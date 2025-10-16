'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const navIcons = [
  { src: '/assets/icons/user.svg', alt: 'user' },
];

const NavLinks = ({ showAdminLink }: { showAdminLink: boolean }) => (
  <div className="flex items-center gap-6">
    {navIcons.map((icon) =>
      icon.alt === 'user' ? (
        <Link 
          href="/auth/profile" 
          key={icon.alt}
          className="group relative p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-110"
          title="Profile"
        >
          <Image
            src={icon.src}
            alt={icon.alt}
            width={24}
            height={24}
            className="object-contain brightness-150 group-hover:brightness-200 transition-all duration-300 relative z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
          <div className="absolute inset-0 border-2 border-teal-400/0 group-hover:border-teal-400/50 rounded-xl transition-all duration-300"></div>
        </Link>
      ) : (
        <button
          key={icon.alt}
          className="group relative p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-110"
        >
          <Image
            src={icon.src}
            alt={icon.alt}
            width={24}
            height={24}
            className="object-contain brightness-150 group-hover:brightness-200 transition-all duration-300 relative z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
        </button>
      )
    )}

    {showAdminLink && (
      <Link 
        href="/auth/admin" 
        className="relative px-5 py-2.5 text-slate-100 font-bold text-sm group overflow-hidden rounded-xl border border-teal-500/30 hover:border-teal-400/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-teal-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        <span className="relative flex items-center gap-2 z-10">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          Admin Panel
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </Link>
    )}
  </div>
);

const Navbar = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setRole(data.user.role);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setRole(null);
      }
    };

    fetchUser();

    window.addEventListener('user-updated', fetchUser);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('user-updated', fetchUser);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isAdmin = role === 'Admin';
  const navbarClasses = `w-full sticky top-5 z-${isAdmin ? '50' : '50'} transition-all duration-500 rounded-2xl mx-auto max-w-7xl ${
    isScrolled 
      ? 'bg-slate-900/95 backdrop-blur-2xl border border-teal-700/60 shadow-2xl shadow-teal-900/50' // Changed shadow and border color
      : 'bg-slate-900/60 backdrop-blur-xl border border-teal-700/40 shadow-xl' // Changed shadow and border color
  }`;

  return (
    <header className={navbarClasses}>
      {/* Ambient Glow Effect - Changed to teal/cyan */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600/0 via-cyan-500/5 to-teal-600/0 rounded-2xl pointer-events-none z-10"></div>
      
      <nav className="relative px-6 md:px-8 py-4 flex justify-between items-center">
        {/* Logo Section */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            {/* Glow and blur effects for the logo icon - Changed to teal/cyan */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-md"></div>
            <div className="relative bg-slate-800/50 p-2 rounded-xl border border-teal-500/20 group-hover:border-teal-400/40 transition-all duration-300">
              <Image 
                src="/assets/icons/logo.png" 
                width={28} 
                height={28} 
                alt="logo"
                // Drop shadow for the icon - Changed to teal
                className="brightness-150 group-hover:brightness-200 transition-all duration-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" 
              />
            </div>
          </div>
          <div className="relative">
            <p className="text-xl md:text-2xl font-black tracking-tight">
              {/* "Track" text gradient and shadow - Changed to teal/cyan */}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(45,212,191,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(45,212,191,0.5)] transition-all duration-300">
                Track
              </span>
              {/* "Tag" text gradient and shadow - Changed to cyan/teal */}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300">
                Tag
              </span>
            </p>
            {/* Underline effect - Changed to teal/cyan */}
            <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-teal-500/0 via-teal-400/50 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>

        {/* Nav Links */}
        <NavLinks showAdminLink={isAdmin} />
      </nav>

      {/* Animated Bottom Border with Glow - Changed to teal/cyan */}
      <div className="relative h-px">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-teal-600/0 via-teal-400/60 to-cyan-600/0"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-teal-600/0 via-teal-400/40 to-cyan-600/0 blur-sm"></div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;