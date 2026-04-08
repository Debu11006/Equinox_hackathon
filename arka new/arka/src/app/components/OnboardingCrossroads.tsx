import React, { useState, useEffect } from 'react';
import { 
  Rocket, Briefcase, Sparkles, ArrowRight, MapPin, GraduationCap, 
  Link as LinkIcon, FileText, Loader2, Palette, Globe,
  Code, Terminal, Layout, BarChart2, Brain, Shield, Clock, User, Check,
  Target, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OnboardingCrossroadsProps {
  onChoice: (role: 'student' | 'client', data?: any) => void;
}

const INTERESTS = [
  { id: 'frontend', name: 'Frontend Dev', icon: Code },
  { id: 'backend', name: 'Backend Dev', icon: Terminal },
  { id: 'uiux', name: 'UI/UX Design', icon: Layout },
  { id: 'data', name: 'Data Analysis', icon: BarChart2 },
  { id: 'ai', name: 'AI/ML Engineering', icon: Brain },
  { id: 'cyber', name: 'Cyber Security', icon: Shield },
];

export default function OnboardingCrossroads({ onChoice }: OnboardingCrossroadsProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'choice' | 'freelancer_profile' | 'client_profile'>('choice');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    location: '',
    university: '',
    degree: '',
    github: '',
    behance: '',
    linkedin: '',
    interests: [] as string[],
    skillLevel: 'Absolute Beginner',
    availability: '1-5 hrs',
    experience: '',
    company: '' 
  });

  // Sync name from auth on load
  useEffect(() => {
    if (user?.displayName && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.displayName || '' }));
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent, role: 'student' | 'client') => {
    e.preventDefault();
    if (role === 'student' && formData.interests.length === 0) {
      alert("Please select at least one area of interest!");
      return;
    }
    setLoading(true);
    onChoice(role, formData);
  };

  const toggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const inputClass = "w-full bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all";
  const labelClass = "text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-1.5";

  // --- 1. CHOICE SCREEN ---
  if (step === 'choice') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto py-10 px-4">
        <div className="max-w-4xl w-full flex flex-col items-center text-center gap-12">
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter max-w-2xl leading-tight">
              Welcome to <span className="text-amber-500">ARKA</span>. How would you like to use the platform?
            </h1>
            <p className="text-zinc-400 text-lg font-medium max-w-lg">
              Explore your professional path on the ultimate student freelancing network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            <button 
              onClick={() => setStep('freelancer_profile')}
              className="group relative flex flex-col items-start p-8 rounded-[2.5rem] bg-[#0E0E0E] border border-zinc-800/80 hover:border-amber-500/50 transition-all duration-500 text-left overflow-hidden shadow-2xl hover:shadow-[0_0_50px_rgba(245,158,11,0.1)] transform hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-16 -mt-16" />
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all duration-500">
                <Rocket className="w-7 h-7 text-zinc-400 group-hover:text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Learn & Freelance</h3>
              <p className="text-zinc-500 group-hover:text-zinc-300 transition-colors leading-relaxed mb-8">
                Master industry-vetted skills and build a portfolio through real projects.
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm font-bold text-amber-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                Get Started <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            <button 
              onClick={() => setStep('client_profile')}
              className="group relative flex flex-col items-start p-8 rounded-[2.5rem] bg-[#0E0E0E] border border-zinc-800/80 hover:border-blue-500/50 transition-all duration-500 text-left overflow-hidden shadow-2xl hover:shadow-[0_0_50px_rgba(59,130,246,0.1)] transform hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-16 -mt-16" />
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all duration-500">
                <Briefcase className="w-7 h-7 text-zinc-400 group-hover:text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Become a Client</h3>
              <p className="text-zinc-500 group-hover:text-zinc-300 transition-colors leading-relaxed mb-8">
                Post project requirements and hire pre-vetted freelance professionals.
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                Start Hiring <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. FREELANCER PROFILE SETUP ---
  if (step === 'freelancer_profile') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl overflow-y-auto py-12 px-4 animate-in zoom-in-95 duration-500">
        <div className="max-w-2xl w-full flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
               <Sparkles className="w-4 h-4" /> Professional Strategy
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              Build your Freelancer Identity
            </h1>
            <p className="text-zinc-500 text-sm">Tell us your background so we can prime your recommendation engine.</p>
          </div>

          <form onSubmit={(e) => handleProfileSubmit(e, 'student')} className="flex flex-col gap-10">
            
            {/* Section 1: The Basics */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Section 1: The Basics</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}><User className="w-3.5 h-3.5" /> Full Name</label>
                  <input required type="text" placeholder="Your display name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}><MapPin className="w-3.5 h-3.5" /> Location</label>
                  <input required type="text" placeholder="e.g. Hyderabad, India" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}><GraduationCap className="w-3.5 h-3.5" /> University / School</label>
                  <input required type="text" placeholder="e.g. IIT Madras" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}><GraduationCap className="w-3.5 h-3.5" /> Degree / Course</label>
                  <input required type="text" placeholder="e.g. B.Tech Computer Science" value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} className={inputClass} />
                </div>
              </div>

              {/* Portfolio Link Row */}
              <div className="flex flex-col gap-2">
                <label className={labelClass}><LinkIcon className="w-3.5 h-3.5" /> Portfolio Links (Optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative group">
                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                    <input type="url" placeholder="GitHub" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} className={`${inputClass} pl-9 text-xs`} />
                  </div>
                  <div className="relative group">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                    <input type="url" placeholder="LinkedIn" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} className={`${inputClass} pl-9 text-xs`} />
                  </div>
                  <div className="relative group">
                    <Palette className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600 group-focus-within:text-pink-500 transition-colors" />
                    <input type="url" placeholder="Behance" value={formData.behance} onChange={(e) => setFormData({...formData, behance: e.target.value})} className={`${inputClass} pl-9 text-xs`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Your Path */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Section 2: Your Path</h2>
              </div>

              {/* Interests Multi-Select */}
              <div className="flex flex-col gap-3">
                <label className={labelClass}><Target className="w-3.5 h-3.5" /> Areas of Interest (Select at least one)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INTERESTS.map((int) => {
                    const Icon = int.icon;
                    const isSelected = formData.interests.includes(int.id);
                    return (
                      <button
                        key={int.id}
                        type="button"
                        onClick={() => toggleInterest(int.id)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                          isSelected 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-zinc-600'}`} />
                        {int.name}
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 text-left">
                  <label className={labelClass}><Activity className="w-3.5 h-3.5" /> Current Skill Level</label>
                  <select 
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
                    className={`${inputClass} cursor-pointer appearance-none`}
                  >
                    <option>Absolute Beginner</option>
                    <option>I know the basics</option>
                    <option>Academic/Classroom experience</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className={labelClass}><Clock className="w-3.5 h-3.5" /> Weekly Availability</label>
                  <select 
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    className={`${inputClass} cursor-pointer appearance-none`}
                  >
                    <option>1-5 hrs</option>
                    <option>5-10 hrs</option>
                    <option>10-20 hrs</option>
                    <option>20+ hrs</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}><FileText className="w-3.5 h-3.5" /> Previous Exp. (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Briefly describe any cool projects you have built..."
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className={`${inputClass} resize-none text-sm`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.2)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Profile & Join as Freelancer <ArrowRight className="w-5 h-5" /></>}
              </button>
              <button onClick={() => setStep('choice')} type="button" className="text-zinc-600 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 text-center">Back to choices</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- 3. CLIENT PROFILE SETUP ---
  if (step === 'client_profile') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <div className="max-w-xl w-full flex flex-col gap-10 px-4">
          <div className="flex flex-col gap-2 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
               <Sparkles className="w-4 h-4" /> Client Workspace Setup
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              Basic Details
            </h1>
            <p className="text-zinc-500 text-sm">Just a few quick details to personalize your hiring experience.</p>
          </div>

          <form onSubmit={(e) => handleProfileSubmit(e, 'client')} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className={labelClass}><Briefcase className="w-3.5 h-3.5" /> Company / Organization Name</label>
              <input required type="text" placeholder="e.g. Acme Corp / Self" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className={inputClass} />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}><MapPin className="w-3.5 h-3.5" /> Your Primary Location</label>
              <input required type="text" placeholder="e.g. Hyderabad, India" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className={inputClass} />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-3 w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(59,130,246,0.2)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finish Setup & Start Hiring <ArrowRight className="w-5 h-5" /></>}
            </button>
            <button onClick={() => setStep('choice')} type="button" className="text-zinc-600 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 text-center">Back to choices</button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
