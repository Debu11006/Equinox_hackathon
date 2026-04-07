'use client';

import React from 'react';
import Link from 'next/link';
import { Laptop, Code2, LineChart, Bot, Lock, ArrowRight, Palette, Clapperboard, BarChart2, PenTool, CalendarCheck, FileText } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';

const DEVELOPMENT_PATHS = [
  {
    id: 'web-dev',
    title: 'Web Development',
    description: 'Build responsive websites and modern web applications matching industry standards.',
    icon: Laptop,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    completed: 0,
    total: 5,
  },
  {
    id: 'python',
    title: 'Python Automation',
    description: 'Automate tedious workflows, process large datasets, and build helpful scripts.',
    icon: Code2,
    iconColor: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    completed: 0,
    total: 5,
  },
  {
    id: 'data',
    title: 'Data Analysis',
    description: 'Analyze data sets to identify trends, create visualizations, and make data-driven decisions.',
    icon: LineChart,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
    completed: 0,
    total: 4,
  },
  {
    id: 'ai',
    title: 'AI Engineering',
    description: 'Build intelligent systems, integrate large language models, and utilize machine learning.',
    icon: Bot,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
    completed: 0,
    total: 6,
  },
  {
    id: 'cyber',
    title: 'Cyber Security',
    description: 'Protect networks securely, identify vulnerabilities, and ensure data integrity.',
    icon: Lock,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20',
    completed: 0,
    total: 5,
  }
];

const CREATIVE_PATHS = [
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    description: 'Create posters, social media designs, and branding assets',
    icon: Palette,
    iconColor: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
    borderColor: 'border-pink-400/20',
    completed: 0,
    total: 5,
  },
  {
    id: 'video-editing',
    title: 'Video Editing',
    description: 'Edit short videos and reels for maximum viewer engagement',
    icon: Clapperboard,
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    borderColor: 'border-indigo-400/20',
    completed: 0,
    total: 5,
  },
  {
    id: 'social-media',
    title: 'Social Media Management',
    description: 'Plan posts, track analytics, and boost audience engagement',
    icon: BarChart2,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    completed: 0,
    total: 5,
  }
];

const WRITING_PATHS = [
  {
    id: 'content-writing',
    title: 'Content Writing',
    description: 'Write blogs, captions, and high-converting product descriptions',
    icon: PenTool,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/20',
    completed: 0,
    total: 5,
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'Learn marketing basics, SEO, and targeted campaign strategies',
    icon: CalendarCheck,
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
    borderColor: 'border-rose-400/20',
    completed: 0,
    total: 5,
  },
  {
    id: 'technical-writing',
    title: 'Technical Writing',
    description: 'Create clear documentation, comprehensive guides, and tutorials',
    icon: FileText,
    iconColor: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    borderColor: 'border-teal-400/20',
    completed: 0,
    total: 5,
  }
];

function PathGrid({ title, paths }: { title: string, paths: any[] }) {
  return (
    <div className="mt-12 first:mt-10">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800/80 pb-4">
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => {
          const Icon = path.icon;
          return (
            <div 
              key={path.id} 
              className="flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 hover:bg-zinc-900/80 transition-colors shadow-xl group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${path.bgColor} ${path.borderColor} border`}>
                <Icon className={`h-6 w-6 ${path.iconColor}`} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{path.title}</h3>
              <p className="text-sm font-medium text-zinc-400 mb-6 flex-grow leading-relaxed">
                {path.description}
              </p>
              
              <div className="pt-2 mt-auto">
                <p className="text-xs font-bold text-zinc-500 tracking-wider uppercase mb-2">
                  {path.completed} of {path.total} completed
                </p>
                {/* Visual Progress Bar */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-6">
                  <div 
                    className="bg-accent h-full rounded-full transition-all" 
                    style={{ width: `${(path.completed / path.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <Link 
                href={`/learn/${path.id}`} 
                className="flex items-center gap-2 text-sm font-bold text-white hover:text-accent transition-colors"
              >
                Start Learning
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen font-sans relative overflow-hidden bg-zinc-950 text-zinc-50 pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="max-w-6xl mx-auto w-full relative z-10 mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">Learn & Grow</h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            Choose a skill path below to begin completing milestones. Unlock freelance opportunities as you prove your expertise.
          </p>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <PathGrid title="Development" paths={DEVELOPMENT_PATHS} />
          <PathGrid title="Creative" paths={CREATIVE_PATHS} />
          <PathGrid title="Writing & Marketing" paths={WRITING_PATHS} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
