'use client';

import React from 'react';
import { useAuth } from './context/AuthContext';
import { Star, ArrowRight, Box, Clock, CheckSquare, Layers, ShieldCheck, Check } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen font-sans relative overflow-hidden">
      {/* Background glow for hero */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-zinc-800/20 via-zinc-900/10 to-transparent pointer-events-none" />

      {/* Hero Section (Publicly Visible) */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 px-6 text-center max-w-5xl mx-auto z-10 w-full mt-10">
        <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-white mb-6">ARKA</h1>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-200 mb-6">
          Your First Step into the Real World
        </h2>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Learn the world's most in-demand skills and get paid for real-world projects. Your location is no longer a limit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link 
            href="/signup" 
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-white text-black rounded-xl font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
          >
            <Star className="h-5 w-5 fill-current" />
            Start Your Journey
          </Link>
          <Link 
            href={user ? "/profile" : "/login"} 
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-transparent border border-zinc-700 text-white rounded-xl font-semibold hover:bg-zinc-900 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-zinc-800/80 pt-16">
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-sm flex flex-col items-center justify-center text-center shadow-xl hover:bg-zinc-900/60 transition-colors">
            <Box className="h-8 w-8 text-accent mb-4" />
            <span className="text-4xl font-bold text-white tracking-tight mb-2">11+</span>
            <span className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Skill Paths</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-sm flex flex-col items-center justify-center text-center shadow-xl hover:bg-zinc-900/60 transition-colors">
            <Clock className="h-8 w-8 text-accent mb-4" />
            <span className="text-4xl font-bold text-white tracking-tight mb-2">500+</span>
            <span className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Active Gigs</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-sm flex flex-col items-center justify-center text-center shadow-xl hover:bg-zinc-900/60 transition-colors">
            <CheckSquare className="h-8 w-8 text-accent mb-4" />
            <span className="text-4xl font-bold text-white tracking-tight mb-2">100%</span>
            <span className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Secure</span>
          </div>
        </div>
      </div>

      {/* --- NEW SECTION: WHAT IS ARKA? --- */}
      <div className="mt-32 max-w-5xl mx-auto w-full px-6 z-10 relative">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-6">What is ARKA?</h3>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            ARKA is a milestone-based, skill-building platform that connects professional freelancers with real-world business opportunities. We bridge the gap between education and global professional execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl">
            <Layers className="h-10 w-10 text-accent mb-6" />
            <h4 className="text-xl font-bold text-white mb-3">Learn by Doing</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">Master modern skills by completing hands-on milestones, not just watching videos.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl">
            <ShieldCheck className="h-10 w-10 text-accent mb-6" />
            <h4 className="text-xl font-bold text-white mb-3">Verified Portfolio</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">Every milestone you finish mathematically builds a public, cryptographically-secure portfolio.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl">
            <Clock className="h-10 w-10 text-accent mb-6" />
            <h4 className="text-xl font-bold text-white mb-3">Earn While Learning</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">Instantly unlock paid gig opportunities from real startups once you prove your competency.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-10 shadow-2xl">
          <div>
            <h4 className="text-2xl font-bold text-white mb-6">For Freelancers</h4>
            <ul className="space-y-4">
              {['Build a professional validated resume', 'Access global clients immediately', 'Get paid securely on finishing gigs'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/20 p-1 rounded-full"><Check className="h-3 w-3 text-accent" /></div>
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pl-0 md:pl-10 md:border-l border-zinc-800/80 mt-10 md:mt-0">
            <h4 className="text-2xl font-bold text-white mb-6">For Clients</h4>
            <ul className="space-y-4">
              {['Hire pre-vetted, highly motivated talent', 'Cost-effective project execution', 'Completely managed workflow escrow'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/20 p-1 rounded-full"><Check className="h-3 w-3 text-accent" /></div>
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* --- NEW SECTION: HOW ARKA WORKS --- */}
      <div className="mt-32 max-w-5xl mx-auto w-full px-6 border-t border-zinc-800/80 pt-32 mb-32 z-10 relative">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">How Arka Works</h3>
          <p className="text-lg text-zinc-400">Two sides of the marketplace, working in perfect harmony.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column (Freelancers) */}
          <div>
            <h4 className="text-3xl font-bold text-white mb-8">Build Your Professional Identity</h4>
            <div className="space-y-8 mb-12">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center">1</div>
                <div>
                  <h5 className="text-lg font-bold text-white mb-1">Choose Path</h5>
                  <p className="text-zinc-400">Select a skill track like development or design.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center">2</div>
                <div>
                  <h5 className="text-lg font-bold text-white mb-1">Complete Milestones</h5>
                  <p className="text-zinc-400">Build interactive assignments to prove knowledge.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent text-black font-bold flex items-center justify-center">3</div>
                <div>
                  <h5 className="text-lg font-bold text-white mb-1">Take Real Projects</h5>
                  <p className="text-zinc-400">Unlock the freelancer feed and earn money directly.</p>
                </div>
              </div>
            </div>

            {/* Progress Cards Graphic */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative shadow-xl">
              <div className="absolute -top-4 -right-4 bg-accent text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">Level Up!</div>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-semibold">Graphic Design</span>
                  <span className="text-accent font-mono font-bold">80%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[80%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-semibold">Web Development</span>
                  <span className="text-accent font-mono font-bold">45%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[45%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Clients) */}
          <div>
            <h4 className="text-3xl font-bold text-white mb-8">Discover Professional Talent</h4>
            <div className="space-y-8 mb-12">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center">1</div>
                <div>
                  <h5 className="text-lg font-bold text-white mb-1">Browse Freelancers</h5>
                  <p className="text-zinc-400">View mathematically verified talent portfolios.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center">2</div>
                <div>
                  <h5 className="text-lg font-bold text-white mb-1">Post Projects</h5>
                  <p className="text-zinc-400">List freelance gigs matching your budget.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent text-black font-bold flex items-center justify-center">3</div>
                <div>
                  <h5 className="text-lg font-bold text-white mb-1">Hire with Confidence</h5>
                  <p className="text-zinc-400">Know exactly what skills the freelancer brings.</p>
                </div>
              </div>
            </div>

            {/* Profile Cards Graphic */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex-1 flex items-center gap-4 hover:border-accent/50 transition-colors shadow-xl cursor-default">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">PS</div>
                <div>
                  <h6 className="text-white font-bold">Priya Sharma</h6>
                  <p className="text-accent text-xs uppercase tracking-wide">Full Stack Dev</p>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex-1 flex items-center gap-4 hover:border-accent/50 transition-colors shadow-xl cursor-default -mt-2 sm:mt-8">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">RV</div>
                <div>
                  <h6 className="text-white font-bold">Rahul Verma</h6>
                  <p className="text-accent text-xs uppercase tracking-wide">UX Designer</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
