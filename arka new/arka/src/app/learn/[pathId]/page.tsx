'use client';

import React, { useState, use, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Laptop, CheckSquare, Award, Shield, Zap, Crown, Upload, ExternalLink,
  Palette, Clapperboard, BarChart2, PenTool, CalendarCheck, FileText, Code2, LineChart, Bot, Lock,
  Send, Sparkles, BookOpen, ExternalLink as LinkIcon, CheckCircle2, ArrowRight, RotateCcw
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import MilestoneGrader from '../../components/MilestoneGrader';
import CodeExecutionModal from '../../components/CodeExecutionModal';
import { SkillPathProvider, useSkillPath, buildMilestones } from '../../context/SkillPathContext';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

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

// Inner component — consumes the SkillPathContext store
function SkillPathDetailInner({ pathId }: { pathId: string }) {

  const [activeTab, setActiveTab] = useState<'milestones' | 'learning' | 'external'>('learning');
  const [activeRank, setActiveRank] = useState('apprentice');
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTaskIndex, setModalTaskIndex] = useState(0);

  // ── Central store ────────────────────────────────────────
  const { state: spState, initStore, setRoleLevel, setActiveMilestone, updateMilestoneStatus,
          syncFromFirestore, getCompletedCount, getProgressPct } = useSkillPath();

  // Derive milestone statuses map from the store (used by milestone rows)
  const milestoneStatuses: Record<string, string> = {};
  spState.milestones.forEach(m => { milestoneStatuses[m.id] = m.status; });

  // currentTasks now mirrors the store's milestones enriched with status
  const currentTasks = spState.initialized
    ? spState.milestones
    : (TASKS_BY_RANK[activeRank] || []).map((t, i) => ({ ...t, id: `${activeRank}_${i}`, status: 'incomplete', testCaseKey: activeRank }));
  
  // Fetch specific path configuration, or fallback cleanly
  const pathConfig = PATH_MAP[pathId] || PATH_MAP['web-dev'];
  const ActiveIcon = pathConfig.icon;
  const { user } = useAuth();

  const BACKEND = 'http://localhost:5001';

  // AI Chat state
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Welcome to **${pathConfig.title}**! I'm your AI instructor. Ask me anything about this skill path or your current milestone. 🎯`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // On mount: fetch progress + init session (silently fails if Flask not running)
  useEffect(() => {
    if (!user?.uid) return;
    const initSession = async () => {
      try {
        const progRes = await fetch(`${BACKEND}/api/progress/${user.uid}/${pathId}`);
        const progData = await progRes.json();

        const sessRes = await fetch(`${BACKEND}/api/session/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.uid,
            skill_id: pathId,
            milestone: progData.progress?.rank ?? 'apprentice',
          }),
        });
        const sessData = await sessRes.json();
        setSessionId(sessData.session_id);
      } catch {
        // Flask not running — grading + Firestore still work fine without it
        console.info('AI backend unavailable — grading will use client-side engine only.');
      }
    };
    initSession();
  }, [user, pathId]);

  // ── Real-time Firestore listener: hydrates + keeps the central store in sync ──
  useEffect(() => {
    if (!user?.uid) return;
    const skillKey = pathId.replace(/-/g, '_');
    const skillRef = doc(db, 'users', user.uid, 'skills', skillKey);

    const unsub = onSnapshot(skillRef, (snap) => {
      const firestoreStatuses: Record<string, string> = {};

      if (snap.exists()) {
        const data = snap.data();
        if (data.milestones) {
          Object.entries(data.milestones as Record<string, any>).forEach(([k, v]) => {
            firestoreStatuses[k] = v?.status ?? 'incomplete';
          });
        }
      }

      // Publish to ALL subscribers via the central store
      syncFromFirestore(firestoreStatuses);

      // Also (re-)initialize the store on first snapshot or rank change
      const tasks = TASKS_BY_RANK[activeRank] ?? [];
      const milestones = buildMilestones(activeRank, tasks, firestoreStatuses);
      initStore({
        activeSkillId: pathId,
        activeSkillKey: skillKey,
        currentRoleLevel: activeRank,
        milestones,
        activeMilestoneId: milestones.find(m => m.status !== 'completed')?.id ?? null,
      });
    });

    return () => unsub();
  }, [user, pathId, activeRank]);

  // Send message to Flask → Gemini → persist in Firestore
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${BACKEND}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: user?.uid,
          skill_id: pathId,
          message: userMsg,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Could not reach the AI backend. Make sure the Flask server is running on port 5001.'
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, sessionId, user, pathId]);

  // External links per path
  const EXTERNAL_LINKS: Record<string, { label: string; url: string }[]> = {
    'web-dev': [
      { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
      { label: 'The Odin Project', url: 'https://www.theodinproject.com' },
      { label: 'CSS Tricks', url: 'https://css-tricks.com' },
    ],
    'python': [
      { label: 'Python Docs', url: 'https://docs.python.org' },
      { label: 'Real Python', url: 'https://realpython.com' },
      { label: 'Automate the Boring Stuff', url: 'https://automatetheboringstuff.com' },
    ],
    'ai': [
      { label: 'Fast.ai', url: 'https://www.fast.ai' },
      { label: 'Hugging Face', url: 'https://huggingface.co' },
      { label: 'LangChain Docs', url: 'https://docs.langchain.com' },
    ],
    'cyber': [
      { label: 'OWASP', url: 'https://owasp.org' },
      { label: 'TryHackMe', url: 'https://tryhackme.com' },
      { label: 'HackTheBox', url: 'https://hackthebox.com' },
    ],
  };
  const currentLinks = EXTERNAL_LINKS[pathId] || [
    { label: 'Official Documentation', url: '#' },
    { label: 'Best Practices Guide', url: '#' },
    { label: 'Community Forum', url: '#' },
  ];

  // Current milestone — always the activeMilestoneId from the store
  const activeMilestone = spState.milestones.find(m => m.id === spState.activeMilestoneId)
    ?? spState.milestones[0]
    ?? null;
  // Index in the milestones array (needed to open the modal at the right task)
  const activeMilestoneIndex = spState.milestones.findIndex(m => m.id === spState.activeMilestoneId);
  const currentMilestone = activeMilestone;

  // ── Progress derived entirely from the store (reactive) ──────────────────
  const rankCompletedCount = getCompletedCount();
  const rankTaskTotal = spState.milestones.length || (TASKS_BY_RANK[activeRank] ?? []).length;
  const rankPct = getProgressPct();
  const circumference = 2 * Math.PI * 54;
  const ringOffset = circumference - (rankPct / 100) * circumference;

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
              <p className="text-zinc-500 font-medium tracking-wide">
                {rankCompletedCount} of {rankTaskTotal} milestones verified
              </p>
              <p className="text-xs text-zinc-600 mt-1 capitalize">{activeRank} rank</p>
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center shrink-0 z-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-800" />
                <circle
                  cx="64" cy="64" r="54"
                  stroke="currentColor" strokeWidth="10" fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                  className="text-accent drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] transition-all duration-700"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center mt-1">
                <span className="text-3xl font-bold text-accent leading-none mb-1">{rankPct}%</span>
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
                  // Live count from store for the displayed rank
                  const rankMilestones = spState.currentRoleLevel === rank.id
                    ? spState.milestones
                    : (TASKS_BY_RANK[rank.id] ?? []).map((t, i) => ({
                        ...t, id: `${rank.id}_${i}`,
                        status: milestoneStatuses[`${rank.id}_${i}`] ?? 'incomplete',
                      }));
                  const rankDone = rankMilestones.filter((m: any) => m.status === 'completed').length;
                  const rankTotal = rankMilestones.length;

                  return (
                    <button
                      key={rank.id}
                      onClick={() => {
                        setActiveRank(rank.id);
                        setRoleLevel(
                          rank.id,
                          buildMilestones(rank.id, TASKS_BY_RANK[rank.id] ?? [], milestoneStatuses)
                        );
                      }}
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
                      {/* Live counter driven by store */}
                      <span className="text-zinc-500 text-sm mt-1.5 font-medium">
                        {rankDone}/{rankTotal}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Render STRICTLY from the central store's milestones array */}
              <div className="flex flex-col gap-4 pb-10">
                {spState.milestones.length > 0 ? (
                  spState.milestones.map((milestone, idx) => {
                    const isCompleted = milestone.status === 'completed';
                    const isActive = spState.activeMilestoneId === milestone.id;

                    return (
                      <div
                        key={milestone.id}
                        className={`border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl relative transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : isActive
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : 'bg-zinc-900/30 border-zinc-800/60 hover:border-zinc-700/80'
                        }`}
                      >
                        {/* Status indicator */}
                        <div className="shrink-0 mt-1 md:mt-0">
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                          ) : isActive ? (
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-zinc-700 bg-zinc-950/50" />
                          )}
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h4 className="text-lg font-bold text-white">{milestone.title}</h4>
                            {isCompleted && (
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                Completed
                              </span>
                            )}
                            {isActive && !isCompleted && (
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{milestone.desc}</p>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Required files:</span>
                            {milestone.files.map((file, i) => (
                              <span key={i} className="bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[10px] px-2.5 py-1 rounded-md shadow-inner">
                                {file}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action — dispatches to store + switches tab */}
                        <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                          {isCompleted ? (
                            <button
                              onClick={() => {
                                setActiveMilestone(milestone.id);
                                setActiveTab('learning');
                              }}
                              className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors border border-zinc-700 hover:border-zinc-500"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Redo Task
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveMilestone(milestone.id);
                                setActiveTab('learning');
                              }}
                              className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-colors border border-zinc-700 hover:border-zinc-500"
                            >
                              Go to task <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 border border-zinc-800/50 rounded-2xl bg-zinc-900/20 border-dashed">
                    <p className="text-zinc-500">No tasks mapped to this rank yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">AI Teacher Workspace</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Left Column: Chat Interface (60%) */}
                <div className="lg:col-span-3 flex flex-col bg-zinc-900/30 border border-zinc-800/60 rounded-2xl overflow-hidden" style={{ minHeight: '520px' }}>
                  
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/60">
                    <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Arka AI Instructor</p>
                      <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
                        Online
                      </p>
                    </div>
                  </div>

                  {/* Messages Window */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 scroll-smooth">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${ msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && (
                          <div className="w-6 h-6 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                          </div>
                        )}
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-white text-black font-medium rounded-br-none'
                            : 'bg-zinc-800/80 text-zinc-200 border border-zinc-700/50 rounded-bl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="w-6 h-6 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                        </div>
                        <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Field */}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3 px-4 py-4 border-t border-zinc-800/60 bg-zinc-900/50">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask your AI instructor anything..."
                      className="flex-1 bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-xl flex items-center justify-center transition-all shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Right Column: Milestone + Links (40%) */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Current Milestone Panel — driven by store activeMilestoneId */}
                    <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Current Milestone</span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white mb-1">
                          {currentMilestone?.title || 'Module 1: Establish Core Setup'}
                        </h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          {currentMilestone?.desc || 'Set up your environment and initialize the required starter code.'}
                        </p>
                      </div>

                    {/* Mini progress bar */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-zinc-500">Level Progress</span>
                        <span className="text-amber-400">{rankCompletedCount} / {rankTaskTotal}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-700"
                          style={{ width: `${rankPct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-zinc-500 capitalize">{activeRank} Rank — Complete milestones to level up</p>
                    </div>

                      {/* Open Code Workspace — opens at active milestone index from store */}
                      {user?.uid && (
                        <button
                          onClick={() => {
                            setModalTaskIndex(Math.max(0, activeMilestoneIndex));
                            setIsModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm py-3 rounded-xl transition-colors mt-2"
                        >
                          <Sparkles className="w-4 h-4" /> Open Code Workspace
                        </button>
                      )}
                    </div>

                  {/* External Links Panel */}
                  <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Curated Resources</span>
                    </div>
                    {currentLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600 rounded-xl transition-all group"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
                        <span className="text-sm text-zinc-300 group-hover:text-white font-medium transition-colors">{link.label}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-600 ml-auto shrink-0" />
                      </a>
                    ))}
                  </div>

                </div>
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

      {/* Code Execution Modal — wired to the central SkillPath store */}
      {user?.uid && (
        <CodeExecutionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          skillId={pathId}
          skillKey={pathId.replace(/-/g, '_')}
          userId={user.uid}
          milestones={spState.milestones}
          initialTaskIndex={Math.max(0, activeMilestoneIndex)}
          activeRank={activeRank}
          onMilestoneComplete={async (milestoneId) => {
            // 1. Optimistic local update — store reflects complete instantly
            updateMilestoneStatus(milestoneId, 'completed');

            // 2. Persist rank advancement logic in Firestore
            if (!user?.uid) return;
            const skillKey = pathId.replace(/-/g, '_');
            const skillRef = doc(db, 'users', user.uid, 'skills', skillKey);
            
            // Get current statuses to check for rank-up
            const snap = await getDoc(skillRef);
            let currentStatuses: Record<string, string> = {};
            if (snap.exists()) {
              const data = snap.data();
              if (data.milestones) {
                Object.entries(data.milestones as Record<string, any>).forEach(([k, v]) => {
                  currentStatuses[k] = v?.status ?? 'incomplete';
                });
              }
            }
            // Add the just-completed milestone
            currentStatuses[milestoneId] = 'completed';

            // Check if all tasks in activeRank are done
            const tasksInRank = TASKS_BY_RANK[activeRank] || [];
            const allDone = tasksInRank.every((_, i) => currentStatuses[`${activeRank}_${i}`] === 'completed');

            if (allDone) {
              // Map rank ID to display name and potentially higher ranks logic
              // For simplicity, we assign the current activeRank as their official earned rank
              await setDoc(skillRef, {
                rank: activeRank,
                // We keep the milestone progress too
                milestones: Object.keys(currentStatuses).reduce((acc, k) => ({
                  ...acc,
                  [k]: { status: 'completed' }
                }), {})
              }, { merge: true });
              
              console.log(`Congratulations! You've officially earned the ${activeRank} rank in ${pathConfig.title}.`);
            }
          }}
          onNextMilestone={(nextId) => {
            // 2. Advance workspace context to next task
            setActiveMilestone(nextId);
          }}
        />
      )}
    </ProtectedRoute>
  );
}

// Page shell — wraps inner component with the SkillPathProvider
export default function SkillPathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
  const resolvedParams = use(params);
  const pathId = resolvedParams.pathId;
  return (
    <SkillPathProvider>
      <SkillPathDetailInner pathId={pathId} />
    </SkillPathProvider>
  );
}
