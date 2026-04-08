'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserDocument } from '../../types';
import { 
  User, 
  Mail, 
  Link as LinkIcon, 
  Globe, 
  Briefcase, 
  CheckCircle2, 
  Star, 
  Clock, 
  ArrowLeft,
  Loader2,
  ExternalLink,
  MapPin,
  Calendar,
  Settings,
  Pencil,
  Trash2,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ViewProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    gigsCompleted: 0,
    activeProjects: 0,
    rating: 0
  });

  useEffect(() => {
    async function fetchProfileAndStats() {
      if (!user) return;
      
      try {
        // Fetch User Profile
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserDocument;
          setProfileData(data);
          
          // Fetch Stats (Mocking/Calculating based on gigs collection if available)
          // In a real scenario, you'd query the 'applications' or 'gigs' collection
          // For now, let's try to query gigs where this user is assigned
          const gigsRef = collection(db, 'gigs');
          
          // Assuming there's a 'freelancerId' or similar in gigs
          const completedQuery = query(gigsRef, where('freelancerId', '==', user.uid), where('status', '==', 'completed'));
          const activeQuery = query(gigsRef, where('freelancerId', '==', user.uid), where('status', '==', 'in_progress'));
          
          const [completedSnap, activeSnap] = await Promise.all([
            getDocs(completedQuery),
            getDocs(activeQuery)
          ]);

          setStats({
            gigsCompleted: completedSnap.size || 0,
            activeProjects: activeSnap.size || 0,
            rating: data.rating || 5.0
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileAndStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 p-4">
        <p className="mb-4">Profile not found. Please complete your profile first.</p>
        <Link href="/profile" className="text-white bg-zinc-800 px-6 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition">
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white pb-20">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-zinc-800/10 to-transparent pointer-events-none" />
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[100px] left-[-100px] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 pt-8 relative z-10">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/profile" 
                className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 hover:border-zinc-700 transition-all"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                Settings
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar / Profile Card */}
            <div className="lg:col-span-4 space-y-8">
              <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm relative group">
                {/* Inline Edit Icon for profile header */}
                <Link href="/profile" className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800/0 hover:bg-zinc-800/50 text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                  <Pencil className="w-4 h-4" />
                </Link>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-zinc-800/50 shadow-2xl">
                        {profileData.photoURL ? (
                          <img src={profileData.photoURL} alt={profileData.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                             <User className="w-12 h-12 text-zinc-600" />
                          </div>
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold mb-1 tracking-tight">{profileData.displayName}</h1>
                  <p className="text-zinc-400 font-medium mb-8">{profileData.title || 'Student Freelancer'}</p>

                  <div className="w-full space-y-3">
                    <Link 
                      href="/profile"
                      className="w-full py-3.5 bg-zinc-100 text-black font-bold rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                       <Pencil className="w-4 h-4" />
                       Edit Profile
                    </Link>
                    <div className="flex gap-2">
                      <button className="flex-1 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white font-medium rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                         <LinkIcon className="w-4 h-4" />
                      </button>
                      <button className="flex-1 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white font-medium rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                         <Globe className="w-4 h-4 text-zinc-300" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-800/50 space-y-4 text-left">
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <Mail className="w-4 h-4" />
                    <span>{profileData.email}</span>
                  </div>
                  {profileData.portfolioLinks?.[0] && (
                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                      <Globe className="w-4 h-4" />
                      <a href={profileData.portfolioLinks[0]} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors truncate">
                        {profileData.portfolioLinks[0].replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <MapPin className="w-4 h-4" />
                    <span>Remote / Hybrid</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {profileData.createdAt ? new Date((profileData.createdAt as any).seconds * 1000).toLocaleDateString() : 'recently'}</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold mb-1">{stats.gigsCompleted}</div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Completed</div>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold mb-1">{stats.activeProjects}</div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Active</div>
                </div>
                <div className="col-span-2 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm flex items-center justify-between">
                   <div className="text-left font-bold uppercase text-xs tracking-widest text-zinc-500">Average Rating</div>
                   <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{stats.rating.toFixed(1)}</span>
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                   </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-3 text-red-500">
                  <Lock className="w-4 h-4" />
                  <h3 className="font-bold text-sm uppercase tracking-widest">Danger Zone</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Permanently delete your profile and all associated data. This action cannot be undone.
                </p>
                <button className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                   <Trash2 className="w-4 h-4" />
                   Delete Profile
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              {/* Profile Bio */}
              <section>
                <div className="flex items-center gap-4 mb-6 relative group">
                  <h2 className="text-xl font-bold">About Me</h2>
                  <Link href="/profile" className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex-1 h-[1px] bg-zinc-800/50" />
                </div>
                <div className="p-8 rounded-3xl bg-zinc-900/20 border border-zinc-800/50 backdrop-blur-sm relative overflow-hidden group">
                  <p className="text-zinc-400 leading-relaxed text-lg whitespace-pre-wrap">
                    {profileData.bio || "No biography provided yet. This student is currently building their professional profile on Arka."}
                  </p>
                </div>
              </section>

              {/* Skills Section */}
              <section>
                <div className="flex items-center gap-4 mb-6 relative group">
                  <h2 className="text-xl font-bold">Expertise & Skills</h2>
                  <Link href="/profile" className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex-1 h-[1px] bg-zinc-800/50" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {profileData.skills && profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, idx) => (
                      <div 
                        key={idx} 
                        className="px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-300 cursor-default flex items-center gap-2"
                      >
                         <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                         {skill}
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 italic">No skills listed yet.</p>
                  )}
                </div>
              </section>

              {/* Portfolio section */}
              <section>
                 <div className="flex items-center gap-4 mb-6 relative group">
                  <h2 className="text-xl font-bold">Selected Projects</h2>
                  <Link href="/profile" className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex-1 h-[1px] bg-zinc-800/50" />
                </div>
                {profileData.portfolioLinks && profileData.portfolioLinks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData.portfolioLinks.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-600 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                           <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                             <Globe className="w-5 h-5 text-zinc-400" />
                           </div>
                           <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                        <h4 className="font-bold text-white mb-1">Project Link {idx + 1}</h4>
                        <p className="text-sm text-zinc-500 truncate">{link}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 rounded-3xl border border-dashed border-zinc-800 text-center">
                    <Globe className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">No portfolio projects shared yet.</p>
                  </div>
                )}
              </section>

              {/* Achievements / Availability */}
              <div className="p-1 rounded-[2rem] bg-gradient-to-r from-indigo-500/20 via-zinc-800/20 to-blue-500/20">
                <div className="p-8 rounded-[1.8rem] bg-[#09090b] flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-indigo-400" />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg">Availability</h3>
                        <p className="text-sm text-zinc-400">Available for new freelance opportunities</p>
                     </div>
                   </div>
                   <button className="px-8 py-3 bg-zinc-100 text-black font-bold rounded-2xl hover:bg-white transition-all">
                      Start Chat
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
