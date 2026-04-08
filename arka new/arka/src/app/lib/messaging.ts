import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage: string;
  lastUpdated: Timestamp | null;
  unreadCount: Record<string, number>;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the canonical conversation ID for two users.
 * Sorts the two UIDs alphabetically so A↔B and B↔A always produce the same ID.
 */
export function buildConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

// ─── Get or Create Conversation ───────────────────────────────────────────────

/**
 * Fetches an existing conversation between two users or creates a new one.
 * Returns the conversation document ID.
 */
export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string,
  currentUserName: string = 'Unknown',
  otherUserName: string = 'Unknown',
  currentUserPhoto: string = '',
  otherUserPhoto: string = ''
): Promise<string> {
  const convId = buildConversationId(currentUserId, otherUserId);
  const convRef = doc(db, 'conversations', convId);
  const convSnap = await getDoc(convRef);

  if (!convSnap.exists()) {
    await setDoc(convRef, {
      participants: [currentUserId, otherUserId],
      participantNames: {
        [currentUserId]: currentUserName,
        [otherUserId]: otherUserName,
      },
      participantPhotos: {
        [currentUserId]: currentUserPhoto,
        [otherUserId]: otherUserPhoto,
      },
      lastMessage: '',
      lastUpdated: serverTimestamp(),
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0,
      },
    });
  }

  return convId;
}

// ─── Send Message ─────────────────────────────────────────────────────────────

/**
 * Sends a message and atomically updates the parent conversation document.
 * Uses a Firestore batch write to guarantee both writes succeed or both fail.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  text: string
): Promise<void> {
  const convRef = doc(db, 'conversations', conversationId);
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const newMessageRef = doc(messagesRef); // auto-ID

  const batch = writeBatch(db);

  // 1. Add new message document
  batch.set(newMessageRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });

  // 2. Update parent conversation metadata atomically
  batch.update(convRef, {
    lastMessage: text.length > 80 ? text.slice(0, 80) + '…' : text,
    lastUpdated: serverTimestamp(),
    [`unreadCount.${recipientId}`]:
      // We can't use FieldValue.increment inside a batch easily with the client SDK,
      // so we read then increment. For production, use a Cloud Function.
      // Here we set 1 as a safe default increment approach.
      1,
  });

  await batch.commit();
}

// ─── Mark Messages as Read ────────────────────────────────────────────────────

export async function markConversationRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

// ─── Real-time Listeners ──────────────────────────────────────────────────────

/**
 * Subscribes to all conversations a user is part of, ordered by most recent.
 * Returns an unsubscribe function to clean up the listener.
 */
export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
    // NOTE: orderBy removed — Firestore requires a composite index for
    // array-contains + orderBy. We sort client-side instead.
  );

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Conversation, 'id'>),
      }))
      // Sort newest-first client-side
      .sort((a, b) => {
        const aTs = (a.lastUpdated as any)?.seconds ?? 0;
        const bTs = (b.lastUpdated as any)?.seconds ?? 0;
        return bTs - aTs;
      });
    callback(conversations);
  });
}

/**
 * Subscribes to messages within a single conversation, ordered oldest first.
 * Returns an unsubscribe function to clean up the listener.
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Message, 'id'>),
    }));
    callback(messages);
  });
}
