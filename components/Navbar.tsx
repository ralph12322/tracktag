'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const navIcons = [
  { src: '/assets/icons/search.svg', alt: 'search' },
  { src: '/assets/icons/black-heart.svg', alt: 'heart' },
  { src: '/assets/icons/user.svg', alt: 'user' },
];

const Navbar = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setRole(data.user.role);
      } catch (err) {
        setRole(null); // Not logged in or token invalid
      }
    };

    fetchUser();
  }, []);

  return (
    <header className='w-full bg-[#8ba874] rounded-10 sticky top-5 z-10'>
      <nav className='nav'>
        <Link href='/' className='flex items-center gap-1'>
          <Image
            src="/assets/icons/logo.png"
            width={27}
            height={27}
            alt='logo'
          />
          <p className='nav-logo'>
            Track<span className='text-primary'>Tag</span>
          </p>
        </Link>

        <div className='flex items-center gap-5'>
          {navIcons.map((icon) => {
            if (icon.alt === 'user') {
              return (
                <Link
                  href='/auth/profile'
                  key={icon.alt}
                >
                  <Image
                    src={icon.src}
                    alt={icon.alt}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </Link>
              );
            }

            return (
              <Image
                key={icon.alt}
                src={icon.src}
                alt={icon.alt}
                width={28}
                height={28}
                className="object-contain"
              />
            );
          })}

          {role === 'Admin' && (
            <Link href="/auth/admin" className="text-white font-medium">
              Admin Panel
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
