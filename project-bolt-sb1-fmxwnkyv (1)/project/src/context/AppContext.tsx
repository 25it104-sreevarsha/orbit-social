import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockData, currentUserId } from '@/data/mockData';
import type { Spark, Signal } from '@/data/types';

interface AppContextValue {
  sparks: Spark[];
  constellations: typeof mockData.constellations;
  users: typeof mockData.users;
  userConnections: typeof mockData.userConnections;
  currentUser: typeof mockData.users[0];
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
  const currentUser = mockData.users.find((u) => u.id === currentUserId)!;

  const addSpark = (text: string, topic: string) => {
    const newSpark: Spark = {
      id: `s${Date.now()}`,
      authorId: currentUserId,
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
          userId: currentUserId,
          text,
          ring: 1,
        };
        const ring1 = s.orbitRings.find((r) => r.ring === 1);
        let newRings;
        if (ring1) {
          newRings = s.orbitRings.map((r) =>
            r.ring === 1 && !r.userIds.includes(currentUserId)
              ? { ...r, userIds: [...r.userIds, currentUserId] }
              : r
          );
        } else {
          newRings = [...s.orbitRings, { ring: 1, userIds: [currentUserId] }];
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
        users: mockData.users,
        userConnections: mockData.userConnections,
        currentUser,
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
