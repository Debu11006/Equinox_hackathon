'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Briefcase, Clock, ArrowRight, Star, 
  Lock, CheckCircle2, Loader2, IndianRupee, Sparkles,
  TrendingUp, Award, Shield, Zap, Crown, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

// Rank values for comparison
const RANK_VALUES: Record<string, number> = {
  'apprentice': 1,
  'associate': 2,
  'specialist': 3,
  'professional': 4
};

const SKILL_NAMES: Record<string, string> = {
  'web-dev': 'Web Development',
  'python': 'Python Automation',
  'data': 'Data Analysis',
  'ai': 'AI Engineering',
  'cyber': 'Cyber Security',
  'graphic-design': 'Graphic Design',
  'video-editing': 'Video Editing',
  'social-media': 'Social Media Management',
  'content-writing': 'Content Writing',
  'digital-marketing': 'Digital Marketing',
  'technical-writing': 'Technical Writing'
};

interface UserRank {
  skillId: string;
  rank: string;
}

interface Gig {
  id: string;
  title: string;
  clientName: string;
  budget: number;
  requiredSkill: string;
  minRole: string;
  duration: string;
  description: string;
  clientRating: number;
  highlighted?: boolean;
}

export default function BrowseGigsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [userRanks, setUserRanks] = useState<Record<string, string>>({});
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [maxBudget, setMaxBudget] = useState<number | ''>('');

  // 1. Fetch User Ranks & Gigs
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch User Ranks
        const skillsCol = collection(db, 'users', user.uid, 'skills');
        const skillSnap = await getDocs(skillsCol);
        const ranks: Record<string, string> = {};
        skillSnap.forEach(doc => {
          const milestones = doc.data().milestones || {};
          const completedCount = Object.values(milestones).filter((m: any) => m.status === 'completed').length;
          let rank = 'apprentice';
          if (completedCount >= 12) rank = 'professional';
          else if (completedCount >= 9) rank = 'specialist';
          else if (completedCount >= 5) rank = 'associate';
          ranks[doc.id.replace(/_/g, '-')] = rank;
        });
        setUserRanks(ranks);

        // Fetch Gigs
        const gigSnap = await getDocs(collection(db, 'gigs'));
        const fetchedGigs: Gig[] = gigSnap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || 'Freelance Project',
            clientName: d.clientName || 'Verified Hirer',
            budget: d.budget || d.price || 1000,
            requiredSkill: d.requiredSkill || d.skillsRequired?.[0] || 'web-dev',
            minRole: d.minRole || d.level || 'apprentice',
            duration: d.duration || 'Flexible',
            description: d.description || 'Project details will be provided in the full listing.',
            clientRating: d.clientRating || 5.0
          };
        });
        setGigs(fetchedGigs);
      } catch (err) {
        console.error('Data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // 2. Recommendation & Filtering Logic
  const processedGigs = useMemo(() => {
    let result = gigs.map(gig => {
      const userRank = userRanks[gig.requiredSkill] || 'apprentice';
      const userRankVal = RANK_VALUES[userRank] || 1;
      const minRoleVal = RANK_VALUES[gig.minRole.toLowerCase()] || 1;
      
      const isLocked = userRankVal < minRoleVal;
      const isRecommended = !isLocked && (userRankVal === minRoleVal || userRankVal === minRoleVal + 1);
      
      return {
        ...gig,
        userRank,
        isLocked,
        isRecommended,
        matchScore: isRecommended ? 100 : (isLocked ? -50 : 50)
      };
    });

    // Filtering
    result = result.filter(gig => {
      const searchMatch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          gig.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const skillMatch = selectedSkill === 'All' || gig.requiredSkill === selectedSkill;
      const roleMatch = selectedRole === 'All' || gig.minRole.toLowerCase() === selectedRole.toLowerCase();
      const budgetMatch = maxBudget === '' || gig.budget <= maxBudget;
      return searchMatch && skillMatch && roleMatch && budgetMatch;
    });

    // Sorting: Recommended first, then Unlocked, then Locked
    return result.sort((a, b) => b.matchScore - a.matchScore);
  }, [gigs, userRanks, searchQuery, selectedSkill, selectedRole, maxBudget]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 ease-out flex flex-col gap-8">
      
      <div className="flex flex-col gap-1.5 text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Browse Gigs</h1>
        <p className="text-zinc-400 font-medium tracking-wide">AI-matched freelance opportunities from global hirers.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Filter Sidebar */}
        <aside className="lg:w-72 flex flex-col gap-6 bg-[#0E0E0E] border border-zinc-800/80 rounded-3xl p-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Advanced Filters</h3>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Design, Python, etc..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Skill Path</label>
              <select 
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Skill Paths</option>
                {Object.entries(SKILL_NAMES).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Minimum Role</label>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="All">Any Experience</option>
                <option value="Apprentice">Apprentice</option>
                <option value="Associate">Associate</option>
                <option value="Specialist">Specialist</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Max Budget (₹)</label>
                <span className="text-zinc-600 text-xs">{maxBudget ? `₹${maxBudget}` : 'No limit'}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="500"
                value={maxBudget === '' ? 10000 : maxBudget}
                onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 accent-amber-500 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedSkill('All');
                setSelectedRole('All');
                setMaxBudget('');
              }}
              className="mt-2 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1.5 justify-center"
            >
              Reset All Filters
            </button>
          </div>
        </aside>

        {/* Gigs List */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Header Stats */}
          <div className="flex items-center justify-between text-zinc-500 text-xs px-2">
            <span className="font-bold uppercase tracking-widest">Showing {processedGigs.length} matching gigs</span>
            {processedGigs.some(g => g.isRecommended) && (
              <div className="flex items-center gap-1.5 text-amber-500/80">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-widest italic">Personalized Matches Found</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {processedGigs.map((gig) => (
              <div 
                key={gig.id}
                className={`group relative bg-[#0E0E0E] border rounded-3xl p-7 flex flex-col transition-all duration-300 hover:shadow-2xl overflow-hidden ${
                  gig.isRecommended ? 'border-amber-500/30' : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Glowing recommended background effect */}
                {gig.isRecommended && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
                )}

                {/* Badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      gig.isRecommended ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/5 text-blue-400 border-blue-500/20'
                    }`}>
                      {SKILL_NAMES[gig.requiredSkill] || gig.requiredSkill}
                    </span>
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {gig.minRole}
                    </span>
                  </div>
                  {gig.isRecommended && (
                    <div className="flex items-center gap-1.5 bg-amber-500 text-black px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/20">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Platform Match</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors leading-tight mb-1">
                    {gig.title}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-500">{gig.clientName}</p>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">
                  {gig.description}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8 mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Project Budget</span>
                    <div className="flex items-center gap-1.5 text-white font-black text-lg">
                      <IndianRupee className="w-4 h-4 text-emerald-400" />
                      {gig.budget.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Client Rating</span>
                    <div className="flex items-center gap-1 text-white font-bold text-lg">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {gig.clientRating.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Footer: Detailed CTA with Lock Mechanism */}
                <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {gig.duration}
                  </div>
                  
                  {gig.isLocked ? (
                    <div className="relative group/tooltip">
                      <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-600 font-bold text-xs px-5 py-2.5 rounded-xl cursor-not-allowed opacity-60">
                         <Lock className="w-4 h-4" />
                         Locked
                      </button>
                      <div className="absolute bottom-full right-0 mb-3 w-64 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none translate-y-2 group-hover/tooltip:translate-y-0 z-50">
                        <div className="flex items-start gap-2.5">
                          <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                            Upskill to <span className="text-white font-black uppercase text-[10px]">{gig.minRole}</span> in {SKILL_NAMES[gig.requiredSkill]} to unlock this gig.
                            <Link href={`/learn/${gig.requiredSkill}`} className="block text-amber-500 font-bold mt-1 hover:underline underline-offset-2 pointer-events-auto">
                              Start Learning Workspace →
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      href={`/gigs/${gig.id}`}
                      className={`flex items-center gap-2 font-bold text-xs px-6 py-2.5 rounded-xl transition-all border ${
                        gig.isRecommended 
                          ? 'bg-white hover:bg-zinc-200 text-black border-transparent shadow-lg' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {processedGigs.length === 0 && (
              <div className="col-span-full py-20 border border-zinc-800 border-dashed rounded-[32px] bg-zinc-900/10 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center">
                  <Search className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-white">No gigs matched your search</h3>
                  <p className="text-sm text-zinc-500 max-w-xs mx-auto">Try adjusting your budget or skill filters to find more opportunities.</p>
                </div>
                <button onClick={() => { setSearchQuery(''); setSelectedSkill('All'); setSelectedRole('All'); setMaxBudget(''); }} className="text-amber-500 font-bold text-xs underline underline-offset-4 mt-2">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
