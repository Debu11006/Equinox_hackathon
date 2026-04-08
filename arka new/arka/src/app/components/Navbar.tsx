'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { usePathname } from 'next/navigation';
import { useViewMode } from '../context/ViewModeContext';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const { viewMode } = useViewMode();

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/hire')) {
    return null;
  }

  const links = [
    { name: 'Home', href: '/', active: true },
    { name: 'Explore', href: '/explore', active: false },
    viewMode === 'client'
      ? { name: 'Hire', href: '/hire', active: false }
      : { name: 'Dashboard', href: '/dashboard', active: false },
    { name: 'Dev Console', href: isAdmin ? '/admin' : '#', active: false },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 w-full pointer-events-none">
      <nav className="flex w-full xl:max-w-6xl max-w-4xl items-center justify-between rounded-full border border-zinc-800/80 bg-zinc-900/90 px-6 py-3.5 backdrop-blur-md shadow-2xl pointer-events-auto transition-all">
        
        {/* Content (Left): Branding */}
        <div className="flex shrink-0 items-center mr-8">
          <Link href="/" className="text-lg sm:text-xl font-bold text-white tracking-widest">
            ARKA
          </Link>
        </div>

        {/* Content (Center): Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-all duration-200 ${
                link.active 
                  ? 'text-white' 
                  : 'text-zinc-400 hover:text-white opacity-70 hover:opacity-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Content (Right): Actions & Admin Badge */}
        <div className="flex shrink-0 items-center gap-4 ml-auto lg:ml-0">
          {user ? (
            <ProfileDropdown />
          ) : (
            <Link 
              href="/login"
              className="text-sm font-medium text-zinc-400 transition-opacity duration-200 hover:text-white opacity-80 hover:opacity-100"
            >
              Login
            </Link>
          )}
          
          {isAdmin && (
            <Link 
              href="/admin"
              className="flex items-center justify-center rounded-full border border-amber-500/40 bg-zinc-900 px-3 py-1 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:border-amber-500 transition-all cursor-pointer"
            >
              <span className="text-[10px] sm:text-xs font-bold text-amber-500 tracking-widest uppercase">
                <span className="text-amber-500 mr-1">*</span> ADMIN
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
