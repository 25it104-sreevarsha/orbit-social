import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { useIsMobile } from '@/utils/useIsMobile';
import { getUserById } from '@/utils/clusterCoords';
import StarfieldBackground from '@/components/StarfieldBackground';

const GRAVITY_PULL_RADIUS = 120;
const GRAVITY_STRENGTH = 0.25;

export default function YourSky() {
  const navigate = useNavigate();
  const { users, userConnections, currentUser, sparks, hasSetIdentity } = useApp();
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile(768);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);

  const CENTER_X = isMobile ? 150 : 200;
  const CENTER_Y = isMobile ? 150 : 200;
  const mapScale = isMobile ? 0.72 : 1;
  const mapHeight = isMobile ? 300 : 400;

  const connections = useMemo(() => {
    return userConnections
      .map((conn) => {
        const user = getUserById(users, conn.userId);
        return user ? { ...conn, user } : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [users, userConnections]);

  const fading = connections.filter((c) => c.trend === 'fading');
  const userSparks = sparks.filter((s) => s.authorId === currentUser.id);

  const getConnectionPosition = useCallback(
    (closeness: number, index: number, total: number) => {
      const angle = (index / Math.max(total, 1)) * 2 * Math.PI;
      const distance = (1 - closeness) * 150 + 40;
      return {
        x: CENTER_X + Math.cos(angle) * distance,
        y: CENTER_Y + Math.sin(angle) * distance,
      };
    },
    [CENTER_X, CENTER_Y]
  );

  const basePositions = useMemo(() => {
    return connections.map((conn, i) => ({
      id: conn.userId,
      ...getConnectionPosition(conn.closeness, i, connections.length),
    }));
  }, [connections, getConnectionPosition]);

  const gravityOffsets = useMemo(() => {
    if (!hoveredConnId || reduced) return {};
    const hovered = basePositions.find((p) => p.id === hoveredConnId);
    if (!hovered) return {};
    const offsets: Record<string, { x: number; y: number }> = {};
    for (const pos of basePositions) {
      if (pos.id === hoveredConnId) continue;
      const dx = hovered.x - pos.x;
      const dy = hovered.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < GRAVITY_PULL_RADIUS && dist > 1) {
        const pull = (1 - dist / GRAVITY_PULL_RADIUS) * GRAVITY_STRENGTH;
        offsets[pos.id] = { x: dx * pull, y: dy * pull };
      }
    }
    return offsets;
  }, [hoveredConnId, basePositions, reduced]);

  return (
    <div className="relative min-h-screen bg-space-950 overflow-y-auto">
      <StarfieldBackground count={isMobile ? 60 : 100} />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-space-950/90 to-transparent backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate('/galaxy')}
          className="w-11 h-11 rounded-full bg-space-800/60 border border-space-600 text-slate-400 hover:text-white transition-colors flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Back to galaxy"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-white font-display font-bold text-lg">Your Sky</span>
        <button
          type="button"
          onClick={() => navigate('/launch')}
          aria-label="Launch a spark"
          className="ml-auto w-11 h-11 rounded-full bg-space-800/60 border border-space-600 text-slate-400 hover:text-accent-pink hover:border-accent-pink/50 transition-colors flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Rocket className="w-5 h-5" />
        </button>
      </div>

      <div className="pt-20 px-4 max-w-4xl mx-auto pb-12">
        {/* Soft, dismissible-by-navigation prompt to personalize identity.
            Never blocks anything below it — this sky is already real and
            populated with the seeded demo identity if someone skips it. */}
        {!hasSetIdentity && (
          <motion.div
            className="max-w-md mx-auto mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-space-800/40 border border-space-700"
            initial={reduced ? undefined : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs sm:text-sm text-slate-400">
              You're using a placeholder identity. Want it to feel like yours?
            </p>
            <Link
              to="/onboarding/identity"
              className="shrink-0 text-xs sm:text-sm font-medium text-accent-violet hover:text-accent-cyan transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
            >
              Create your Sky
            </Link>
          </motion.div>
        )}

        {/* Profile header */}
        <motion.div
          className="flex flex-col items-center text-center mb-8 sm:mb-10"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6 }}
        >
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center text-3xl">
              {currentUser.avatar}
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-accent opacity-30 blur-xl" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">{currentUser.name}</h1>
          <p className="text-slate-400 text-sm">
            {currentUser.interests.map((i) => i.replace('-', ' ')).join(' · ')}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-accent-violet" />
            <span>{userSparks.length} sparks launched</span>
          </div>
        </motion.div>

        {/* Personal constellation map */}
        <motion.div
          className="relative w-full max-w-md mx-auto mb-10 sm:mb-12"
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? undefined : { delay: 0.3 }}
        >
          <h2 className="text-center text-sm font-medium uppercase tracking-widest text-slate-400 mb-4">
            Your Constellation
          </h2>
          <div className="relative w-full overflow-hidden" style={{ height: mapHeight }}>
            <div style={{ transform: `scale(${mapScale})`, transformOrigin: 'top center', width: 400, margin: '0 auto' }}>
              {/* Center node */}
              <div
                className="absolute"
                style={{ left: CENTER_X, top: CENTER_Y, transform: 'translate(-50%, -50%)' }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-xl"
                  style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                  animate={reduced ? undefined : { scale: [1, 1.1, 1] }}
                  transition={reduced ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {currentUser.avatar}
                </motion.div>
              </div>

              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                {connections.map((conn, i) => {
                  const basePos = basePositions[i];
                  const offset = gravityOffsets[conn.userId];
                  const pos = offset
                    ? { x: basePos.x + offset.x, y: basePos.y + offset.y }
                    : basePos;
                  const lineColor = conn.trend === 'growing' ? '#8B5CF6' : '#475569';
                  const isHighlighted = hoveredConnId === conn.userId;
                  return (
                    <line
                      key={conn.userId}
                      x1={CENTER_X}
                      y1={CENTER_Y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke={lineColor}
                      strokeWidth={isHighlighted ? 2.5 : conn.trend === 'growing' ? 1.5 : 0.5}
                      strokeOpacity={isHighlighted ? 0.8 : conn.trend === 'growing' ? 0.4 : 0.15}
                      strokeDasharray={conn.trend === 'fading' ? '4 4' : undefined}
                    />
                  );
                })}
              </svg>

              {/* Gravity pull lines between hovered node and nearby nodes */}
              <AnimatePresence>
                {hoveredConnId && !reduced && Object.keys(gravityOffsets).length > 0 && (
                  <motion.svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ overflow: 'visible' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {basePositions.map((pos) => {
                      if (pos.id === hoveredConnId) return null;
                      const offset = gravityOffsets[pos.id];
                      if (!offset) return null;
                      const hovered = basePositions.find((p) => p.id === hoveredConnId)!;
                      return (
                        <motion.line
                          key={`g-${pos.id}`}
                          x1={hovered.x}
                          y1={hovered.y}
                          x2={pos.x + offset.x}
                          y2={pos.y + offset.y}
                          stroke="#8B5CF6"
                          strokeWidth={1}
                          strokeOpacity={0.4}
                          strokeDasharray="3 3"
                          style={{ filter: 'drop-shadow(0 0 3px #8B5CF6)' }}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                      );
                    })}
                  </motion.svg>
                )}
              </AnimatePresence>

              {/* Connection nodes */}
              {connections.map((conn, i) => {
                const basePos = basePositions[i];
                const offset = gravityOffsets[conn.userId];
                const pos = offset
                  ? { x: basePos.x + offset.x, y: basePos.y + offset.y }
                  : basePos;
                const isGrowing = conn.trend === 'growing';
                const nodeColor = isGrowing ? '#8B5CF6' : '#475569';
                const isHovered = hoveredConnId === conn.userId;
                return (
                  <motion.div
                    key={conn.userId}
                    className="absolute flex flex-col items-center"
                    style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
                    initial={reduced ? undefined : { scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: isGrowing ? 1 : 0.5,
                      left: pos.x,
                      top: pos.y,
                    }}
                    transition={reduced ? undefined : {
                      delay: 0.4 + i * 0.05,
                      type: 'spring',
                      stiffness: 100,
                      left: { type: 'spring', stiffness: 120, damping: 18 },
                      top: { type: 'spring', stiffness: 120, damping: 18 },
                    }}
                    onMouseEnter={() => setHoveredConnId(conn.userId)}
                    onMouseLeave={() => setHoveredConnId(null)}
                  >
                    <motion.div
                      className="rounded-full bg-space-800 border flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        width: 32 + conn.closeness * 16,
                        height: 32 + conn.closeness * 16,
                        borderColor: isHovered ? nodeColor : `${nodeColor}66`,
                        boxShadow: isHovered
                          ? `0 0 20px ${nodeColor}, 0 0 40px ${nodeColor}44`
                          : isGrowing
                            ? `0 0 12px ${nodeColor}44`
                            : 'none',
                        outlineColor: nodeColor,
                      }}
                      animate={reduced ? undefined : isGrowing && !isHovered ? { scale: [1, 1.05, 1] } : undefined}
                    transition={reduced ? undefined : { duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                      whileHover={reduced ? undefined : { scale: 1.15 }}
                      tabIndex={0}
                      aria-label={`${conn.user.name}, closeness ${Math.round(conn.closeness * 100)}%, ${conn.trend}`}
                    >
                      <span className="text-base">{conn.user.avatar}</span>
                    </motion.div>
                    <span className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
                      {conn.user.name.split(' ')[0]}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Fading section */}
        {fading.length > 0 && (
          <motion.div
            className="max-w-md mx-auto"
            initial={reduced ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? undefined : { delay: 0.6 }}
          >
            <div className="text-center mb-4">
              <h3 className="text-sm font-medium uppercase tracking-widest text-slate-400 mb-1">
                Fading
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                These connections are drifting apart. Reach out to bring them closer.
              </p>
            </div>
            <div className="space-y-2">
              {fading.map((conn) => (
                <motion.div
                  key={conn.userId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-space-800/30 border border-space-700"
                  whileHover={reduced ? undefined : { borderColor: '#475569' }}
                >
                  <div className="w-9 h-9 rounded-full bg-space-700 flex items-center justify-center opacity-50">
                    <span className="text-base">{conn.user.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-400">{conn.user.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-1 w-16 sm:w-20 rounded-full bg-space-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-600"
                          style={{ width: `${conn.closeness * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600">drifting</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Your sparks */}
        {userSparks.length > 0 && (
          <motion.div
            className="max-w-md mx-auto mt-8 sm:mt-10"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? undefined : { delay: 0.8 }}
          >
            <h3 className="text-sm font-medium uppercase tracking-widest text-slate-400 mb-3 text-center">
              Your Sparks
            </h3>
            <div className="space-y-2">
              {userSparks.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/orbit/${s.id}`)}
                  className="w-full text-left p-3 rounded-xl bg-space-800/40 border border-space-700 hover:border-space-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <p className="text-sm text-slate-300 line-clamp-2">{s.text}</p>
                  <span className="text-xs text-slate-400 capitalize mt-1 inline-block">
                    {s.topic.replace('-', ' ')} · {s.liveAttention} gravity
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
