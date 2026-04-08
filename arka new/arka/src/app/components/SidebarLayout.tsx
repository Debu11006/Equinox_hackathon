'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, Briefcase, Wallet, Settings,
  Users, FileText, CreditCard, Bell, Menu, X, Search, MessageSquare,
  PlusSquare, Store
} from 'lucide-react';
import { useViewMode } from '../context/ViewModeContext';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';
import MessagesIconButton from './MessagesIconButton';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { viewMode } = useViewMode();
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const freelancerLinks = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Skill Paths', href: '/learn', icon: BookOpen },
    { name: 'Active Gigs', href: '/dashboard/gigs', icon: Briefcase },
    { name: 'DIVIDER', href: '', icon: Home },
    { name: 'Post a Service', href: '/dashboard/post-service', icon: PlusSquare },
    { name: 'Browse Gigs', href: '/dashboard/browse-gigs', icon: Search },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  ];

  const clientLinks = [
    { name: 'Browse Talent', href: '/hire', icon: Search },
    { name: 'My Postings', href: '/hire/my-postings', icon: FileText },
    { name: 'Messages', href: '/hire/messages', icon: MessageSquare },
    { name: 'Payments', href: '/hire/payments', icon: CreditCard },
  ];

  const links = viewMode === 'freelancer' ? freelancerLinks : clientLinks;

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-zinc-50 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-zinc-800/40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-900 shrink-0">
          <Link href="/" className="text-xl font-bold text-white tracking-widest">
            ARKA
          </Link>
          <button className="ml-auto lg:hidden" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex flex-col flex-1 py-6 px-4 gap-2 overflow-y-auto">
          {links.map((link, idx) => {
            if (link.name === 'DIVIDER') {
              return (
                <div key={`divider-${idx}`} className="my-4 border-t border-zinc-800/40" />
              );
            }
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-zinc-900/80 text-white shadow-sm border-l-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border-l-2 border-transparent'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Bottom Nav (Admin Settings) */}
        {isAdmin && (
          <div className="p-4 mt-auto border-t border-zinc-900">
            <Link 
              href="/admin"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === '/admin' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
            >
              <Settings className={`w-4 h-4 ${pathname === '/admin' ? 'text-white' : 'text-zinc-500'}`} />
              Admin Settings
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-zinc-900 bg-[#0A0A0A] shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-1 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium text-zinc-500">
              <span className="hidden sm:inline">ARKA / </span>
              <span className="text-zinc-300 capitalize">
                {pathname === '/dashboard' ? 'Dashboard' : pathname.split('/').pop()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MessagesIconButton />
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            </button>
            <ProfileDropdown />
          </div>
        </header>

        {/* Page Content Wrapper */}
        <div className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
