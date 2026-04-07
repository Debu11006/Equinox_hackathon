'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const links = [
    { name: 'Home', href: '/', active: true },
    { name: 'Explore', href: '/explore', active: false },
    { name: 'Dashboard', href: '/profile', active: false },
    { name: 'Ledger', href: '#', active: false },
    { name: 'Dev Console', href: '#', active: false },
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
            <button 
              onClick={handleSignOut}
              className="text-sm font-medium text-zinc-400 transition-opacity duration-200 hover:text-white opacity-80 hover:opacity-100"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/login"
              className="text-sm font-medium text-zinc-400 transition-opacity duration-200 hover:text-white opacity-80 hover:opacity-100"
            >
              Login
            </Link>
          )}
          
          <div className="flex items-center justify-center rounded-full border border-zinc-700/50 bg-[#1a1a1a] px-3 py-1 shadow-inner">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-300 tracking-widest uppercase">
              <span className="text-accent mr-1">*</span> ADMIN
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
}
