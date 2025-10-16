'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on login, signup, and admin pages
  const hideNavbar = pathname === '/auth/login' || 
                     pathname === '/auth/signup'

  if (hideNavbar) {
    return null;
  }

  return <Navbar />;
}