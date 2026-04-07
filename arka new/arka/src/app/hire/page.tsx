'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, MapPin, Star, ArrowRight } from 'lucide-react';

const MOCK_TALENT = [
  {
    id: '1',
    initial: 'P',
    name: 'Priya Sharma',
    location: 'Rural Bihar',
    tags: ['Full Stack', 'Node.js', 'React', 'MongoDB'],
    projects: 2,
    learning: 3,
    rating: 5.0,
    earned: '6,000',
  },
  {
    id: '2',
    initial: 'R',
    name: 'Rahul Verma',
    location: 'Lucknow, UP',
    tags: ['UI/UX', 'Figma', 'Webflow', 'Tailwind'],
    projects: 5,
    learning: 1,
    rating: 4.9,
    earned: '15,500',
  },
  {
    id: '3',
    initial: 'S',
    name: 'Sanya Gupta',
    location: 'Indore, MP',
    tags: ['Python', 'Data Scraping', 'Pandas'],
    projects: 1,
    learning: 4,
    rating: 4.8,
    earned: '3,200',
  },
  {
    id: '4',
    initial: 'A',
    name: 'Amit Patel',
    location: 'Surat, Gujarat',
    tags: ['Graphic Design', 'Adobe CC', 'Canva'],
    projects: 8,
    learning: 2,
    rating: 5.0,
    earned: '22,000',
  },
  {
    id: '5',
    initial: 'K',
    name: 'Karthik N.',
    location: 'Madurai, TN',
    tags: ['Cyber Security', 'Network Admin'],
    projects: 3,
    learning: 5,
    rating: 4.7,
    earned: '8,500',
  },
  {
    id: '6',
    initial: 'M',
    name: 'Meera Deshmukh',
    location: 'Pune, MH',
    tags: ['React Native', 'Mobile Apps'],
    projects: 4,
    learning: 1,
    rating: 4.9,
    earned: '18,000',
  }
];

export default function DiscoverTalentPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTalent = MOCK_TALENT.filter(t => 
    t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen font-sans relative overflow-hidden bg-zinc-950 text-zinc-50 pt-32 pb-24 px-6 gap-10">
      {/* Background glow */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />

      {/* Header Section */}
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">Discover Talented Students</h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Instantly connect with highly motivated, mathematically pre-vetted talent. Search by the exact skills your business needs.
        </p>

        {/* Search & Filters Bar */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 mt-10 shadow-2xl">
          {/* Skill Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by Skill (e.g. React, Python)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 transition-colors" 
            />
          </div>
          
          {/* Region Dropdown */}
          <div className="relative md:w-48 shrink-0">
            <select className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3.5 px-4 text-white appearance-none focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
              <option>All Regions</option>
              <option>North India</option>
              <option>South India</option>
              <option>East India</option>
              <option>West India</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          </div>

          {/* Experience Level Dropdown */}
          <div className="relative md:w-56 shrink-0">
            <select className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3.5 px-4 text-white appearance-none focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
              <option>Any Experience Level</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Freelancers Grid */}
      <div className="max-w-6xl mx-auto w-full relative z-10 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalent.map((talent) => (
            <div 
              key={talent.id} 
              className="flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 hover:bg-zinc-900/80 hover:border-accent/30 transition-all duration-300 shadow-xl group"
            >
              {/* Top: Avatar & Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-accent text-black font-bold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
                  {talent.initial}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight mb-1">{talent.name}</h3>
                  <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {talent.location}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {talent.tags.map((tag, i) => (
                  <span key={i} className="bg-zinc-800/80 text-zinc-300 text-[11px] px-2.5 py-1 rounded-md font-semibold tracking-wide uppercase">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats Grid (3 Columns) */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-zinc-950/80 rounded-xl p-3 text-center border border-zinc-800/50 flex flex-col items-center justify-center">
                  <div className="text-lg font-bold text-white mb-0.5">{talent.projects}</div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Projects</div>
                </div>
                <div className="bg-zinc-950/80 rounded-xl p-3 text-center border border-zinc-800/50 flex flex-col items-center justify-center">
                  <div className="text-lg font-bold text-white mb-0.5">{talent.learning}</div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Learning</div>
                </div>
                <div className="bg-zinc-950/80 rounded-xl p-3 text-center border border-zinc-800/50 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Star className="h-3 w-3 text-accent fill-accent" />
                    <span className="text-lg font-bold text-white">{talent.rating}</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Rating</div>
                </div>
              </div>

              {/* Bottom: Total Earned & Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-5 border-t border-zinc-800/80">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Total Earned</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-accent font-bold text-lg">₹</span>
                    <span className="text-xl font-bold text-white tracking-tight">{talent.earned}</span>
                  </div>
                </div>
                
                <Link 
                  href={`/hire/${talent.id}`} 
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors w-full sm:w-auto"
                >
                  View Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredTalent.length === 0 && (
          <div className="text-center py-20 border border-zinc-800/80 border-dashed rounded-3xl bg-zinc-900/20 mt-6">
            <h3 className="text-xl font-bold text-white mb-2">No talent found</h3>
            <p className="text-zinc-400">Try adjusting your skill search or filters to find exactly what you need.</p>
          </div>
        )}
      </div>
    </div>
  );
}
