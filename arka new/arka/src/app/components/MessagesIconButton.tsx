'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function MessagesIconButton() {
  const { user } = useAuth();
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const count = data.unreadCount?.[user.uid] ?? 0;
        if (count > 0) total += count;
      });
      setUnreadTotal(total);
    });

    return () => unsub();
  }, [user]);

  if (!user) return null;

  return (
    <Link
      href="/dashboard/messages"
      aria-label="Messages"
      className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-900 group"
    >
      <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
      {unreadTotal > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/40 animate-pulse-once border border-zinc-900">
          {unreadTotal > 99 ? '99+' : unreadTotal}
        </span>
      )}
    </Link>
  );
}
