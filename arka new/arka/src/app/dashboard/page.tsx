'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useViewMode } from '../context/ViewModeContext';
import { BadgeCheck, CreditCard, MapPin, Target, BookOpen, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import HirerDashboard from './HirerDashboard';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import OnboardingCrossroads from '../components/OnboardingCrossroads';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, profile, loading, isAdmin } = useAuth();
  const { viewMode, setViewMode } = useViewMode();
  const router = useRouter();
  const [verifiedSkills, setVerifiedSkills] = useState<{ id: string, name: string, rank: string }[]>([]);

  // Map of skill keys to display names
  const SKILL_NAMES: Record<string, string> = {
    'web_dev': 'Web Development',
    'python_automation': 'Python Automation',
    'data_analysis': 'Data Analysis',
    'ai_engineering': 'AI Engineering',
    'cyber_security': 'Cyber Security',
    'graphic_design': 'Graphic Design'
  };

  // Rank Hierarchy for filtering
  const RANK_VALUE: Record<string, number> = {
    'apprentice': 1,
    'associate': 2,
    'specialist': 3,
    'professional': 4
  };

  // Real-time listener for Verified Skills
  useEffect(() => {
    if (!user?.uid) return;
    
    const skillsCol = collection(db, 'users', user.uid, 'skills');
    const unsubscribe = onSnapshot(skillsCol, (snap) => {
      // Temporary map to store highest rank per skill
      const highestRanks: Record<string, { id: string, name: string, rank: string, value: number }> = {};
      
      snap.forEach(doc => {
        const data = doc.data();
        if (data.rank) {
          const rankKey = data.rank.toLowerCase();
          const rankValue = RANK_VALUE[rankKey] || 0;
          
          // Aggressive normalization and Canonical ID Mapping
          const rawId = doc.id.toLowerCase().trim();
          let normalizedId = rawId.replace(/[-\s_]+/g, '_');
          
          if (normalizedId.includes('web') && (normalizedId.includes('dev') || normalizedId.includes('development'))) {
            normalizedId = 'web_dev';
          } else if (normalizedId.includes('python') && (normalizedId.includes('auto') || normalizedId.includes('automation'))) {
            normalizedId = 'python_automation';
          }

          if (!highestRanks[normalizedId] || rankValue > highestRanks[normalizedId].value) {
            highestRanks[normalizedId] = {
              id: normalizedId,
              name: SKILL_NAMES[normalizedId] || doc.id.replace(/_/g, ' ').toUpperCase(),
              rank: data.rank,
              value: rankValue
            };
          }
        }
      });
      
      setVerifiedSkills(Object.values(highestRanks));
    });
    
    return () => unsubscribe();
  }, [user]);

  // Hirer Redirection Logic (Hook must be at top)
  useEffect(() => {
    // Only redirect if onboarding is finished and they are in hirer mode
    if (viewMode === 'hirer' && profile?.onboardingComplete) {
      router.push('/hire');
    }
  }, [viewMode, profile, router]);

  // Handle the user's career path choice and persist to database
  const handleChoice = async (role: 'student' | 'client', data?: any) => {
    if (!user) return;
    
    try {
      const { updateProfile } = await import('firebase/auth');
      const userRef = doc(db, 'users', user.uid);
      const accountType = role === 'student' ? 'freelancer' : 'client';
      const targetViewMode = role === 'student' ? 'learner' : 'hirer';

      const updateData: any = {
        role: role,
        accountType: accountType,
        onboardingComplete: true,
        updatedAt: serverTimestamp()
      };

      // Update Auth Display Name if provided
      if (data?.name && data.name !== user.displayName) {
        await updateProfile(user, { displayName: data.name });
        updateData.displayName = data.name;
      }

      // Save respective profile data based on role
      if (role === 'student' && data) {
        updateData.profile = {
          name: data.name,
          location: data.location,
          university: data.university,
          degree: data.degree,
          portfolio: {
            github: data.github,
            behance: data.behance,
            linkedin: data.linkedin
          },
          interests: data.interests,
          skillLevel: data.skillLevel,
          availability: data.availability,
          experience: data.experience,
          setupAt: serverTimestamp()
        };
        updateData.bio = data.experience;
      } else if (role === 'client' && data) {
        updateData.profile = {
          location: data.location,
          company: data.company,
          setupAt: serverTimestamp()
        };
      }

      await setDoc(userRef, updateData, { merge: true });
      setViewMode(targetViewMode);
      console.log(`Onboarding complete for ${role}. Data synced.`);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const getRankStyles = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'professional':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'specialist':
        return 'bg-zinc-100/10 text-zinc-100 border-zinc-100/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]';
      case 'associate':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'apprentice':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  // --- Conditional Returns Section ---

  // 1. If loading auth state, show a clean background
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="animate-pulse text-zinc-800 font-bold tracking-[0.5em] uppercase text-xl">ARKA</div>
      </div>
    );
  }

  // 2. Determine if onboarding is truly complete for the current role
  // Admis bypass this block
  const isFreelancer = profile?.accountType === 'freelancer' || viewMode === 'learner';
  const hasThoroughProfile = profile?.profile?.interests?.length > 0 && profile?.profile?.degree;
  
  const showOnboarding = user && !isAdmin && (!profile || !profile.onboardingComplete || (isFreelancer && !hasThoroughProfile));
  if (showOnboarding) {
    return <OnboardingCrossroads onChoice={handleChoice} />;
  }

  // 3. If in Hirer mode, redirect to Hire Discovery page
  if (viewMode === 'hirer') {
    return null; // Prevent flicker before redirect
  }


  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 ease-out flex flex-col gap-8 max-w-6xl mx-auto w-full pb-10">
      {/* 1. Welcome Header */}
      <div className="flex flex-col gap-1.5 px-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'Student'}
          </h1>
          <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider italic">Verified Talent</span>
          </div>
        </div>
        <p className="text-zinc-400 font-medium tracking-wide">Learner &bull; Active Progress Track</p>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <div className="bg-[#0E0E0E] border border-zinc-800/80 rounded-3xl p-6 shadow-xl flex flex-col hover:border-zinc-700 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Earnings</span>
            <CreditCard className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="mt-auto">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-1 select-none">₹0.00</h2>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Secured Escrow</p>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-[#0E0E0E] border border-zinc-800/80 rounded-3xl p-6 shadow-xl flex flex-col hover:border-zinc-700 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Location</span>
            <MapPin className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="mt-auto">
            <h2 className="text-3xl font-black text-white tracking-tight mb-1">Hyderabad</h2>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">India &bull; UTC+5:30</p>
          </div>
        </div>

        {/* Skills Card */}
        <div className="bg-[#0E0E0E] border border-zinc-800/80 rounded-3xl p-6 shadow-xl flex flex-col hover:border-zinc-700 transition-colors group max-h-[160px] overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Your Skill Stack</span>
            <Target className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="mt-auto flex flex-wrap gap-2 overflow-y-auto scrollbar-hide py-1">
             {verifiedSkills.length > 0 ? (
               verifiedSkills.map((skill) => (
                 <div 
                   key={skill.id}
                   className={`flex flex-col gap-0.5 px-3 py-1.5 rounded-xl border transition-all hover:scale-105 ${getRankStyles(skill.rank)}`}
                 >
                   <span className="text-[9px] font-black uppercase tracking-tighter leading-none opacity-80">{skill.rank}</span>
                   <span className="text-[11px] font-bold leading-none whitespace-nowrap">{skill.name}</span>
                 </div>
               ))
             ) : (
               <span className="bg-zinc-900 border border-zinc-800 text-zinc-600 border-dashed px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest select-none">
                 No Ranks Earned
               </span>
             )}
             <Link href="/learn/web-dev" className="bg-zinc-900/40 hover:bg-zinc-800 border border-zinc-800/60 text-zinc-500 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center">
               +
             </Link>
          </div>
        </div>
      </div>

      {/* 3. Learning Progress Section */}
      <div className="bg-[#121212] border border-zinc-800/80 rounded-3xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Learning Progress</h2>
          <BookOpen className="w-7 h-7 text-amber-500" />
        </div>

        <div className="flex flex-col gap-6 mb-8">
          {/* Progress 1 */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-white">Web Development</span>
              <span className="text-zinc-400">60%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-white h-2.5 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* Progress 2 */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-white">Graphic Design</span>
              <span className="text-zinc-400">40%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-white h-2.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors w-fit">
          Continue Learning
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Suggested Gigs Section */}
      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-bold text-white tracking-tight">Suggested for You</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gig 1 */}
          <div className="flex flex-col bg-[#121212] border border-zinc-800/80 rounded-3xl p-6 hover:border-amber-500/30 transition-all shadow-xl group">
            <div className="flex items-center justify-between mb-5">
              <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                Beginner
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                <Clock className="w-4 h-4" />
                2 Days
              </div>
            </div>
            <div className="mb-3">
              <span className="text-3xl font-bold text-amber-500 tracking-tighter">₹500</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">Python Automation Script</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Create a simple python script to scrape data from a public directory and format it into CSV.
            </p>
            <Link 
              href="/gigs" 
              className="mt-auto flex items-center gap-1.5 text-sm font-bold text-white group-hover:text-amber-500 transition-colors pt-4 border-t border-zinc-800/80"
            >
              View Gig
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Gig 2 */}
          <div className="flex flex-col bg-[#121212] border border-zinc-800/80 rounded-3xl p-6 hover:border-amber-500/30 transition-all shadow-xl group">
            <div className="flex items-center justify-between mb-5">
              <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                Beginner
              </div>
               <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Flexible
              </div>
            </div>
            <div className="mb-3">
              <span className="text-3xl font-bold text-amber-500 tracking-tighter">₹1200</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">Social Media Design Pack</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Design 5 engaging social media posts for our upcoming tech event using Canva or Figma.
            </p>
            <Link 
              href="/gigs" 
              className="mt-auto flex items-center gap-1.5 text-sm font-bold text-white group-hover:text-amber-500 transition-colors pt-4 border-t border-zinc-800/80"
            >
              View Gig
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
