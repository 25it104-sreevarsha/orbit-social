import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { getTopicColor, formatRelativeTime, getUserById, getConstellationEmoji } from '@/utils/clusterCoords';
import OrbitRing from '@/components/OrbitRing';
import SatelliteBubble from '@/components/SatelliteBubble';
import StarfieldBackground from '@/components/StarfieldBackground';

const RING_RADII = [80, 150, 220];

export default function OrbitRoom() {
  const { sparkId } = useParams<{ sparkId: string }>();
  const navigate = useNavigate();
  const { sparks, users, addSignal } = useApp();
  const reduced = usePrefersReducedMotion();
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [presenceCount, setPresenceCount] = useState(0);
  const [newSignalId, setNewSignalId] = useState<string | null>(null);

  const spark = sparks.find((s) => s.id === sparkId);

  useEffect(() => {
    if (!spark) return;
    const base = spark.orbitRings.reduce((sum, r) => sum + r.userIds.length, 0);
    setPresenceCount(base + 2);
  }, [spark]);

  useEffect(() => {
    if (reduced || !spark) return;
    const interval = setInterval(() => {
      setPresenceCount((prev) => {
        const delta = Math.round((Math.random() - 0.4) * 3);
        return Math.max(3, prev + delta);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [reduced, spark]);

  const author = spark ? getUserById(users, spark.authorId) : undefined;
  const color = spark ? getTopicColor(spark.topic) : '#8B5CF6';

  const allEngagedUserIds = useMemo(() => {
    if (!spark) return [];
    const ids: string[] = [];
    for (const ring of spark.orbitRings) {
      for (const uid of ring.userIds) {
        if (!ids.includes(uid)) ids.push(uid);
      }
    }
    return ids;
  }, [spark]);

  const userAngles = useMemo(() => {
    const map: Record<string, number> = {};
    allEngagedUserIds.forEach((uid, i) => {
      const ring = spark?.orbitRings.find((r) => r.userIds.includes(uid));
      const ringIdx = ring ? ring.ring - 1 : 0;
      const sameRingUsers = spark?.orbitRings.filter((r) => r.userIds.includes(uid))[0]?.userIds ?? [];
      const idxInRing = sameRingUsers.indexOf(uid);
      const totalInRing = sameRingUsers.length;
      const angle = (idxInRing / Math.max(totalInRing, 1)) * 360 + ringIdx * 30;
      map[uid] = angle;
    });
    return map;
  }, [allEngagedUserIds, spark]);

  if (!spark || !author) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center">
        <p className="text-slate-400">Spark not found.</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    addSignal(spark.id, inputText.trim());
    setNewSignalId(`sig${Date.now()}`);
    setInputText('');
    setShowInput(false);
    setPresenceCount((p) => p + 1);
    setTimeout(() => setNewSignalId(null), 2000);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const ringScale = isMobile ? 0.65 : 1;

  return (
    <div className="relative min-h-screen bg-space-950 overflow-hidden">
      <StarfieldBackground count={80} />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-space-950/90 to-transparent backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate('/galaxy')}
          className="p-2 rounded-full bg-space-800/60 border border-space-600 text-slate-400 hover:text-white transition-colors"
          aria-label="Back to galaxy"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color }}>{getConstellationEmoji(spark.topic)}</span>
          <span className="capitalize text-slate-400">{spark.topic.replace('-', ' ')}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <motion.span
            className="flex items-center gap-1.5 text-sm text-slate-400"
            animate={reduced ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #4ade80' }} />
            {presenceCount} orbiting now
          </motion.span>
        </div>
      </div>

      {/* Orbit visualization */}
      <div className="relative w-full h-screen flex items-center justify-center" style={{ transform: `scale(${ringScale})`, transformOrigin: 'center' }}>
        {/* Orbit rings */}
        {RING_RADII.map((r, i) => (
          <OrbitRing key={i} radius={r} ringNumber={i + 1} color={color} />
        ))}

        {/* Center spark */}
        <motion.div
          className="absolute z-10 max-w-xs sm:max-w-sm text-center"
          initial={reduced ? undefined : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? undefined : { duration: 0.6, ease: 'easeOut' }}
          style={{ left: '50%', top: '50%', x: '-50%', y: '-50%' } as never}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">{author.avatar}</span>
            <span className="text-sm font-medium text-slate-300">{author.name}</span>
            <span className="text-xs text-slate-600">· {formatRelativeTime(spark.createdAt)}</span>
          </div>
          <div
            className="px-5 py-4 rounded-2xl bg-space-800/80 border backdrop-blur-sm"
            style={{ borderColor: `${color}44`, boxShadow: `0 0 30px ${color}22` }}
          >
            <p className="text-base sm:text-lg text-slate-100 leading-relaxed">{spark.text}</p>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {spark.liveAttention} gravity
          </div>
        </motion.div>

        {/* Satellite bubbles from signals */}
        {spark.signals.map((sig) => {
          const user = getUserById(users, sig.userId);
          if (!user) return null;
          const angle = userAngles[sig.userId] ?? 0;
          const ringRadius = RING_RADII[sig.ring - 1] ?? RING_RADII[0];
          return (
            <SatelliteBubble
              key={sig.id}
              user={user}
              text={sig.text}
              angle={angle}
              ringRadius={ringRadius}
              color={color}
              isNew={newSignalId === sig.id}
            />
          );
        })}

        {/* Engaged users without signals (just avatars on rings) */}
        {allEngagedUserIds
          .filter((uid) => !spark.signals.some((sig) => sig.userId === uid))
          .map((uid) => {
            const user = getUserById(users, uid);
            if (!user) return null;
            const angle = userAngles[uid] ?? 0;
            const ring = spark.orbitRings.find((r) => r.userIds.includes(uid));
            const ringRadius = RING_RADII[(ring?.ring ?? 1) - 1];
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * ringRadius;
            const y = Math.sin(rad) * ringRadius;
            return (
              <div
                key={uid}
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.div
                  className="w-9 h-9 rounded-full bg-space-800 border flex items-center justify-center"
                  style={{ borderColor: `${color}44` }}
                  initial={reduced ? undefined : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduced ? undefined : { type: 'spring', stiffness: 200, damping: 15 }}
                  whileHover={reduced ? undefined : { scale: 1.15 }}
                >
                  <span className="text-base">{user.avatar}</span>
                </motion.div>
              </div>
            );
          })}
      </div>

      {/* Add gravity / send signal */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <AnimatePresence mode="wait">
          {showInput ? (
            <motion.div
              key="input"
              className="flex items-center gap-2 p-2 rounded-2xl bg-space-800/90 border border-space-600 backdrop-blur-md"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                autoFocus
                placeholder="Send a signal..."
                className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 px-3 py-2 focus:outline-none text-sm"
                aria-label="Signal text"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)' }}
                aria-label="Send signal"
              >
                <Send className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              type="button"
              onClick={() => setShowInput(true)}
              className="w-full py-3.5 rounded-full text-white font-medium shadow-lg"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)' }}
              initial={reduced ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: 20 }}
              whileHover={reduced ? undefined : { scale: 1.02 }}
              whileTap={reduced ? undefined : { scale: 0.98 }}
            >
              Add your gravity
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
