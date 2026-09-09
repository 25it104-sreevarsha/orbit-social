import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { mockData } from '@/data/mockData';
import type { Spark, Signal, User } from '@/data/types';

// Stable id for the real, in-session user (as opposed to the simulated
// mock cast in mockData.users). Nothing else in the app references the
// old hardcoded 'u1' id anymore.
export const SELF_USER_ID = 'self';
const DEFAULT_SELF_AVATAR = '🌟';

// localStorage keys, namespaced to this project so they never collide
// with anything else that might share an origin (e.g. in a shared
// evaluator sandbox).
const STORAGE_KEYS = {
  identity: 'orbit.identity',
  interests: 'orbit.interests',
  hasOnboarded: 'orbit.hasOnboarded',
} as const;

// A fresh evaluator/browser session must never render an empty-name,
// interest-less user — that breaks Your Sky, spark authorship, and any
// screen that reads currentUser. This is the seeded demo identity that
// the whole product renders meaningfully with on first visit, before
// (or without) anyone ever completing onboarding. Interests are drawn
// from real constellation names in mockData so they line up with actual
// topics/sparks rather than an invented label.
const DEMO_IDENTITY = { name: 'You', avatar: '🌟' };
const DEMO_INTERESTS = ['music', 'art', 'startups'];

// Reads+parses a JSON value from localStorage, tolerating every way this
// can go wrong: no localStorage (SSR/sandboxed iframe), storage disabled,
// missing key, or malformed JSON left over from a previous version.
function safeReadJSON<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWriteJSON(key: string, value: unknown) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full, disabled, or unavailable (private browsing, sandboxed
    // iframe, etc). The app keeps working from in-memory state for the
    // rest of the session; it just won't persist across a refresh.
  }
}

function loadInitialIdentity(): { name: string; avatar: string; hasOnboarded: boolean } {
  const stored = safeReadJSON<{ name?: unknown; avatar?: unknown }>(STORAGE_KEYS.identity);
  const name =
    stored && typeof stored.name === 'string' && stored.name.trim().length > 0
      ? stored.name
      : DEMO_IDENTITY.name;
  const avatar =
    stored && typeof stored.avatar === 'string' && stored.avatar.trim().length > 0
      ? stored.avatar
      : DEMO_IDENTITY.avatar;
  const hasOnboarded = safeReadJSON<boolean>(STORAGE_KEYS.hasOnboarded) === true;
  return { name, avatar, hasOnboarded };
}

function loadInitialInterests(): string[] {
  const stored = safeReadJSON<unknown>(STORAGE_KEYS.interests);
  if (Array.isArray(stored) && stored.length > 0 && stored.every((i) => typeof i === 'string')) {
    return stored;
  }
  return DEMO_INTERESTS;
}

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
  const [selectedInterests, setSelectedInterests] = useState<string[]>(loadInitialInterests);
  const [highlightSparkId, setHighlightSparkId] = useState<string | null>(null);
  const [constellations, setConstellations] = useState(mockData.constellations);

  // The real current user, seeded from localStorage (if a previous visit
  // set one) or the safe demo identity (if not), and only ever replaced
  // by what's entered on the onboarding identity step. This replaces the
  // old hardcoded lookup of mock user 'u1' (Maya Chen) as "the current
  // user" — Maya and the rest of the mock cast (Arjun, Sofia, etc.) are
  // untouched in mockData.users and continue to populate the simulated
  // social graph around this person.
  const [selfName, setSelfName] = useState(() => loadInitialIdentity().name);
  const [selfAvatar, setSelfAvatar] = useState(() => loadInitialIdentity().avatar || DEFAULT_SELF_AVATAR);
  // True only once someone has actually gone through the identity step
  // themselves (or done so on a previous visit). Fresh/demo sessions
  // start false so screens can optionally offer a soft "Create your Sky"
  // prompt — the app never blocks on this like the old route guard did.
  const [hasSetIdentity, setHasSetIdentity] = useState(() => loadInitialIdentity().hasOnboarded);

  // Persist identity, interests, and onboarding state so a refresh (or a
  // fresh tab on the same origin) never resets a real person back to an
  // empty identity. Writes are best-effort and never throw.
  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.identity, { name: selfName, avatar: selfAvatar });
  }, [selfName, selfAvatar]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.interests, selectedInterests);
  }, [selectedInterests]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.hasOnboarded, hasSetIdentity);
  }, [hasSetIdentity]);

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
