'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type ViewMode = 'learner' | 'hirer';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const [viewMode, setViewModeState] = useState<ViewMode>('learner');
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Load preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('arka_view_mode') as ViewMode;
    if (savedMode === 'learner' || savedMode === 'hirer') {
      setViewModeState(savedMode);
    }
    setIsInitialized(true);
  }, []);

  // 2. Sync with user accountType if it exists (Overwrites local preference for persistence)
  useEffect(() => {
    if (profile?.accountType) {
      const typeMode = profile.accountType === 'client' ? 'hirer' : 'learner';
      // Only update if it's different to prevent redundant renders
      if (viewMode !== typeMode) {
        setViewModeState(typeMode);
        localStorage.setItem('arka_view_mode', typeMode);
      }
    }
  }, [profile]);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('arka_view_mode', mode);
  };

  // Always render the Provider to prevent useViewMode from crashing,
  // but optionally hide content until hydrated to prevent hydration mismatch flashes.
  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      <div style={{ visibility: isInitialized ? 'visible' : 'hidden', display: 'contents' }}>
        {children}
      </div>
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
