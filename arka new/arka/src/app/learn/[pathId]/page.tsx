'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Laptop, CheckSquare, Award, Shield, Zap, Crown, Circle, Upload, ExternalLink, PlayCircle, 
  Palette, Clapperboard, BarChart2, PenTool, CalendarCheck, FileText, Code2, LineChart, Bot, Lock 
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';

const PATH_MAP: Record<string, any> = {
  'web-dev': {
    title: 'Web Development',
    subtitle: 'Build basic websites and modern web applications.',
    icon: Laptop,
    gradient: 'from-blue-900/10',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    iconBorder: 'border-blue-500/20',
    shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]'
  },
  'python': {
    title: 'Python Automation',
    subtitle: 'Automate tedious workflows and process large datasets.',
    icon: Code2,
    gradient: 'from-yellow-900/10',
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
    iconBorder: 'border-yellow-500/20',
    shadow: 'shadow-[0_0_30px_rgba(250,204,21,0.15)]'
  },
  'data': {
    title: 'Data Analysis',
    subtitle: 'Analyze data sets to identify trends and make data-driven decisions.',
    icon: LineChart,
    gradient: 'from-emerald-900/10',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    iconBorder: 'border-emerald-500/20',
    shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]'
  },
  'ai': {
    title: 'AI Engineering',
    subtitle: 'Build intelligent systems and integrate large language models.',
    icon: Bot,
    gradient: 'from-purple-900/10',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    iconBorder: 'border-purple-500/20',
    shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]'
  },
  'cyber': {
    title: 'Cyber Security',
    subtitle: 'Protect networks securely, identify vulnerabilities, and ensure data integrity.',
    icon: Lock,
    gradient: 'from-red-900/10',
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10',
    iconBorder: 'border-red-500/20',
    shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]'
  },
  'graphic-design': {
    title: 'Graphic Design',
    subtitle: 'Create posters, social media designs, and branding assets.',
    icon: Palette,
    gradient: 'from-pink-900/10',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10',
    iconBorder: 'border-pink-500/20',
    shadow: 'shadow-[0_0_30px_rgba(236,72,153,0.15)]'
  },
  'video-editing': {
    title: 'Video Editing',
    subtitle: 'Edit short videos and reels for maximum viewer engagement.',
    icon: Clapperboard,
    gradient: 'from-indigo-900/10',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    iconBorder: 'border-indigo-500/20',
    shadow: 'shadow-[0_0_30px_rgba(99,102,241,0.15)]'
  },
  'social-media': {
    title: 'Social Media Management',
    subtitle: 'Plan posts, track analytics, and boost audience engagement.',
    icon: BarChart2,
    gradient: 'from-orange-900/10',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    iconBorder: 'border-orange-500/20',
    shadow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]'
  },
  'content-writing': {
    title: 'Content Writing',
    subtitle: 'Write blogs, captions, and high-converting product descriptions.',
    icon: PenTool,
    gradient: 'from-cyan-900/10',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    iconBorder: 'border-cyan-500/20',
    shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]'
  },
  'digital-marketing': {
    title: 'Digital Marketing',
    subtitle: 'Learn marketing basics, SEO, and targeted campaign strategies.',
    icon: CalendarCheck,
    gradient: 'from-rose-900/10',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    iconBorder: 'border-rose-500/20',
    shadow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]'
  },
  'technical-writing': {
    title: 'Technical Writing',
    subtitle: 'Create clear documentation, comprehensive guides, and tutorials.',
    icon: FileText,
    gradient: 'from-teal-900/10',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
    iconBorder: 'border-teal-500/20',
    shadow: 'shadow-[0_0_30px_rgba(20,184,166,0.15)]'
  }
};

const RANKS = [
  { id: 'apprentice', label: 'Apprentice', icon: Award, current: 0, total: 5 },
  { id: 'associate', label: 'Associate', icon: Shield, current: 0, total: 4 },
  { id: 'specialist', label: 'Specialist', icon: Zap, current: 0, total: 3 },
  { id: 'professional', label: 'Professional', icon: Crown, current: 0, total: 2 },
];

const TASKS_BY_RANK: Record<string, any[]> = {
  apprentice: [
    {
      title: 'Module 1: Establish Core Setup',
      desc: 'Set up your local environment and initialize the required starter code for this skill track.',
      files: ['setup.config', '.env']
    },
    {
      title: 'Module 2: Complete the fundamental concepts',
      desc: 'Follow the curriculum to implement the primary mechanics and structural patterns required.',
      files: ['core.js', 'styles.css']
    },
    {
      title: 'Module 3: End-of-rank project milestone',
      desc: 'Build out a complete mini-project showcasing your understanding of all prior modules.',
      files: ['project_submission.zip']
    }
  ],
  associate: [
    {
      title: 'Advanced Interactions',
      desc: 'Refactor your initial codebase to handle dynamic states and advanced edge cases safely.',
      files: ['state.ts', 'middleware.ts']
    }
  ],
  specialist: [
    {
      title: 'Enterprise Architecture',
      desc: 'Integrate the architecture into a production-grade routing framework.',
      files: ['layout.tsx', 'page.tsx']
    }
  ],
  professional: [
    {
      title: 'Client Ready Launch',
      desc: 'Secure your application and prepare the artifacts for a live client handover.',
      files: ['deploy.yml']
    }
  ]
};

export default function SkillPathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
  const resolvedParams = use(params);
  const pathId = resolvedParams.pathId;

  const [activeTab, setActiveTab] = useState<'milestones' | 'learning' | 'external'>('learning');
  const [activeRank, setActiveRank] = useState('apprentice');
  
  // Resolve current active configurations
  const currentTasks = TASKS_BY_RANK[activeRank] || [];
  
  // Fetch specific path configuration, or fallback cleanly
  const pathConfig = PATH_MAP[pathId] || PATH_MAP['web-dev'];
  const ActiveIcon = pathConfig.icon;

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen font-sans relative overflow-hidden bg-zinc-950 text-zinc-50 pt-32 pb-24 px-6">
        
        {/* Dynamic Background glow specific to the course */}
        <div className={`absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b ${pathConfig.gradient} to-transparent pointer-events-none`} />

        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col gap-10">
          
          {/* Back Navigation */}
          <Link href="/learn" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Skill Paths
          </Link>

          {/* Dynamic Title Block */}
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 ${pathConfig.iconBg} border ${pathConfig.iconBorder} rounded-2xl flex items-center justify-center ${pathConfig.shadow} shrink-0`}>
              <ActiveIcon className={`w-9 h-9 ${pathConfig.iconColor}`} />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2">{pathConfig.title}</h1>
              <p className="text-lg text-zinc-400">{pathConfig.subtitle}</p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="text-center sm:text-left z-10">
              <h2 className="text-3xl font-bold text-white mb-2">Your Progress</h2>
              <p className="text-zinc-500 font-medium tracking-wide">0 of 5 milestones verified</p>
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center shrink-0 z-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54}
                  className="text-accent drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center mt-1">
                <span className="text-3xl font-bold text-accent leading-none mb-1">0%</span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Complete</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 border-b border-zinc-800/80 -mt-2">
            <button 
              onClick={() => setActiveTab('learning')}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${
                activeTab === 'learning' ? 'text-white border-accent' : 'text-zinc-500 hover:text-zinc-400 border-transparent'
              }`}
            >
              Start learning
            </button>
            <button 
              onClick={() => setActiveTab('milestones')}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${
                activeTab === 'milestones' ? 'text-white border-accent' : 'text-zinc-500 hover:text-zinc-400 border-transparent'
              }`}
            >
              Milestones
            </button>
            <button 
              onClick={() => setActiveTab('external')}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${
                activeTab === 'external' ? 'text-white border-accent' : 'text-zinc-500 hover:text-zinc-400 border-transparent'
              }`}
            >
              External references
            </button>
          </div>

          {activeTab === 'milestones' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mt-2">
                <CheckSquare className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-bold text-white tracking-tight">Learning Milestones</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 mt-6">
                {RANKS.map((rank) => {
                  const RankIcon = rank.icon;
                  const isActive = activeRank === rank.id;
                  
                  return (
                    <button
                      key={rank.id}
                      onClick={() => setActiveRank(rank.id)}
                      className={`rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all ${
                        isActive 
                          ? 'bg-zinc-900/60 border border-accent/40 shadow-[0_0_20px_rgba(251,191,36,0.05)] opacity-100 scale-[1.02]' 
                          : 'bg-zinc-900/40 border border-zinc-800 opacity-60 hover:opacity-100 hover:bg-zinc-900'
                      }`}
                    >
                      <RankIcon className={`w-7 h-7 mb-3 ${isActive ? 'text-accent' : 'text-zinc-600'}`} />
                      <span className={`font-bold tracking-wide ${isActive ? 'text-accent' : 'text-zinc-500'}`}>
                        {rank.label}
                      </span>
                      <span className="text-zinc-500 text-sm mt-1.5 font-medium">
                        {rank.current}/{rank.total}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 pb-10">
                {currentTasks.length > 0 ? (
                  currentTasks.map((task, idx) => (
                    <div key={idx} className="bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700/80 transition-colors rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl relative group">
                      
                      <div className="shrink-0 mt-1 md:mt-0">
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors cursor-pointer bg-zinc-950/50" />
                      </div>

                      <div className="flex-grow">
                        <h4 className="text-lg font-bold text-white mb-1.5">{task.title}</h4>
                        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{task.desc}</p>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Required files:</span>
                          {task.files.map((file: string, i: number) => (
                            <span key={i} className="bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[10px] px-2.5 py-1 rounded-md shadow-inner">
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                        <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-accent/90 hover:bg-accent text-black font-bold text-sm px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-accent/10">
                          <Upload className="w-4 h-4" />
                          Upload Project
                        </button>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border border-zinc-800/50 rounded-2xl bg-zinc-900/20 border-dashed">
                    <p className="text-zinc-500">No tasks mapped to this rank yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
             <div className="animate-in fade-in duration-300 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-8 pb-10">
               <h3 className="text-2xl font-bold text-white mb-6">Curriculum Material</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 bg-zinc-950/50 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 cursor-pointer transition-colors group">
                       <PlayCircle className="w-10 h-10 text-zinc-600 group-hover:text-accent transition-colors" />
                       <div>
                         <h4 className="text-white font-bold">Video Module 0{i}</h4>
                         <p className="text-sm text-zinc-500">Core Concepts & Theory</p>
                       </div>
                    </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'external' && (
             <div className="animate-in fade-in duration-300 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-8 pb-10">
               <h3 className="text-2xl font-bold text-white mb-6">Documentation Links</h3>
               <ul className="space-y-4">
                 {['Official Documentation', 'Best Practices Guide', 'Community Forums'].map((doc, i) => (
                    <li key={i}>
                      <a href="#" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group">
                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-accent" />
                        <span className="font-medium underline decoration-zinc-800 underline-offset-4 group-hover:decoration-zinc-500">{doc}</span>
                      </a>
                    </li>
                 ))}
               </ul>
             </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
