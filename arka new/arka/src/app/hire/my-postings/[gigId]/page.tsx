'use client';

import React, { useEffect, useState, use } from 'react';
import {
  ArrowLeft, Star, MapPin, MessageSquare, CheckCircle2,
  XCircle, Loader2, User, Briefcase, Clock, IndianRupee,
  Award, Shield, Zap, Crown, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getOrCreateConversation, buildConversationId } from '../../../lib/messaging';

// Map rank to icon
const RANK_ICONS: Record<string, any> = {
  apprentice: Award,
  associate: Shield,
  specialist: Zap,
  professional: Crown,
};

const RANK_STYLES: Record<string, string> = {
  apprentice: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  associate: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  specialist: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  professional: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

// ─── Applicant card ───────────────────────────────────────────────────────────
function ApplicantCard({
  applicant,
  onMessage,
  messaging,
}: {
  applicant: any;
  onMessage: (applicant: any) => void;
  messaging: string | null; // uid currently being messaged
}) {
  const rankKey = applicant.rank?.toLowerCase() ?? 'apprentice';
  const RankIcon = RANK_ICONS[rankKey] ?? Award;
  const rankStyle = RANK_STYLES[rankKey] ?? RANK_STYLES.apprentice;

  return (
    <div className="bg-[#111111] border border-zinc-800/80 hover:border-zinc-700 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 transition-all shadow-xl group">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
          {applicant.photoURL ? (
            <img src={applicant.photoURL} alt={applicant.displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-black text-zinc-500">
              {applicant.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-white">{applicant.displayName ?? 'Unknown Freelancer'}</h3>
          {/* Rank badge */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${rankStyle}`}>
            <RankIcon className="w-3 h-3" />
            {applicant.rank ?? 'Apprentice'}
          </div>
        </div>
        <p className="text-xs text-zinc-500 font-medium mb-2">{applicant.title ?? 'Freelancer'}</p>

        <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          {applicant.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {applicant.location}
            </span>
          )}
          {applicant.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {applicant.rating}
            </span>
          )}
        </div>

        {/* Skill tags */}
        {applicant.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {applicant.skills.slice(0, 5).map((s: string) => (
              <span key={s} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md text-[10px] font-medium">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-2 shrink-0">
        {/* Message */}
        <button
          onClick={() => onMessage(applicant)}
          disabled={messaging === applicant.id}
          className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-amber-500/10 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-wait min-w-[130px]"
        >
          {messaging === applicant.id ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
          Message
        </button>

        {/* Accept */}
        <button className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-bold text-xs px-4 py-2.5 rounded-xl transition-all min-w-[130px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Accept
        </button>

        {/* Decline */}
        <button className="flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500/60 hover:text-red-400 font-bold text-xs px-4 py-2.5 rounded-xl transition-all min-w-[130px]">
          <XCircle className="w-3.5 h-3.5" />
          Decline
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageGigPage({ params }: { params: Promise<{ gigId: string }> }) {
  const { gigId } = use(params);
  const { user, profile } = useAuth();
  const router = useRouter();

  const [gig, setGig] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState<string | null>(null); // applicant uid being clicked

  // ── Fetch gig + mock applicants ──────────────────────────────────────────────
  useEffect(() => {
    if (!gigId) return;

    const fetchData = async () => {
      try {
        // 1. Fetch the gig document
        const gigSnap = await getDoc(doc(db, 'gigs', gigId));
        if (!gigSnap.exists()) { router.push('/hire/my-postings'); return; }
        const gigData = { id: gigSnap.id, ...gigSnap.data() };
        setGig(gigData);

        // 2. Fetch applicants: query the 'applications' sub-collection first
        //    Fall back to fetching all freelancers as a hackathon demo if empty
        try {
          const appSnap = await getDocs(collection(db, 'gigs', gigId, 'applications'));
          if (!appSnap.empty) {
            const uids = appSnap.docs.map((d) => d.data().freelancerId).filter(Boolean);
            const profiles = await Promise.all(
              uids.map((uid: string) => getDoc(doc(db, 'users', uid)))
            );
            setApplicants(
              profiles
                .filter((p) => p.exists())
                .map((p) => ({ id: p.id, ...p.data() }))
            );
          } else {
            // Demo: fetch up to 5 freelancers as placeholder applicants
            const q = query(collection(db, 'users'), where('accountType', '==', 'freelancer'));
            const snap = await getDocs(q);
            setApplicants(snap.docs.slice(0, 5).map((d) => ({ id: d.id, ...d.data() })));
          }
        } catch {
          setApplicants([]);
        }
      } catch (err) {
        console.error(err);
        router.push('/hire/my-postings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gigId, router]);

  // ── Message student handler ──────────────────────────────────────────────────
  const handleMessage = async (applicant: any) => {
    if (!user) return;
    setMessaging(applicant.id);

    try {
      // Build names / photos for conversation metadata
      const clientName = profile?.displayName ?? user.displayName ?? 'Client';
      const clientPhoto = profile?.photoURL ?? user.photoURL ?? '';
      const freelancerName = applicant.displayName ?? 'Freelancer';
      const freelancerPhoto = applicant.photoURL ?? '';

      // getOrCreateConversation is idempotent — safe to call every time
      const convId = await getOrCreateConversation(
        user.uid,
        applicant.id,
        clientName,
        freelancerName,
        clientPhoto,
        freelancerPhoto
      );

      // Route to /dashboard/messages with the conversation pre-selected
      router.push(`/dashboard/messages?conv=${convId}`);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setMessaging(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!gig) return null;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-20 animate-in fade-in zoom-in-95 duration-500 ease-out">

      {/* Back */}
      <Link href="/hire/my-postings" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium w-fit mt-4">
        <ArrowLeft className="w-4 h-4" />
        Back to My Postings
      </Link>

      {/* Gig summary card */}
      <div className="bg-[#111111] border border-zinc-800/80 rounded-3xl p-7 flex flex-col md:flex-row md:items-center gap-6 shadow-xl">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {gig.status ?? 'Open'}
            </span>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{gig.category}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">{gig.title}</h1>
          <p className="text-zinc-500 text-sm line-clamp-2 max-w-2xl">{gig.description}</p>
        </div>

        {/* Stats */}
        <div className="flex md:flex-col gap-5 md:gap-3 shrink-0 border-t border-zinc-900 md:border-none pt-5 md:pt-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Budget</span>
            <div className="flex items-center gap-1 text-white font-black text-xl">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              {Number(gig.budget).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Timeline</span>
            <div className="flex items-center gap-1 text-white font-bold">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {gig.timeline} {gig.timelineUnit}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Applicants</span>
            <div className="flex items-center gap-1 text-white font-bold">
              <User className="w-3.5 h-3.5 text-purple-400" />
              {applicants.length}
            </div>
          </div>
        </div>
      </div>

      {/* Applicant list */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Applicants
            <span className="ml-2 text-sm font-medium text-zinc-600">({applicants.length})</span>
          </h2>
        </div>

        {applicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-zinc-800/60 border-dashed rounded-3xl bg-zinc-900/10 gap-5">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-zinc-700" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-zinc-400 mb-1">No applicants yet</p>
              <p className="text-sm text-zinc-600">Share your gig to start receiving applications from verified freelancers.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onMessage={handleMessage}
                messaging={messaging}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
