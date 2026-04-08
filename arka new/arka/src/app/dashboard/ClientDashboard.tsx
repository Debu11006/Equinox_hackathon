'use client';

import React, { useEffect, useState } from 'react';
import { Search, Code, Palette, PenTool, Megaphone, Database, BrainCircuit, Plus, Star, MapPin, Target } from 'lucide-react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { name: 'Development', icon: Code },
  { name: 'Creative', icon: Palette },
  { name: 'Writing', icon: PenTool },
  { name: 'Marketing', icon: Megaphone },
  { name: 'Data', icon: Database },
  { name: 'AI', icon: BrainCircuit },
];

export default function ClientDashboard() {
  const [topFreelancers, setTopFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        // Attempt to fetch users marked as freelancer (previously student/learner)
        const q = query(collection(db, 'users'), where('accountType', '==', 'freelancer'), limit(4));
        const snapshot = await getDocs(q);
        const freelancersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fallback dummy data or use results
        if (freelancersData.length === 0) {
          setTopFreelancers([
            { id: '1', displayName: 'Aisha K.', role: 'student', title: 'React Developer', rating: 4.9, location: 'Hyderabad', skills: ['Next.js', 'Tailwind'] },
            { id: '2', displayName: 'Rahul M.', role: 'student', title: 'UI/UX Designer', rating: 4.8, location: 'Hyderabad', skills: ['Figma', 'Prototyping'] },
            { id: '3', displayName: 'Sneha P.', role: 'student', title: 'Backend Engineer', rating: 5.0, location: 'Hyderabad', skills: ['Node.js', 'Python'] }
          ]);
        } else {
          setTopFreelancers(freelancersData);
        }
      } catch (error) {
        console.error('Error fetching freelancers:', error);
        setTopFreelancers([
          { id: '1', displayName: 'Aisha K.', role: 'student', title: 'React Developer', rating: 4.9, location: 'Hyderabad', skills: ['Next.js', 'Tailwind'] },
          { id: '2', displayName: 'Rahul M.', role: 'student', title: 'UI/UX Designer', rating: 4.8, location: 'Hyderabad', skills: ['Figma', 'Prototyping'] },
          { id: '3', displayName: 'Sneha P.', role: 'student', title: 'Backend Engineer', rating: 5.0, location: 'Hyderabad', skills: ['Node.js', 'Python'] }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto w-full pb-12 animate-in fade-in zoom-in-95 duration-500 ease-out">
      
      {/* 1. Hero Search Section */}
      <div className="flex flex-col items-center text-center mt-6 mb-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-8 max-w-3xl">
          Find the perfect freelance talent for your project
        </h1>
        
        <div className="w-full max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-amber-500" />
          </div>
          <input 
            type="text"
            placeholder='Try "Logo Design" or "Python Script"'
            className="w-full bg-[#121212] border border-zinc-800 focus:border-amber-500/50 rounded-full py-5 pl-14 pr-6 text-white text-lg placeholder:text-zinc-600 outline-none transition-all shadow-2xl focus:shadow-amber-500/10"
          />
          <button className="absolute inset-y-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-6 rounded-full transition-colors">
            Search
          </button>
        </div>

        <div className="flex items-center gap-2 mt-6 text-sm">
          <span className="text-zinc-500 font-medium">Popular:</span>
          <div className="flex flex-wrap gap-2">
            {['Web Dev', 'Video Editing', 'Content Writing'].map(tag => (
              <button key={tag} className="text-zinc-400 hover:text-amber-500 transition-colors font-medium">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Category Grid (Takes 2/3 width on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h2 className="text-xl font-bold text-white tracking-tight">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button 
                  key={cat.name}
                  className="flex flex-col items-center justify-center gap-3 bg-[#121212] border border-zinc-800/80 hover:border-amber-500/40 hover:bg-[#1a1a1a] rounded-2xl p-5 transition-all group"
                >
                  <div className="bg-zinc-900 group-hover:bg-amber-500/10 p-3 rounded-xl transition-colors">
                    <Icon className="w-6 h-6 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. 'Post a Gig' Call to Action (Takes 1/3 width on desktop) */}
        <div className="lg:col-span-1">
          <div className="h-full relative overflow-hidden bg-gradient-to-br from-[#121212] to-zinc-900 border border-amber-500/30 rounded-3xl p-8 flex flex-col justify-center items-start shadow-xl shadow-amber-500/5 group hover:border-amber-500/60 transition-all">
            {/* Background glow */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full"></div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl mb-6">
              <Target className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight mb-4 leading-tight">
              Need something specific?
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Post a milestone-based gig and let verified freelancers apply directly to your project. Escrow protection included.
            </p>
            <button 
              onClick={() => router.push('/hire')}
              className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 font-bold py-3.5 px-6 rounded-xl transition-colors"
            >
              Post a Gig <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Talent Preview (Discovery) */}
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Top Rated Freelancers in Hyderabad</h2>
            <p className="text-zinc-500 text-sm mt-1">Discover elite freelance talent in your region.</p>
          </div>
          <button className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-3 text-center py-10 text-zinc-500">Loading talent...</div>
          ) : (
            topFreelancers.map((freelancer) => (
              <div 
                key={freelancer.id} 
                className="flex flex-col bg-[#121212] border border-zinc-800/80 rounded-3xl p-6 hover:border-amber-500/30 transition-all shadow-xl group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {freelancer.displayName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{freelancer.displayName}</h3>
                      <p className="text-xs text-zinc-400 font-medium">{freelancer.title}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest mt-2 mb-6">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {freelancer.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {freelancer.location}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {freelancer.skills?.map((skill: string) => (
                    <span key={skill} className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
