import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-zinc-800/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-zinc-800/5 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 border border-zinc-800/50 bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl">
        {children}
      </div>
    </div>
  );
}
