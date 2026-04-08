'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogOut, Repeat, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useViewMode } from '../context/ViewModeContext';
import Link from 'next/link';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { viewMode, setViewMode } = useViewMode();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleToggleMode = () => {
    const newMode = viewMode === 'learner' ? 'hirer' : 'learner';
    setViewMode(newMode);
    setIsOpen(false);
    router.push(newMode === 'hirer' ? '/hire' : '/dashboard');
  };

  const closeAndNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="User menu"
      >
        <UserIcon className="w-4 h-4 text-zinc-300" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-[#121212] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-zinc-800/80 mb-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Current Mode
            </p>
            <p className="text-sm font-bold text-white capitalize">
              {viewMode}
            </p>
          </div>

          <div className="flex flex-col px-2">
            <button
              onClick={() => closeAndNavigate('/dashboard')}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={handleToggleMode}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all"
            >
              <Repeat className="w-4 h-4" />
              {viewMode === 'learner' ? 'Switch to Hirer' : 'Switch to Learner'}
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-zinc-800/80 px-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
