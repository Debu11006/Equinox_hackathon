'use client';

import React from 'react';
import Link from 'next/link';
import { Target, Search, Briefcase, CheckCircle2 } from 'lucide-react';

export default function ExplorePage() {
  return (
    <div className="flex flex-col min-h-screen font-sans relative overflow-hidden bg-zinc-950 text-zinc-50 pt-32 pb-24 px-6 gap-20">
      {/* Background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto relative z-10 w-full mt-10">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6">Choose Your Path</h1>
        <p className="text-xl sm:text-2xl text-zinc-400">
          Whether you want to learn, find work, or hire talent.
        </p>
      </div>

      {/* Content Section: 3 Vertical Massive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Card 1: Learn */}
        <div className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10 hover:border-accent/40 hover:bg-zinc-900/80 transition-all duration-300 shadow-2xl group">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Target className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Learn</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed flex-grow">
            Master real-world skills through our proven milestone curriculum and build a verified portfolio.
          </p>
          <ul className="space-y-4 mb-10 flex-grow">
            {['Access premium knowledge tracks', 'Hands-on project milestones', 'Earn cryptographic skill badges'].map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-zinc-300 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
          <Link 
            href="/learn" 
            className="w-full py-4 bg-white text-black text-center rounded-xl font-bold hover:bg-zinc-200 transition-colors"
          >
            Start Learning
          </Link>
        </div>

        {/* Card 2: Seek (Find Work) */}
        <div className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10 hover:border-accent/40 hover:bg-zinc-900/80 transition-all duration-300 shadow-2xl relative group">
          <div className="absolute -top-4 inset-x-0 flex justify-center">
            <span className="bg-accent text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">Most Popular</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Search className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Find Work</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed flex-grow">
            Leverage your portfolio to land paid freelance gigs and internships from top businesses.
          </p>
          <ul className="space-y-4 mb-10 flex-grow">
            {['Access the exclusive Gig Feed', 'Apply directly to verified clients', 'Secure milestone-based payments'].map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-zinc-300 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
          <Link 
            href="/gigs" 
            className="w-full py-4 bg-white text-black text-center rounded-xl font-bold hover:bg-zinc-200 transition-colors"
          >
            Browse Gigs
          </Link>
        </div>

        {/* Card 3: Hire */}
        <div className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10 hover:border-accent/40 hover:bg-zinc-900/80 transition-all duration-300 shadow-2xl group">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Briefcase className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Hire Talent</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed flex-grow">
            Connect with pre-vetted, highly motivated talent ready to execute your critical projects.
          </p>
          <ul className="space-y-4 mb-10 flex-grow">
            {['Post projects instantly', 'Review mathematically verified portfolios', 'Risk-free execution via escrow'].map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-zinc-300 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
          <Link 
            href="/hire" 
            className="w-full py-4 bg-white text-black text-center rounded-xl font-bold hover:bg-zinc-200 transition-colors"
          >
            Discover Talent
          </Link>
        </div>

      </div>
    </div>
  );
}
