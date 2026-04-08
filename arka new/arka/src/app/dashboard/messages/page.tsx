'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'next/navigation';
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markConversationRead,
  Conversation,
  Message,
} from '../../lib/messaging';
import {
  Send, Search, MessageSquare, User,
  Loader2, ArrowLeft, MoreHorizontal, Smile, Paperclip
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';

// ─── Tiny helpers ──────────────────────────────────────────────────────────────

function tsToDate(ts: any): Date | null {
  if (!ts) return null;
  if (ts.seconds) return new Date(ts.seconds * 1000);
  if (ts instanceof Date) return ts;
  return null;
}

function formatTime(ts: any): string {
  const d = tsToDate(ts);
  if (!d) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts: any): string {
  const d = tsToDate(ts);
  if (!d) return '';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatSectionDate(ts: any): string {
  const d = tsToDate(ts);
  if (!d) return '';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

// Avatar fallback: generates a coloured circle with initials
function Avatar({ name, photo, size = 'md' }: { name: string; photo?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-11 h-11 text-sm';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  // Deterministic pastel colour from name
  const hues = [211, 156, 25, 140, 280, 340, 20, 60];
  const hue = hues[name.charCodeAt(0) % hues.length];

  return (
    <div className={`${sizeClass} rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-zinc-800`}
      style={{ background: `hsl(${hue}, 60%, 18%)` }}>
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-black leading-none" style={{ color: `hsl(${hue}, 80%, 65%)` }}>
          {initials}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);

  // Auto-open a specific conversation from ?conv= query param (e.g. routed from applicant page)
  useEffect(() => {
    const convParam = searchParams?.get('conv');
    if (convParam) {
      setActiveConvId(convParam);
      setMobileShowThread(true);
    }
  }, [searchParams]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ── Subscribe to all conversations ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      setLoadingConvs(false);
    });
    return () => unsub();
  }, [user]);

  // ── Subscribe to active conversation messages ────────────────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    setMessages([]);
    const unsub = subscribeToMessages(activeConvId, setMessages);
    return () => unsub();
  }, [activeConvId]);

  // ── Auto-scroll on new message ───────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Mark as read on open ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeConvId || !user) return;
    markConversationRead(activeConvId, user.uid);
  }, [activeConvId, user]);

  // ── Send handler ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || !activeConvId || !user) return;

      const activeConv = conversations.find((c) => c.id === activeConvId);
      const recipientId = activeConv?.participants.find((p) => p !== user.uid) ?? '';

      setSending(true);
      setInput('');
      try {
        await sendMessage(activeConvId, user.uid, recipientId, text);
      } catch (err) {
        console.error('Error sending:', err);
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [input, activeConvId, user, conversations]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const getOther = useCallback(
    (conv: Conversation) => {
      const otherId = conv.participants.find((p) => p !== user?.uid) ?? '';
      return {
        id: otherId,
        name: conv.participantNames?.[otherId] ?? 'User',
        photo: conv.participantPhotos?.[otherId] ?? '',
      };
    },
    [user]
  );

  const filteredConvs = useMemo(
    () =>
      conversations.filter((c) =>
        getOther(c).name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [conversations, searchQuery, getOther]
  );

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) ?? null,
    [conversations, activeConvId]
  );
  const activeOther = activeConv ? getOther(activeConv) : null;

  // ── Group messages by date for separators ─────────────────────────────────────
  type MessageGroup = { dateLabel: string; msgs: Message[] };
  const messageGroups = useMemo<MessageGroup[]>(() => {
    const groups: MessageGroup[] = [];
    let currentLabel = '';
    for (const msg of messages) {
      const label = formatSectionDate(msg.createdAt);
      if (label !== currentLabel) {
        groups.push({ dateLabel: label, msgs: [] });
        currentLabel = label;
      }
      groups[groups.length - 1].msgs.push(msg);
    }
    return groups;
  }, [messages]);

  const myName = profile?.displayName ?? user?.displayName ?? 'Me';

  return (
    <ProtectedRoute>
      {/* Full-height container that sits inside the dashboard shell (64px header) */}
      <div className="flex h-[calc(100vh-64px)] bg-[#0A0A0A] overflow-hidden -m-6">

        {/* ════════════════════════════════════════════════
            LEFT — Inbox list
            ════════════════════════════════════════════════ */}
        <div
          className={`
            w-full lg:w-[320px] xl:w-[360px] flex-shrink-0
            border-r border-zinc-900 flex flex-col bg-[#0D0D0D]
            ${mobileShowThread ? 'hidden lg:flex' : 'flex'}
          `}
        >
          {/* Header */}
          <div className="px-5 pt-6 pb-4 border-b border-zinc-900/80 shrink-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white tracking-tight">Inbox</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                {conversations.length} thread{conversations.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700 transition-all"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center h-32 gap-3">
                <Loader2 className="w-5 h-5 text-zinc-700 animate-spin" />
                <p className="text-xs text-zinc-600 font-medium">Loading…</p>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 gap-4 px-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-zinc-700" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-500 mb-1">
                    {searchQuery ? 'No matches found' : 'No conversations yet'}
                  </p>
                  <p className="text-[11px] text-zinc-700">
                    {searchQuery ? 'Try a different name.' : 'Start chatting from a gig or talent page.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const other = getOther(conv);
                const unread = user ? (conv.unreadCount?.[user.uid] ?? 0) : 0;
                const isActive = conv.id === activeConvId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setMobileShowThread(true);
                    }}
                    className={`
                      w-full flex items-center gap-3.5 px-4 py-3.5 text-left
                      border-l-2 transition-all duration-150
                      border-b border-zinc-900/60
                      ${isActive
                        ? 'border-l-amber-500 bg-zinc-900/60'
                        : 'border-l-transparent hover:bg-zinc-900/30 hover:border-l-zinc-700'}
                    `}
                  >
                    {/* Avatar with online dot */}
                    <div className="relative">
                      <Avatar name={other.name} photo={other.photo} size="md" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0D0D0D]" />
                    </div>

                    {/* Text content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm font-bold truncate ${unread > 0 ? 'text-white' : 'text-zinc-300'}`}>
                          {other.name}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-medium shrink-0">
                          {formatDateLabel(conv.lastUpdated)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[11px] truncate ${unread > 0 ? 'text-zinc-300 font-medium' : 'text-zinc-600'}`}>
                          {conv.lastMessage || 'No messages yet…'}
                        </p>
                        {unread > 0 && (
                          <div className="min-w-[18px] h-[18px] bg-amber-500 rounded-full flex items-center justify-center px-1 shrink-0">
                            <span className="text-[9px] font-black text-black">{unread > 99 ? '99+' : unread}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            RIGHT — Chat window
            ════════════════════════════════════════════════ */}
        <div className={`flex-1 flex flex-col min-w-0 ${mobileShowThread ? 'flex' : 'hidden lg:flex'}`}>

          {activeConv && activeOther ? (
            <>
              {/* Thread header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-900 bg-[#0D0D0D] shrink-0">
                <div className="flex items-center gap-3">
                  {/* Back button (mobile) */}
                  <button
                    onClick={() => setMobileShowThread(false)}
                    className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all mr-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative">
                    <Avatar name={activeOther.name} photo={activeOther.photo} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0D0D0D]" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{activeOther.name}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>

                <button className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* ── Messages area ───────────────────────────────────────── */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-5 md:px-8 py-6 flex flex-col gap-0"
                style={{ background: 'radial-gradient(ellipse at top, #111111 0%, #0A0A0A 100%)' }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-zinc-700" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-zinc-400 mb-1">No messages yet</p>
                      <p className="text-xs text-zinc-600">Send the first message to {activeOther.name}.</p>
                    </div>
                  </div>
                ) : (
                  messageGroups.map((group) => (
                    <div key={group.dateLabel}>
                      {/* ── Date separator ─── */}
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-zinc-800/60" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                          {group.dateLabel}
                        </span>
                        <div className="flex-1 h-px bg-zinc-800/60" />
                      </div>

                      {/* ── Message bubbles ─── */}
                      <div className="flex flex-col gap-1">
                        {group.msgs.map((msg, idx) => {
                          const isMine = msg.senderId === user?.uid;
                          const isFirst = idx === 0 || group.msgs[idx - 1].senderId !== msg.senderId;
                          const isLast = idx === group.msgs.length - 1 || group.msgs[idx + 1].senderId !== msg.senderId;

                          return (
                            <div
                              key={msg.id}
                              className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${isFirst ? 'mt-3' : 'mt-0.5'}`}
                            >
                              {/* Other user's avatar — only show at bottom of a group */}
                              {!isMine && (
                                <div className={`shrink-0 ${isLast ? 'opacity-100' : 'opacity-0'}`}>
                                  <Avatar name={activeOther.name} photo={activeOther.photo} size="sm" />
                                </div>
                              )}

                              <div className={`flex flex-col gap-1 max-w-[68%] ${isMine ? 'items-end' : 'items-start'}`}>
                                {/* Bubble */}
                                <div
                                  className={`
                                    px-4 py-2.5 text-sm leading-relaxed
                                    ${isMine
                                      ? `bg-white text-[#0A0A0A] font-medium shadow-sm
                                         ${isFirst && isLast ? 'rounded-2xl rounded-br-md' : isFirst ? 'rounded-t-2xl rounded-bl-2xl rounded-br-md rounded-tr-2xl' : isLast ? 'rounded-b-2xl rounded-br-md rounded-tl-2xl rounded-tr-2xl' : 'rounded-l-2xl rounded-r-md'}`
                                      : `bg-zinc-900 border border-zinc-800/80 text-zinc-200
                                         ${isFirst && isLast ? 'rounded-2xl rounded-bl-md' : isFirst ? 'rounded-t-2xl rounded-br-2xl rounded-bl-md rounded-tl-2xl' : isLast ? 'rounded-b-2xl rounded-bl-md rounded-tr-2xl rounded-tl-2xl' : 'rounded-r-2xl rounded-l-md'}`
                                    }
                                  `}
                                >
                                  {msg.text}
                                </div>

                                {/* Timestamp — only at the last bubble of a group */}
                                {isLast && (
                                  <span className="text-[9px] text-zinc-700 font-medium px-1">
                                    {formatTime(msg.createdAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* ── Input bar ───────────────────────────────────────────── */}
              <div className="px-4 md:px-6 py-4 border-t border-zinc-900 bg-[#0D0D0D] shrink-0">
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-2.5 focus-within:border-zinc-700 transition-all"
                >
                  {/* Emoji placeholder */}
                  <button type="button" className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
                    <Smile className="w-4 h-4" />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Message ${activeOther.name}…`}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none min-w-0"
                  />

                  {/* Attachment placeholder */}
                  <button type="button" className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Send */}
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-all
                      ${input.trim()
                        ? 'bg-white hover:bg-zinc-200 text-[#0A0A0A] shadow-md'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                    `}
                  >
                    {sending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </form>
                <p className="text-center text-[9px] text-zinc-800 font-medium mt-2">
                  Press <kbd className="text-zinc-700">Enter</kbd> to send &bull; Messages are end-to-end encrypted
                </p>
              </div>
            </>
          ) : (
            /* ── Empty state ─────────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center flex-1 gap-8"
              style={{ background: 'radial-gradient(ellipse at center, #111111 0%, #0A0A0A 100%)' }}>
              <div className="relative">
                <div className="w-24 h-24 rounded-[32px] bg-zinc-900 border border-zinc-800/80 flex items-center justify-center shadow-2xl">
                  <MessageSquare className="w-12 h-12 text-zinc-700" />
                </div>
                {/* Decorative glow */}
                <div className="absolute inset-0 rounded-[32px] bg-amber-500/5 blur-xl -z-10" />
              </div>
              <div className="text-center max-w-xs">
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Your messages</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Select a conversation from the left to start chatting. All client and freelancer threads live here in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
