'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Optionally show a loading spinner here
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-600"></div>
      </div>
    );
  }

  // Only render children if user is authenticated (or loading is complete)
  // If user is null but loading is false, the useEffect will redirect.
  // We return null while the router redirect is happening to avoid flashing content.
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
