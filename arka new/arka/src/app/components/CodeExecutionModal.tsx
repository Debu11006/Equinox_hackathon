'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, RotateCcw, ChevronRight, Sparkles, CheckSquare, Zap, Timer, BarChart3, ArrowUpRight, Lock } from 'lucide-react';
import MilestoneGrader from './MilestoneGrader';
import type { MilestoneData } from '../context/SkillPathContext';

interface CodeExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillKey: string;
  userId: string;
  /** Full milestones array from the central store for this rank */
  milestones: MilestoneData[];
  /** Index of the milestone to open — should equal store's activeMilestoneIndex */
  initialTaskIndex: number;
  activeRank: string;
  /** Store dispatch: mark milestone completed in central state */
  onMilestoneComplete: (milestoneId: string) => void;
  /** Store dispatch: advance to next incomplete milestone */
  onNextMilestone: (currentMilestoneId: string) => void;
}

export default function CodeExecutionModal({
  isOpen,
  onClose,
  skillId,
  skillKey,
  userId,
  milestones,
  initialTaskIndex,
  activeRank,
  onMilestoneComplete,
  onNextMilestone,
}: CodeExecutionModalProps) {
  const [taskIndex, setTaskIndex] = useState(initialTaskIndex);
  const [modalState, setModalState] = useState<'coding' | 'success'>('coding');
  /** Increment to force MilestoneGrader to fully reset */
  const [resetKey, setResetKey] = useState(0);

  // Sync taskIndex if parent changes initialTaskIndex (store activeMilestone changed)
  useEffect(() => {
    setTaskIndex(initialTaskIndex);
    setModalState('coding');
    setResetKey(k => k + 1);
  }, [initialTaskIndex]);

  if (!isOpen) return null;

  const milestone = milestones[taskIndex];
  const milestoneId = milestone?.id ?? `${activeRank}_${taskIndex}`;
  const isLastTask = taskIndex >= milestones.length - 1;
  const completedCount = milestones.filter(m => m.status === 'completed').length;

  // ── Success: dispatches UPDATE_MILESTONE_STATUS to the store ───────────────
  const handleSuccess = () => {
    setModalState('success');
    onMilestoneComplete(milestoneId);   // → central store
  };

  // ── Next: find next incomplete in store, dispatch SET_ACTIVE_MILESTONE ─────
  const handleNextMilestone = () => {
    if (!isLastTask) {
      const nextIdx = taskIndex + 1;
      setTaskIndex(nextIdx);
      setModalState('coding');
      setResetKey(k => k + 1);
      // Advance the store's activeMilestoneId to the next milestone
      const nextMilestone = milestones[nextIdx];
      if (nextMilestone) onNextMilestone(nextMilestone.id);
    }
  };

  const handleRedo = () => {
    setModalState('coding');
    setResetKey(k => k + 1);
  };

  const handleClose = () => {
    setTaskIndex(initialTaskIndex);
    setModalState('coding');
    setResetKey(k => k + 1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/*
        Modal: 90vw wide, 85vh tall, strict flex-col so header stays docked
        at top and the grader body (flex-1) fills all remaining height.
      */}
      <div className="relative flex flex-col w-[90vw] h-[85vh] bg-[#0E0E0E] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-zinc-800/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Complete Milestone</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {milestone?.title ?? 'Milestone'}
            </h2>
            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">{milestone?.desc}</p>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 w-9 h-9 ml-4 flex items-center justify-center rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body (flex-1 — fills all remaining height, no scroll on container) ── */}
        <div className="flex-1 flex flex-col overflow-hidden px-7 py-5">

          {/* CODING STATE — grader stretches to fill the body */}
          {modalState === 'coding' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <MilestoneGrader
                skillId={skillId}
                milestoneId={milestoneId}
                userId={userId}
                skillKey={skillKey}
                onSuccess={handleSuccess}
                resetKey={resetKey}
              />
            </div>
          )}

          {/* SUCCESS STATE — flex-1 and scrollable to handle the breakdown details */}
          {modalState === 'success' && (
            <div className="flex-1 flex flex-col items-center text-center py-6 gap-6 overflow-y-auto scrollbar-hide">
              {/* Trophy */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.25)] animate-pulse">
                  <Trophy className="w-14 h-14 text-amber-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0E0E0E]">
                  <span className="text-white text-xs font-black">✓</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  Milestone Passed! 🎉
                </h3>
                <p className="text-zinc-400 text-base max-w-sm">
                  You've completed <span className="text-amber-400 font-bold">"{milestone?.title}"</span>. Your solution has been verified and saved.
                </p>
              </div>

              {/* Live progress pill — reads from store via milestones prop */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-sm font-bold">
                  {completedCount} / {milestones.length} milestones completed
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <button
                  onClick={handleRedo}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-300 hover:text-white font-bold text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Redo Milestone
                </button>

                {isLastTask ? (
                  <button
                    onClick={handleClose}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Trophy className="w-4 h-4" />
                    All Done — Close
                  </button>
                ) : (
                  <button
                    onClick={handleNextMilestone}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-sm transition-all shadow-lg"
                  >
                    Next Milestone
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ── Success Breakdown ────────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4 text-left">
                
                {/* Left Panel: Test Results */}
                <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Detailed Verification</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Syntax Check</span>
                      <span className="text-emerald-400 font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Logic Verification</span>
                      <span className="text-emerald-400 font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Edge Cases</span>
                      <span className="text-white font-bold">3 / 3 Handled</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Timer className="w-3 h-3" />
                        <span>Execution Time</span>
                      </div>
                      <span className="text-zinc-300 font-mono">24ms</span>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Momentum & Progression */}
                <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Momentum & Progression</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Reward</span>
                        <span className="text-lg font-black text-amber-400 tracking-tight">+50 XP</span>
                      </div>
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                        <BarChart3 className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                         <span>Role Progression</span>
                         <span className="text-white">Associate — 60%</span>
                       </div>
                       <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 w-[60%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.2)]" />
                       </div>
                    </div>

                    {!isLastTask && (
                      <div className="pt-2 border-t border-zinc-800/40">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Up Next</span>
                        <div className="flex items-center justify-between mt-1 group cursor-default">
                          <p className="text-xs text-zinc-300 font-bold line-clamp-1">{milestones[taskIndex + 1]?.title}</p>
                          <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
