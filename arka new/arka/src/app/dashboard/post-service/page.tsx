'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusSquare, Sparkles, Megaphone, Target, ArrowRight, 
  AlertCircle, CheckCircle2, Loader2, IndianRupee, Clock,
  Award, Shield, Zap, Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

// Simple map of skill IDs to pretty names (matching PATH_MAP from learn page)
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

// Rank metadata
const RANK_LEVELS: Record<string, { label: string; minTasks: number }> = {
  'apprentice': { label: 'Apprentice', minTasks: 0 },
  'associate': { label: 'Associate', minTasks: 5 }, // 5 tasks in Apprentice completed
  'specialist': { label: 'Specialist', minTasks: 9 }, // 5 + 4
  'professional': { label: 'Professional', minTasks: 12 } // 5 + 4 + 3
};

interface UserSkill {
  id: string;
  name: string;
  completedCount: number;
  rank: 'apprentice' | 'associate' | 'specialist' | 'professional';
}

export default function PostServicePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // User skills from global state (Firestore)
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [price, setPrice] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  
  // Validation Error
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch User Skills and calculate Ranks
  useEffect(() => {
    if (!user) return;

    const fetchSkills = async () => {
      try {
        const skillsCol = collection(db, 'users', user.uid, 'skills');
        const snap = await getDocs(skillsCol);
        
        const fetchedSkills: UserSkill[] = [];
        
        snap.forEach((doc) => {
          const data = doc.data();
          const milestones = data.milestones || {};
          // Count completed milestones across all ranks
          const completedCount = Object.values(milestones).filter((m: any) => m.status === 'completed').length;
          
          // Determine rank based on total completed
          let rank: UserSkill['rank'] = 'apprentice';
          if (completedCount >= 12) rank = 'professional';
          else if (completedCount >= 9) rank = 'specialist';
          else if (completedCount >= 5) rank = 'associate';

          // skillId in Firestore uses _ (e.g. web_dev) but we map to - (e.g. web-dev)
          const skillId = doc.id.replace(/_/g, '-');
          
          fetchedSkills.push({
            id: skillId,
            name: SKILL_NAMES[skillId] || skillId,
            completedCount,
            rank
          });
        });

        setUserSkills(fetchedSkills);
      } catch (err) {
        console.error('Error fetching user skills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [user]);

  const selectedSkill = userSkills.find(s => s.id === selectedSkillId);
  const isApprentice = selectedSkill?.rank === 'apprentice';

  // Submission Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isApprentice || !selectedSkillId || !title || !description || !price || !deliveryTime) {
      setError('Please fill in all fields correctly.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'service_offerings'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous Student',
        title,
        description,
        deliveryTime: parseInt(deliveryTime),
        price: parseFloat(price),
        skillId: selectedSkillId,
        skillName: selectedSkill.name,
        skillRank: selectedSkill.rank,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to list service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center py-20 text-center gap-6">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="flex flex-col gap-2">
           <h2 className="text-3xl font-extrabold text-white tracking-tight">Service Listed Successfully!</h2>
           <p className="text-zinc-400 max-w-md mx-auto">Your service is now live in the ARKA marketplace and visible to potential hirers.</p>
        </div>
        <div className="flex gap-4 mt-4">
          <Link href="/dashboard" className="px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all">
            Return Home
          </Link>
          <button onClick={() => setSubmitted(false)} className="px-8 py-3.5 bg-white text-black font-bold rounded-2xl transition-all">
            Post Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 ease-out flex flex-col gap-8">
      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Post a Service</h1>
          <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
             <Sparkles className="w-3.5 h-3.5" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Marketplace</span>
          </div>
        </div>
        <p className="text-zinc-400 font-medium">Turn your verified skills into freelance income.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6 bg-[#0E0E0E] border border-zinc-800/80 rounded-3xl p-8 shadow-2xl">
           
           {/* Section 1: Skill Selection & Role Check */}
           <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px] font-black text-amber-500 border border-amber-500/20">1</div>
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Skill Category</h3>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
               <select 
                 value={selectedSkillId}
                 onChange={(e) => {
                   setSelectedSkillId(e.target.value);
                   setError(null);
                 }}
                 className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-amber-500/50 transition-all font-medium appearance-none cursor-pointer"
               >
                 <option value="" disabled>Select a skill path...</option>
                 {userSkills.map(s => (
                   <option key={s.id} value={s.id}>
                     {s.name} ({s.rank.charAt(0).toUpperCase() + s.rank.slice(1)})
                   </option>
                 ))}
                 {userSkills.length === 0 && <option disabled>No skill paths started yet...</option>}
               </select>

               {/* Role Validation Warning */}
               {isApprentice && (
                 <div className="animate-in slide-in-from-top-2 duration-300 flex items-start gap-4 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl">
                   <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                   <div className="flex flex-col gap-1">
                     <p className="text-sm font-bold text-red-500 leading-tight">Insufficient Rank</p>
                     <p className="text-xs text-zinc-400 leading-relaxed">
                       You must reach at least the <span className="text-white font-bold italic">Associate</span> level in this skill path to offer it as a service. Keep learning in the workspace to upgrade your rank!
                     </p>
                     <Link href={`/learn/${selectedSkillId}`} className="text-[10px] font-bold text-amber-500 underline underline-offset-4 mt-2 hover:text-amber-400 w-fit">
                       Continue Learning →
                     </Link>
                   </div>
                 </div>
               )}

               {!isApprentice && selectedSkill && (
                 <div className="animate-in slide-in-from-top-2 duration-300 flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                   <p className="text-xs font-medium text-emerald-400">
                     Verified <span className="capitalize">{selectedSkill.rank}</span> status detected. You are eligible to offer this service.
                   </p>
                 </div>
               )}
             </div>
           </div>

           {/* Section 2: Service Details */}
           <div className="flex flex-col gap-4 mt-4">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px] font-black text-amber-500 border border-amber-500/20">2</div>
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Service Overview</h3>
             </div>

             <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Service Title</label>
                 <input 
                   disabled={isApprentice || !selectedSkillId}
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   type="text" 
                   placeholder="e.g. I will build your custom landing page using React"
                   className={`bg-zinc-900/40 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-amber-500/50 transition-all font-medium ${isApprentice || !selectedSkillId ? 'opacity-50 cursor-not-allowed' : ''}`}
                 />
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Service Description</label>
                 <textarea 
                   disabled={isApprentice || !selectedSkillId}
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   rows={4}
                   placeholder="Briefly describe what you'll provide, your stack, and why you're a good fit..."
                   className={`bg-zinc-900/40 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-500/50 transition-all font-medium resize-none leading-relaxed ${isApprentice || !selectedSkillId ? 'opacity-50 cursor-not-allowed' : ''}`}
                 />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Delivery Time (Days)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        disabled={isApprentice || !selectedSkillId}
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        type="number" 
                        placeholder="3"
                        className={`w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl pl-11 pr-5 py-3.5 text-white outline-none focus:border-amber-500/50 transition-all font-medium ${isApprentice || !selectedSkillId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Starting Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">₹</span>
                      <input 
                        disabled={isApprentice || !selectedSkillId}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="number" 
                        placeholder="1500"
                        className={`w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl pl-11 pr-5 py-3.5 text-white outline-none focus:border-amber-500/50 transition-all font-medium ${isApprentice || !selectedSkillId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
               </div>
             </div>
           </div>

           {error && (
             <p className="text-red-500 text-xs font-bold px-1 animate-pulse">{error}</p>
           )}

           <button 
             disabled={isApprentice || !selectedSkillId || submitting}
             type="submit"
             className={`bg-white text-black font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all mt-6 shadow-[0_10px_30px_rgba(255,255,255,0.05)] ${isApprentice || !selectedSkillId || submitting ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
           >
             {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusSquare className="w-5 h-5" />}
             {submitting ? 'Processing...' : 'Publish Service Listing'}
           </button>
        </form>

        <div className="flex flex-col gap-6">
           <div className="bg-[#121212] border border-zinc-800/80 rounded-3xl p-6 flex flex-col gap-5">
             <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
               <Shield className="w-6 h-6 text-amber-500" />
             </div>
             <div className="flex flex-col gap-2">
               <h3 className="text-lg font-bold text-white tracking-tight">Verified Services</h3>
               <p className="text-sm text-zinc-400 leading-relaxed">
                 Only students who have reached <span className="text-white font-bold">Associate</span> status are eligible to post. This ensures a high quality bar for employers and better gigs for you.
               </p>
             </div>
           </div>

           <div className="bg-[#121212] border border-zinc-800/80 rounded-3xl p-6 flex flex-col gap-5">
             <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
               <IndianRupee className="w-6 h-6 text-blue-500" />
             </div>
             <div className="flex flex-col gap-2">
               <h3 className="text-lg font-bold text-white tracking-tight">Pricing Strategy</h3>
               <p className="text-sm text-zinc-400 leading-relaxed">
                 As an {selectedSkill?.rank || 'student'}, start with competitive pricing to build your rating. Professional ARKA badge holders can charge up to 300% more.
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
