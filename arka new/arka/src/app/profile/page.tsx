'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserDocument, UserRole } from '../types';
import { User, Mail, Save, FileText, Loader2, Link as LinkIcon, AlertCircle, ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState<Partial<UserDocument>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Interactive UI specific states
  const [newSkill, setNewSkill] = useState('');
  const [newLink, setNewLink] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfileData(docSnap.data() as UserDocument);
        } else {
          // Initialize with default data based on Auth provider
          setProfileData({
            uid: user.uid,
            role: 'student', // Defaulting to student as planned
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            skills: [],
            portfolioLinks: [],
            bio: ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        ...profileData,
        uid: user.uid, // Ensure critical fields aren't accidentally wiped
        email: user.email,
        updatedAt: serverTimestamp()
      }, { merge: true }); // Use merge so we don't overwrite server-controlled fields like createdAt
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setProfileData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill.trim()]
    }));
    setNewSkill('');
  };

  const removeSkill = (indexToRemove: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const addLink = () => {
    if (!newLink.trim()) return;
    setProfileData(prev => ({
      ...prev,
      portfolioLinks: [...(prev.portfolioLinks || []), newLink.trim()]
    }));
    setNewLink('');
  };

  const removeLink = (indexToRemove: number) => {
    setProfileData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks?.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 relative overflow-hidden py-10 px-4 sm:px-6">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] h-96 w-96 rounded-full bg-blue-900/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-zinc-800/30 blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition mb-6 px-2 py-1 rounded-md hover:bg-zinc-900/50">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">Your Profile</h1>
            <p className="text-zinc-400 mt-1">Manage your professional identity and portfolio</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center p-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
            </div>
          ) : (
            <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800/50 shadow-2xl p-6 sm:p-8">
              
              {message && (
                <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {message.type === 'error' ? <AlertCircle className="h-5 w-5 shrink-0" /> : <div className="h-2 w-2 rounded-full bg-green-400 shrink-0" />}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <div className="grid gap-8">
                {/* Identity Defaults (Read Only purely based on Auth info here for simplicity, though can handle edits) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><User className="h-4 w-4" /> Display Name</label>
                    <input 
                      type="text" 
                      value={profileData.displayName || ''} 
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-4 pr-4 pl text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 outline-none transition ring-1 ring-transparent focus:ring-zinc-800"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Mail className="h-4 w-4" /> Email Address</label>
                    <input 
                      type="email" 
                      value={profileData.email || ''} 
                      disabled
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 px-4 text-sm text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="w-full h-[1px] bg-zinc-800/50 my-2" />

                {/* Bio Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><FileText className="h-4 w-4" /> Professional Bio</label>
                  <textarea 
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 outline-none transition ring-1 ring-transparent focus:ring-zinc-800 resize-none"
                    placeholder="Tell clients about yourself, your experience, and what you aim to achieve..."
                  />
                </div>

                {/* Skills Section */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-zinc-400">Skills & Expertise</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/50 py-2.5 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-zinc-700"
                      placeholder="e.g. React.js, UI Design, Marketing"
                    />
                    <button 
                      type="button" 
                      onClick={addSkill}
                      className="p-2.5 rounded-xl bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {profileData.skills && profileData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-300">
                          {skill}
                          <button onClick={() => removeSkill(idx)} className="p-1 hover:bg-zinc-700 rounded-full text-zinc-500 hover:text-zinc-300 transition">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Portfolio Links Section */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Portfolio & Links</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="url" 
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                      className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/50 py-2.5 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-zinc-700"
                      placeholder="e.g. https://github.com/yourusername"
                    />
                    <button 
                      type="button" 
                      onClick={addLink}
                      className="p-2.5 rounded-xl bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {profileData.portfolioLinks && profileData.portfolioLinks.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {profileData.portfolioLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate mr-4">
                            {link}
                          </a>
                          <button onClick={() => removeLink(idx)} className="text-zinc-500 hover:text-red-400 transition">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full h-[1px] bg-zinc-800/50 my-2" />
                
                {/* Form Actions */}
                <div className="flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-zinc-100 px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
