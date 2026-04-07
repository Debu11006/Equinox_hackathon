'use client';

import React, { useState } from 'react';
import { Star, Clock, ArrowRight } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute'; // assuming we protect gigs, if not it's fine
import Link from 'next/link';

const MOCK_GIGS = [
  {
    id: '1',
    level: 'Beginner',
    levelColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    duration: '2-3 days',
    price: '₹1500',
    title: 'Design 3 Instagram Posts',
    description: 'We need 3 engaging Instagram posts designed for an upcoming local coffee shop campaign highlighting our new seasonal drinks.',
    tags: ['Graphic Design', 'Canva'],
    clientName: 'Sample Client',
    clientRating: 5.0
  },
  {
    id: '2',
    level: 'Intermediate',
    levelColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    duration: '1 week',
    price: '₹5000',
    title: 'Build Landing Page',
    description: 'Create a responsive, high-converting landing page using React and Tailwind CSS for my new SaaS product launch.',
    tags: ['Web Development', 'React'],
    clientName: 'Tech Start',
    clientRating: 4.8
  },
  {
    id: '3',
    level: 'Advanced',
    levelColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    duration: '2 weeks',
    price: '₹12000',
    title: 'Python Web Scraper',
    description: 'Write a robust Python script to scrape e-commerce pricing data and save it directly to a CSV file on a nightly basis.',
    tags: ['Python', 'Automation'],
    clientName: 'DataCorp',
    clientRating: 4.9
  },
  {
    id: '4',
    level: 'Beginner',
    levelColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    duration: '1 day',
    price: '₹800',
    title: 'Proofread Blog Post',
    description: 'Need a native English speaker to proofread and lightly edit a 1000-word blog post about digital marketing.',
    tags: ['Writing', 'Editing'],
    clientName: 'ContentHaus',
    clientRating: 4.7
  },
  {
    id: '5',
    level: 'Intermediate',
    levelColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    duration: '3-4 days',
    price: '₹3500',
    title: 'Fix WordPress Bugs',
    description: 'Looking for a developer to fix some specific styling bugs on our WordPress site running Elementor.',
    tags: ['WordPress', 'CSS'],
    clientName: 'Local Agency',
    clientRating: 5.0
  },
  {
    id: '6',
    level: 'Advanced',
    levelColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    duration: '1 month',
    price: '₹25000',
    title: 'Full Stack Dashboard',
    description: 'Develop a full-stack dashboard for managing inventory. Must use Next.js, Tailwind, and Firebase.',
    tags: ['Next.js', 'Firebase'],
    clientName: 'MegaStore',
    clientRating: 4.9
  }
];

const FILTERS = ['All Gigs', 'Beginner', 'Intermediate', 'Advanced'];

export default function GigsPage() {
  const [activeFilter, setActiveFilter] = useState('All Gigs');

  const filteredGigs = MOCK_GIGS.filter(gig => {
    if (activeFilter === 'All Gigs') return true;
    return gig.level === activeFilter;
  });

  return (
    <div className="flex flex-col min-h-screen font-sans relative overflow-hidden bg-zinc-950 text-zinc-50 pt-32 pb-24 px-6 gap-10">
      {/* Background glow */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-amber-900/10 to-transparent pointer-events-none" />

      {/* Header Section */}
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">Available Gigs</h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Browse open freelance opportunities from verified clients. Apply directly to projects that match your current skill level and availability.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-8">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-zinc-100 text-black shadow-lg shadow-white/5'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Gigs Grid */}
      <div className="max-w-6xl mx-auto w-full relative z-10 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.map((gig) => (
            <div 
              key={gig.id} 
              className="flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-7 hover:bg-zinc-900/80 hover:border-accent/30 transition-all duration-300 shadow-xl group"
            >
              {/* Header: Level & Duration */}
              <div className="flex items-center justify-between mb-6">
                <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${gig.levelColor}`}>
                  {gig.level}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {gig.duration}
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-accent tracking-tighter">{gig.price}</span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-white mb-3 leading-tight">{gig.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {gig.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {gig.tags.map((tag, i) => (
                  <span key={i} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-md font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bottom: Client info & Apply */}
              <div className="flex items-center justify-between mt-auto pt-5 border-t border-zinc-800/80">
                <div>
                  <div className="text-sm font-bold text-white">{gig.clientName}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span className="text-xs text-zinc-400 font-medium">{gig.clientRating.toFixed(1)} Rating</span>
                  </div>
                </div>
                
                <Link 
                  href={`/gigs/${gig.id}`} 
                  className="flex items-center gap-1.5 text-sm font-bold text-white group-hover:text-accent transition-colors"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {filteredGigs.length === 0 && (
          <div className="text-center py-20 border border-zinc-800/80 border-dashed rounded-3xl bg-zinc-900/20">
            <h3 className="text-xl font-bold text-white mb-2">No gigs found</h3>
            <p className="text-zinc-400">There are currently no {activeFilter.toLowerCase()} gigs available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
