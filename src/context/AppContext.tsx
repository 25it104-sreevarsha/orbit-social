import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockData } from '@/data/mockData';
import type { Spark, Signal, User } from '@/data/types';

// Stable id for the real, in-session user (as opposed to the simulated
// mock cast in mockData.users). Nothing else in the app references the
// old hardcoded 'u1' id anymore.
export const SELF_USER_ID = 'self';
const DEFAULT_SELF_AVATAR = '🌟';

interface AppContextValue {
  sparks: Spark[];
  constellations: typeof mockData.constellations;
  users: User[];
  userConnections: typeof mockData.userConnections;
  currentUser: User;
  hasSetIdentity: boolean;
  setIdentity: (name: string, avatar: string) => void;
  selectedInterests: string[];
  setSelectedInterests: (interests: string[]) => void;
  highlightSparkId: string | null;
  setHighlightSparkId: (id: string | null) => void;
  addSpark: (text: string, topic: string) => void;
  addSignal: (sparkId: string, text: string) => void;
  updateSparkAttention: (sparkId: string, attention: number) => void;
  updateConstellationGravity: (name: string, gravity: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sparks, setSparks] = useState<Spark[]>(mockData.sparks);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [highlightSparkId, setHighlightSparkId] = useState<string | null>(null);
  const [constellations, setConstellations] = useState(mockData.constellations);

  // The real current user, built from what's entered on the onboarding
  // identity step. This replaces the old hardcoded lookup of mock user
  // 'u1' (Maya Chen) as "the current user" — Maya and the rest of the
  // mock cast (Arjun, Sofia, etc.) are untouched in mockData.users and
  // continue to populate the simulated social graph around this person.
  const [selfName, setSelfName] = useState('');
  const [selfAvatar, setSelfAvatar] = useState(DEFAULT_SELF_AVATAR);
  const [hasSetIdentity, setHasSetIdentity] = useState(false);

  // Interests picked in onboarding double as this user's `interests`, so
  // "Your Sky" and anywhere else that reads currentUser.interests stays
  // in sync automatically.
  const currentUser: User = {
    id: SELF_USER_ID,
    name: selfName,
    avatar: selfAvatar,
    interests: selectedInterests,
  };

  const setIdentity = (name: string, avatar: string) => {
    setSelfName(name);
    setSelfAvatar(avatar);
    setHasSetIdentity(true);
  };

  // Append the self user to the roster so getUserById (used to resolve
  // spark authors, signal authors, and orbit-ring avatars) finds them
  // wherever they show up, without altering the mock user list itself.
  const users: User[] = [...mockData.users, currentUser];

  const addSpark = (text: string, topic: string) => {
    const newSpark: Spark = {
      id: `s${Date.now()}`,
      authorId: currentUser.id,
      text,
      topic,
      createdAt: new Date().toISOString(),
      liveAttention: 1,
      orbitRings: [{ ring: 1, userIds: [] }],
      signals: [],
    };
    setSparks((prev) => [...prev, newSpark]);
    setHighlightSparkId(newSpark.id);
    setTimeout(() => setHighlightSparkId(null), 4000);
  };

  const addSignal = (sparkId: string, text: string) => {
    setSparks((prev) =>
      prev.map((s) => {
        if (s.id !== sparkId) return s;
        const newSignal: Signal = {
          id: `sig${Date.now()}`,
          userId: currentUser.id,
          text,
          ring: 1,
        };
        const ring1 = s.orbitRings.find((r) => r.ring === 1);
        let newRings;
        if (ring1) {
          newRings = s.orbitRings.map((r) =>
            r.ring === 1 && !r.userIds.includes(currentUser.id)
              ? { ...r, userIds: [...r.userIds, currentUser.id] }
              : r
          );
        } else {
          newRings = [...s.orbitRings, { ring: 1, userIds: [currentUser.id] }];
        }
        return {
          ...s,
          signals: [...s.signals, newSignal],
          orbitRings: newRings,
          liveAttention: s.liveAttention + 1,
        };
      })
    );
  };

  const updateSparkAttention = (sparkId: string, attention: number) => {
    setSparks((prev) =>
      prev.map((s) => (s.id === sparkId ? { ...s, liveAttention: attention } : s))
    );
  };

  const updateConstellationGravity = (name: string, gravity: number) => {
    setConstellations((prev) =>
      prev.map((c) => (c.name === name ? { ...c, gravity } : c))
    );
  };

  return (
    <AppContext.Provider
      value={{
        sparks,
        constellations,
        users,
        userConnections: mockData.userConnections,
        currentUser,
        hasSetIdentity,
        setIdentity,
        selectedInterests,
        setSelectedInterests,
        highlightSparkId,
        setHighlightSparkId,
        addSpark,
        addSignal,
        updateSparkAttention,
        updateConstellationGravity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
