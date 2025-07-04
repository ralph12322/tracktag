'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const navIcons = [
  { src: '/assets/icons/search.svg', alt: 'search' },
  { src: '/assets/icons/black-heart.svg', alt: 'heart' },
  { src: '/assets/icons/user.svg', alt: 'user' },
];

const NavLinks = ({ showAdminLink }: { showAdminLink: boolean }) => (
  <div className="flex items-center gap-5">
    {navIcons.map((icon) =>
      icon.alt === 'user' ? (
        <Link href="/auth/profile" key={icon.alt}>
          <Image
            src={icon.src}
            alt={icon.alt}
            width={28}
            height={28}
            className="object-contain"
          />
        </Link>
      ) : (
        <Image
          key={icon.alt}
          src={icon.src}
          alt={icon.alt}
          width={28}
          height={28}
          className="object-contain"
        />
      )
    )}

    {showAdminLink && (
      <Link href="/auth/admin" className="text-white font-medium">
        Admin Panel
      </Link>
    )}
  </div>
);

const Navbar = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setRole(data.user.role);
      } catch {
        setRole(null); 
      }
    };

    fetchUser();
  }, []);


  if (role === 'Admin') {
    return (
      <header className="w-full bg-slate-600 rounded-10 sticky top-5 z-10">
        <nav className="nav">
          <Link href="/" className="flex items-center gap-1">
            <Image src="/assets/icons/logo.png" width={27} height={27} alt="logo" />
            <p className="nav-logo">
              Track<span className="text-[#5d90ff]">Tag</span>
            </p>
          </Link>
          <NavLinks showAdminLink={true} />
        </nav>
      </header>
    );
  }

  
  return (
    <header className="w-full bg-slate-600 rounded-10 sticky top-5 z-10">
      <nav className="nav">
        <Link href="/" className="flex items-center gap-1">
          <Image src="/assets/icons/logo.png" width={27} height={27} alt="logo" />
          <p className="nav-logo">
            Track<span className="text-[#5d90ff]">Tag</span>
          </p>
        </Link>
        <NavLinks showAdminLink={false} />
      </nav>
    </header>
  );
};

export default Navbar;
