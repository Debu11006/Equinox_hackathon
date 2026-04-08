'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, ArrowRight, Plus, Terminal, Edit3, MonitorSmartphone, Code, Shield, Briefcase, X } from 'lucide-react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/navigation';

const FALLBACK_TALENT = [
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
];

export default function HireDiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    level: 'Apprentice',
    description: '',
    budget: '',
    timeline: '',
    timelineUnit: 'Days',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const router = useRouter();

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Gig Posted (to be saved to Firebase):', formData);
    setIsModalOpen(false);
    // Reset form
    setFormData({ 
      title: '', 
      category: 'Web Development', 
      level: 'Apprentice', 
      description: '', 
      budget: '', 
      timeline: '', 
      timelineUnit: 'Days',
      tags: [] 
    });
  };

  const inputClass = 'w-full bg-[#1A1A1A] border border-zinc-700 text-white rounded-xl px-4 py-3 placeholder:text-zinc-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'), limit(8));
        const snapshot = await getDocs(q);
        const studentsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            initial: data.displayName ? data.displayName.charAt(0).toUpperCase() : 'U',
            name: data.displayName || 'Unknown Student',
            location: data.location || 'Hyderabad',
            tags: data.skills || ['General'],
            projects: data.projectsCompleted || Math.floor(Math.random() * 5) + 1,
            learning: data.learningInProgress || Math.floor(Math.random() * 3) + 1,
            rating: data.rating || 5.0,
            earned: data.earned || `${Math.floor(Math.random() * 20)},000`,
          };
        });
        
        if (studentsData.length === 0) {
          setStudents(FALLBACK_TALENT);
        } else {
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents(FALLBACK_TALENT);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredTalent = students.filter(t => 
    t.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen font-sans relative overflow-hidden bg-[#0A0A0A] text-zinc-50 pt-16 pb-24 px-6 gap-10">
      
      {/* Background depth */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#0A0A0A] to-[#0A0A0A] pointer-events-none -z-10" />

      {/* Main Header & Search */}
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col items-center text-center mt-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-xl">
          Find Top Student Talent
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mb-10">
          Connecting businesses with skilled students in Hyderabad and beyond.
        </p>

        {/* Global Search Bar & Post Gig */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 px-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-amber-500" />
            </div>
            <input 
              type="text"
              placeholder="Search by skill (e.g., Python, Graphic Design, Content Writing)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121212] border-2 border-zinc-800 focus:border-amber-500 shadow-inner rounded-2xl py-5 pl-16 pr-6 text-white text-lg placeholder:text-zinc-500 outline-none transition-all focus:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            />
          </div>
        </div>

        {/* Quick Search Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="text-sm text-zinc-500 font-medium mr-2">Quick Search:</span>
          {['Python Backend', 'Web Development', 'Cyber Security', 'Graphic Design'].map((skill) => (
            <button 
              key={skill} 
              onClick={() => setSearchTerm(skill)}
              className="text-xs font-semibold text-white bg-zinc-800/80 hover:bg-zinc-700 px-3.5 py-2 rounded-full transition-colors border border-zinc-700/50"
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Post a Gig Card */}
        <div className="mt-8 w-full max-w-xs bg-[#111] border border-amber-500/40 rounded-2xl p-6 flex flex-col gap-3 shadow-xl text-left">
          <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center border border-zinc-700">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-bold text-white leading-snug">Need something specific?</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Post a milestone-based gig and let verified students apply directly to your project. Escrow protection included.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-1 w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-black font-bold py-3 px-5 rounded-xl transition-colors shadow-md"
          >
            Post a Gig <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explore by Category Section */}
      <div className="max-w-6xl mx-auto w-full relative z-10 mt-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Explore by Category</h2>
        
        {/* Horizontal scrollable row */}
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbar">
          {[
            { name: 'Development & IT', icon: Terminal, color: 'from-blue-500/10 to-blue-500/5', border: 'hover:border-blue-500/30' },
            { name: 'Design & Creative', icon: Edit3, color: 'from-pink-500/10 to-pink-500/5', border: 'hover:border-pink-500/30' },
            { name: 'Programming Tech', icon: Code, color: 'from-amber-500/10 to-amber-500/5', border: 'hover:border-amber-500/30' },
            { name: 'App Development', icon: MonitorSmartphone, color: 'from-emerald-500/10 to-emerald-500/5', border: 'hover:border-emerald-500/30' },
            { name: 'Cyber Security', icon: Shield, color: 'from-purple-500/10 to-purple-500/5', border: 'hover:border-purple-500/30' },
            { name: 'Business & Consulting', icon: Briefcase, color: 'from-rose-500/10 to-rose-500/5', border: 'hover:border-rose-500/30' },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.name}
                className={`shrink-0 w-64 snap-start cursor-pointer bg-gradient-to-br ${cat.color} bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 ${cat.border} transition-all group`}
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-white tracking-tight">
                  {cat.name}
                </h3>
              </div>
            )
          })}
        </div>
      </div>

      {/* Talent Discovery Grid */}
      <div className="max-w-6xl mx-auto w-full relative z-10 mt-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Featured Students</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full flex justify-center py-20">
               <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : filteredTalent.length > 0 ? (
            filteredTalent.map((talent) => (
              <div 
                key={talent.id} 
                className="flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 hover:bg-zinc-900/80 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)] transition-all duration-300 shadow-xl group"
              >
                {/* Top: Avatar & Info */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-black font-bold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 group-hover:animate-[pulse_2s_ease-in-out_infinite] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all">
                    {talent.initial}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-white leading-tight mb-1">{talent.name}</h3>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      {talent.location}
                    </div>
                    
                    {/* Tags Moved Up */}
                    <div className="flex flex-wrap gap-1.5">
                      {talent.tags.slice(0, 3).map((tag: string, i: number) => (
                        <span key={i} className="bg-[#121212] border border-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
                          {tag}
                        </span>
                      ))}
                      {talent.tags.length > 3 && (
                        <span className="bg-[#121212] border border-zinc-800 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          +{talent.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
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
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-lg font-bold text-white">{talent.rating}</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Rating</div>
                  </div>
                </div>

                {/* Bottom: Total Earned & Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-5 border-t border-zinc-800/20">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Total Earned</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-amber-500 font-bold text-lg">₹</span>
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
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-zinc-800/80 border-dashed rounded-3xl bg-zinc-900/20">
              <h3 className="text-xl font-bold text-white mb-2">No talent found</h3>
              <p className="text-zinc-400">Try adjusting your skill search or filters to find exactly what you need.</p>
            </div>
          )}
        </div>
      </div>

      {/* Post a Gig Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-[#121212] border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800/80">
              <div>
                <h2 className="text-xl font-bold text-white">Post a New Gig</h2>
                <p className="text-zinc-500 text-sm mt-0.5">Fill in the details below to find your student talent</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-5">
              
              {/* Gig Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-zinc-300">Gig Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Build a Python web scraper"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-semibold text-zinc-300">Category / Skill Path</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option>Web Development</option>
                  <option>Python Automation</option>
                  <option>Graphic Design</option>
                  <option>Content Writing</option>
                  <option>Data Analysis</option>
                  <option>AI Engineering</option>
                  <option>Cyber Security</option>
                  <option>Video Editing</option>
                </select>
              </div>

              {/* Tech Stack Tags Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-semibold text-zinc-300">Tech Stack / Specific Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg text-xs font-bold">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type a tag (e.g. React) and hit Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className={inputClass}
                />
              </div>

              {/* Level Alignment */}
              <div className="flex flex-col gap-2 text-left">
                <label className="text-sm font-semibold text-zinc-300">Minimum Role Required</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Apprentice', 'Associate', 'Specialist', 'Professional'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, level: lvl })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.level === lvl
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                          : 'bg-[#1A1A1A] border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Enhancements */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-semibold text-zinc-300">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Include project goals, specific deliverables, and any unique requirements. Use line breaks to format your requirements neatly..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputClass} resize-none leading-relaxed text-sm`}
                />
              </div>

              {/* Budget & Timeline */}
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-300">Budget (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g., 5000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-300">Expected Timeline</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g., 14"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className={`flex-1 ${inputClass} px-3`}
                    />
                    <select
                      value={formData.timelineUnit}
                      onChange={(e) => setFormData({ ...formData, timelineUnit: e.target.value })}
                      className={`w-24 bg-[#1A1A1A] border border-zinc-700 text-white rounded-xl px-2 outline-none focus:border-amber-500 transition-all text-xs font-bold cursor-pointer`}
                    >
                      <option>Days</option>
                      <option>Weeks</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-white hover:bg-amber-50 text-black font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Post Gig
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
