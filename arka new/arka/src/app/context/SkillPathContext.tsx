'use client';

/**
 * SkillPathContext — Central state store for the ARKA skill path dashboard.
 *
 * Pub/Sub pattern: both the "Start Learning" workspace and the "Milestones"
 * tab subscribe to this context. Any state mutation (e.g. a milestone being
 * completed by MilestoneGrader) is dispatched here and automatically causes
 * all subscribers to re-render with the fresh data.
 *
 * Initialization: the Provider accepts `initialMilestones` built from the
 * TASKS_BY_RANK static data + the live Firestore snapshot, so the store is
 * fully hydrated before child components mount.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type MilestoneStatus = 'locked' | 'incomplete' | 'completed';

export interface MilestoneData {
  /** e.g. 'apprentice_0' */
  id: string;
  title: string;
  desc: string;
  files: string[];
  /** Determines if the task can be attempted */
  status: MilestoneStatus;
  /** Raw test cases identifier used by MilestoneGrader */
  testCaseKey: string;
}

export interface SkillPathState {
  /** Slug from the URL, e.g. 'web-dev' */
  activeSkillId: string;
  /** Firestore key, e.g. 'web_development' */
  activeSkillKey: string;
  /** e.g. 'apprentice' | 'associate' | 'specialist' | 'professional' */
  currentRoleLevel: string;
  /** Flat list of all milestones for the current role level */
  milestones: MilestoneData[];
  /** ID of the milestone currently shown in the AI Teacher workspace */
  activeMilestoneId: string | null;
  /** Whether the store has been fully initialized from Firestore */
  initialized: boolean;
}

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'INIT'; payload: Omit<SkillPathState, 'initialized'> }
  | { type: 'SET_ROLE_LEVEL'; payload: { level: string; milestones: MilestoneData[] } }
  | { type: 'SET_ACTIVE_MILESTONE'; payload: { milestoneId: string } }
  | { type: 'SYNC_MILESTONE_STATUSES'; payload: { statuses: Record<string, string> } }
  | { type: 'UPDATE_MILESTONE_STATUS'; payload: { milestoneId: string; status: MilestoneStatus } };

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: SkillPathState, action: Action): SkillPathState {
  switch (action.type) {

    case 'INIT':
      return { ...action.payload, initialized: true };

    case 'SET_ROLE_LEVEL':
      return {
        ...state,
        currentRoleLevel: action.payload.level,
        milestones: action.payload.milestones,
        activeMilestoneId: action.payload.milestones.find(m => m.status !== 'completed')?.id ?? null,
      };

    case 'SET_ACTIVE_MILESTONE':
      return { ...state, activeMilestoneId: action.payload.milestoneId };

    case 'UPDATE_MILESTONE_STATUS':
      return {
        ...state,
        milestones: state.milestones.map(m =>
          m.id === action.payload.milestoneId
            ? { ...m, status: action.payload.status }
            : m
        ),
      };

    // Called by onSnapshot — merges live Firestore statuses into the milestones array
    case 'SYNC_MILESTONE_STATUSES':
      return {
        ...state,
        milestones: state.milestones.map(m => ({
          ...m,
          status: (action.payload.statuses[m.id] as MilestoneStatus) ?? m.status,
        })),
      };

    default:
      return state;
  }
}

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_STATE: SkillPathState = {
  activeSkillId: '',
  activeSkillKey: '',
  currentRoleLevel: 'apprentice',
  milestones: [],
  activeMilestoneId: null,
  initialized: false,
};

// ── Context ───────────────────────────────────────────────────────────────────

interface SkillPathContextValue {
  state: SkillPathState;
  // Typed dispatch helpers
  initStore: (payload: Omit<SkillPathState, 'initialized'>) => void;
  setRoleLevel: (level: string, milestones: MilestoneData[]) => void;
  setActiveMilestone: (milestoneId: string) => void;
  updateMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => void;
  syncFromFirestore: (statuses: Record<string, string>) => void;
  // Derived selectors (memoised via useCallback)
  getCompletedCount: () => number;
  getProgressPct: () => number;
}

const SkillPathContext = createContext<SkillPathContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface SkillPathProviderProps {
  children: ReactNode;
}

export function SkillPathProvider({ children }: SkillPathProviderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const initStore = useCallback(
    (payload: Omit<SkillPathState, 'initialized'>) =>
      dispatch({ type: 'INIT', payload }),
    []
  );

  const setRoleLevel = useCallback(
    (level: string, milestones: MilestoneData[]) =>
      dispatch({ type: 'SET_ROLE_LEVEL', payload: { level, milestones } }),
    []
  );

  const setActiveMilestone = useCallback(
    (milestoneId: string) =>
      dispatch({ type: 'SET_ACTIVE_MILESTONE', payload: { milestoneId } }),
    []
  );

  const updateMilestoneStatus = useCallback(
    (milestoneId: string, status: MilestoneStatus) =>
      dispatch({ type: 'UPDATE_MILESTONE_STATUS', payload: { milestoneId, status } }),
    []
  );

  const syncFromFirestore = useCallback(
    (statuses: Record<string, string>) =>
      dispatch({ type: 'SYNC_MILESTONE_STATUSES', payload: { statuses } }),
    []
  );

  // Derived: count completed milestones for the current role level
  const getCompletedCount = useCallback(
    () => state.milestones.filter(m => m.status === 'completed').length,
    [state.milestones]
  );

  // Derived: 0-100 percentage
  const getProgressPct = useCallback(() => {
    const total = state.milestones.length;
    if (!total) return 0;
    return Math.round((getCompletedCount() / total) * 100);
  }, [state.milestones, getCompletedCount]);

  return (
    <SkillPathContext.Provider
      value={{
        state,
        initStore,
        setRoleLevel,
        setActiveMilestone,
        updateMilestoneStatus,
        syncFromFirestore,
        getCompletedCount,
        getProgressPct,
      }}
    >
      {children}
    </SkillPathContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

/**
 * useSkillPath — subscribe to the central skill path store.
 * Must be used inside a <SkillPathProvider>.
 */
export function useSkillPath(): SkillPathContextValue {
  const ctx = useContext(SkillPathContext);
  if (!ctx) {
    throw new Error('useSkillPath must be used inside <SkillPathProvider>');
  }
  return ctx;
}

// ── Helper: build MilestoneData[] from static task map + Firestore statuses ───

/**
 * buildMilestones — converts TASKS_BY_RANK entries into typed MilestoneData,
 * merging live Firestore statuses so the store is always up-to-date.
 */
export function buildMilestones(
  rank: string,
  tasks: { title: string; desc: string; files: string[] }[],
  firestoreStatuses: Record<string, string> = {}
): MilestoneData[] {
  return tasks.map((task, idx) => {
    const id = `${rank}_${idx}`;
    const rawStatus = firestoreStatuses[id];
    const status: MilestoneStatus =
      rawStatus === 'completed' ? 'completed' : 'incomplete';
    return {
      id,
      title: task.title,
      desc: task.desc,
      files: task.files,
      status,
      testCaseKey: rank,
    };
  });
}
