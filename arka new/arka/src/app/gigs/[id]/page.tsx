'use client';

import React, { useState, useEffect, use } from 'react';
import { 
  ArrowLeft, Clock, Briefcase, MapPin, ShieldCheck, 
  Calendar, Star, CheckCircle2, Lock, ArrowRight,
  TrendingUp, IndianRupee, User, ExternalLink, Loader2,
  Sparkles, Award, Shield, Zap, Crown
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';

const TITLE_TO_ID: Record<string, string> = {
  'Web Development': 'web-dev',
  'Python Automation': 'python',
  'Data Analysis': 'data',
  'AI Engineering': 'ai',
  'Cyber Security': 'cyber',
  'Graphic Design': 'graphic-design',
  'Video Editing': 'video-editing',
  'Social Media Management': 'social-media',
  'Content Writing': 'content-writing',
  'Digital Marketing': 'digital-marketing',
  'Technical Writing': 'technical-writing'
};

const RANK_ICONS: Record<string, any> = {
  'Apprentice': Award,
  'Associate': Shield,
  'Specialist': Zap,
  'Professional': Crown
};

export default function GigDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  
  const [gig, setGig] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isQualified, setIsQualified] = useState(false);
  const [missingSkill, setMissingSkill] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Gig
        const gigRef = doc(db, 'gigs', id);
        const gigSnap = await getDoc(gigRef);
        
        if (!gigSnap.exists()) {
          router.push('/dashboard/browse-gigs');
          return;
        }
        
        const gigData = gigSnap.data();
        setGig(gigData);

        // 2. Fetch Client Info
        if (gigData.clientId) {
          const clientRef = doc(db, 'users', gigData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            setClient(clientSnap.data());
          }
        }

        // 3. Check Qualification
        if (user) {
          const skillPathId = TITLE_TO_ID[gigData.category] || 'web-dev';
          const skillKey = skillPathId.replace(/-/g, '_');
          const userSkillRef = doc(db, 'users', user.uid, 'skills', skillKey);
          const userSkillSnap = await getDoc(userSkillRef);
          
          if (userSkillSnap.exists()) {
            setIsQualified(true);
          } else {
            setMissingSkill(gigData.category);
          }
        }
      } catch (error) {
        console.error("Error fetching gig details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-zinc-500 font-medium">Loading Mission Briefing...</p>
        </div>
      </div>
    );
  }

  if (!gig) return null;

  const RankIcon = RANK_ICONS[gig.preferredRank] || Award;
  const pathId = TITLE_TO_ID[gig.category] || 'web-dev';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col gap-10">
          
          {/* Back Navigation */}
          <Link href="/dashboard/browse-gigs" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Gigs
          </Link>

          {/* 1. Hero Layout */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-zinc-800/50 pb-10">
            <div className="flex flex-col gap-6 max-w-3xl">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                {gig.title}
              </h1>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <RankIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-zinc-300">{gig.preferredRank}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-zinc-300">{gig.timeline} {gig.timelineUnit}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-zinc-300">{gig.category}</span>
                </div>
              </div>
            </div>

            {/* Total Budget Card */}
            <div className="lg:w-72">
              <div className="bg-[#111111] border border-amber-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Project Budget</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-6 h-6 text-emerald-400" />
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {Number(gig.budget).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600 mt-2 font-bold uppercase tracking-widest">Fixed Pricing &bull; Escrow Protected</p>
              </div>
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* 2. Mission Briefing (Left Column) */}
            <div className="lg:col-span-2 flex flex-col gap-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Mission Briefing</h2>
                </div>
                <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed space-y-4">
                  {gig.description.split('\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>

              {/* Readiness Radar */}
              <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-[32px] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Readiness Radar</h2>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    isQualified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {isQualified ? 'Mission Ready' : 'Skills Gap Detected'}
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Required Skill Matrix</p>
                    <div className="flex flex-wrap gap-4">
                      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${
                        isQualified 
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                      }`}>
                        {isQualified ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                        <span className="font-bold text-sm tracking-wide">{gig.category}</span>
                      </div>
                    </div>
                  </div>

                  {isQualified ? (
                    <button className="w-full sm:w-fit px-8 py-4 bg-white hover:bg-zinc-200 text-black font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                      Apply for this Gig
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="bg-[#1A1A1A] border border-zinc-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Sparkles className="w-7 h-7 text-amber-500" />
                      </div>
                      <div className="flex-grow text-center sm:text-left">
                        <h4 className="text-white font-bold mb-1">Bridge the Gap</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          You are missing required skills. Jump into the <span className="text-white font-bold">Start Learning</span> workspace to master <span className="text-amber-400 font-bold">{missingSkill}</span> and unlock this gig.
                        </p>
                      </div>
                      <Link 
                        href={`/learn/${pathId}`}
                        className="w-full sm:w-auto px-6 py-3 bg-zinc-100 hover:bg-white text-black font-bold text-xs rounded-xl transition-all whitespace-nowrap text-center"
                      >
                        Go to Learning Workspace
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* 3. Right Sidebar (Client Trust Card) */}
            <div className="flex flex-col gap-6">
              <div className="bg-[#0E0E0E] border border-zinc-800/80 rounded-[32px] p-8 flex flex-col gap-8 shadow-2xl h-fit sticky top-32">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Hirer Identity</h3>
                </div>

                <div className="flex flex-col items-center gap-5">
                  <div className="w-24 h-24 rounded-[32px] bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
                    {client?.photoURL ? (
                      <img src={client.photoURL} alt={gig.clientName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <User className="w-10 h-10 text-zinc-700" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{gig.clientName}</h3>
                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest leading-none">{gig.clientCompany}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t border-zinc-900">
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      Location
                    </div>
                    <span className="text-xs font-bold text-white">{client?.location || 'Global'}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      Client Rating
                    </div>
                    <span className="text-xs font-bold text-white">{client?.rating || 5.0}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      Member Since
                    </div>
                    <span className="text-xs font-bold text-white">
                      {client?.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                    </span>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Identity Verified</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Verified Payment & Business</p>
                  </div>
                </div>
              </div>

              {/* Share/Actions placeholder */}
              <button className="flex items-center justify-center gap-2 w-full py-4 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                <ExternalLink className="w-4 h-4" />
                Share this Briefing
              </button>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
