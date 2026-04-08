'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MyPostingsPage() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyGigs = async () => {
      // Only fetch if we have an authenticated user ID
      if (!user?.uid) {
        // For Hackathon demo purposes, if not logged in, we'll gracefully fallback to empty state rather than erroring
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'gigs'), where('clientId', '==', user.uid));
        const snapshot = await getDocs(q);
        const myGigs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGigs(myGigs);
      } catch (error) {
        console.error('Error fetching my gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyGigs();
  }, [user]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-16 animate-in fade-in zoom-in-95 duration-500 ease-out">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            My Postings
          </h1>
          <p className="text-zinc-400">
            Manage your active gig listings and review student applications.
          </p>
        </div>
        <button className="shrink-0 flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg">
          <Plus className="w-4 h-4" /> Post New Gig
        </button>
      </div>

      {
        loading ? (
          <div className="flex justify-center py-32">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : gigs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {gigs.map((gig) => (
              <div 
                key={gig.id} 
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#121212] border border-zinc-800/80 hover:border-amber-500/40 hover:bg-[#151515] transition-all rounded-3xl p-6 md:p-8 shadow-xl group"
              >
                {/* Info Section */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                      {gig.status || 'Active'}
                    </div>
                    <span className="text-zinc-500 text-sm font-medium">Posted recently</span>
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors cursor-pointer">
                    {gig.title || 'Untitled Project'}
                  </h2>
                  <p className="text-zinc-400 text-sm line-clamp-1">
                    {gig.description || 'No description provided.'}
                  </p>
                </div>

                {/* Stats & Action Section */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-10 shrink-0 border-t border-zinc-800/80 md:border-none pt-4 md:pt-0">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Applications</span>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Users className="w-4 h-4 text-amber-500" />
                      {gig.applicationsCount || Math.floor(Math.random() * 12)} 
                      <span className="text-zinc-500 font-medium text-sm">received</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Budget</span>
                    <div className="text-xl font-bold text-amber-500 tracking-tight">
                      {gig.price ? gig.price : (gig.budget ? `₹${gig.budget}` : 'Negotiable')}
                    </div>
                  </div>

                  <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors ml-auto md:ml-0">
                    Manage Gig
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center text-center bg-[#121212] border border-zinc-800/80 border-dashed rounded-3xl py-24 px-6 shadow-xl">
            <div className="w-20 h-20 bg-zinc-900 border border-zinc-800/80 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Briefcase className="w-8 h-8 text-zinc-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              You haven't posted any gigs yet
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              Create your first milestone-based short-term project to start receiving high-quality applications from verified students.
            </p>
            <button className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold text-base px-8 py-4 rounded-xl transition-all shadow-xl">
              <Plus className="w-5 h-5" />
              Post Your First Gig
            </button>
          </div>
        )
      }
    </div>
  );
}
