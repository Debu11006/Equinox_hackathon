import { Timestamp } from 'firebase/firestore';

export type UserRole = 'student' | 'client';

export interface UserDocument {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: Timestamp | Date;
  
  // Student-specific fields
  bio?: string;
  skills?: string[];
  portfolioLinks?: string[];
  rating?: number;
  
  // Client-specific fields
  companyName?: string;
}

export type GigStatus = 'open' | 'in_progress' | 'completed';

export interface GigDocument {
  id?: string;
  title: string;
  description: string;
  budget: number;
  clientId: string; // Relates to UserDocument.uid
  status: GigStatus;
  skillsRequired: string[];
  createdAt?: Timestamp | Date;
}
