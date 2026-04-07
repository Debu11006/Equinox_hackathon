import React from 'react';
import { GigDocument } from '../types';
import { Clock, DollarSign, Send } from 'lucide-react';

interface GigCardProps {
  gig: GigDocument;
  onApply?: (gigId: string) => void;
}

export default function GigCard({ gig, onApply }: GigCardProps) {
  // Format the date if it's a Firestore Timestamp or normal Date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    // If it's a Firestore Timestamp, it has toDate()
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-6 shadow-xl transition hover:bg-zinc-900/60 hover:border-zinc-700/50 group">
      
      {/* Header element: Title & Budget */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-semibold text-lg text-zinc-100 leading-tight group-hover:text-blue-400 transition-colors">
          {gig.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm">
          <DollarSign className="h-3.5 w-3.5" />
          <span>{gig.budget.toLocaleString()}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400 leading-relaxed mb-5 line-clamp-3 flex-grow">
        {gig.description}
      </p>

      {/* Skills / Tags */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {gig.skillsRequired?.map((skill, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md text-xs font-medium border border-zinc-700/50"
            >
              {skill}
            </span>
          ))}
          {(!gig.skillsRequired || gig.skillsRequired.length === 0) && (
            <span className="text-xs text-zinc-600 italic">No specific skills listed</span>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center text-xs text-zinc-500 gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Posted {formatDate(gig.createdAt)}</span>
        </div>
        
        <button 
          onClick={() => onApply?.(gig.id as string)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
          Apply
        </button>
      </div>
    </div>
  );
}
