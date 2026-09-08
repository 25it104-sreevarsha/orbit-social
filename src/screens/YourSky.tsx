import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { getUserById } from '@/utils/clusterCoords';
import StarfieldBackground from '@/components/StarfieldBackground';

export default function YourSky() {
  const navigate = useNavigate();
  const { users, userConnections, currentUser, sparks } = useApp();
  const reduced = usePrefersReducedMotion();

  const connections = useMemo(() => {
    return userConnections
      .map((conn) => {
        const user = getUserById(users, conn.userId);
        return user ? { ...conn, user } : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [users, userConnections]);

  const growing = connections.filter((c) => c.trend === 'growing');
  const fading = connections.filter((c) => c.trend === 'fading');

  const userSparks = sparks.filter((s) => s.authorId === currentUser.id);

  const centerX = 200;
  const centerY = 200;

  const getConnectionPosition = (closeness: number, index: number, total: number) => {
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI;
    const distance = (1 - closeness) * 150 + 40;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  };

  return (
    <div className="relative min-h-screen bg-space-950 overflow-y-auto">
      <StarfieldBackground count={100} />

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
        <span className="text-white font-display font-bold text-lg">Your Sky</span>
      </div>

      <div className="pt-20 px-4 max-w-4xl mx-auto pb-12">
        {/* Profile header */}
        <motion.div
          className="flex flex-col items-center text-center mb-10"
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
          <p className="text-slate-500 text-sm">
            {currentUser.interests.map((i) => i.replace('-', ' ')).join(' · ')}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-accent-violet" />
            <span>{userSparks.length} sparks launched</span>
          </div>
        </motion.div>

        {/* Personal constellation map */}
        <motion.div
          className="relative w-full max-w-md mx-auto mb-12"
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? undefined : { delay: 0.3 }}
        >
          <h2 className="text-center text-sm font-medium uppercase tracking-widest text-slate-500 mb-4">
            Your Constellation
          </h2>
          <div className="relative w-full" style={{ height: 400 }}>
            {/* Center node */}
            <div
              className="absolute"
              style={{ left: centerX, top: centerY, transform: 'translate(-50%, -50%)' }}
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

            {/* Connection lines and nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {connections.map((conn, i) => {
                const pos = getConnectionPosition(conn.closeness, i, connections.length);
                const color = conn.trend === 'growing' ? '#8B5CF6' : '#475569';
                return (
                  <line
                    key={conn.userId}
                    x1={centerX}
                    y1={centerY}
                    x2={pos.x}
                    y2={pos.y}
                    stroke={color}
                    strokeWidth={conn.trend === 'growing' ? 1.5 : 0.5}
                    strokeOpacity={conn.trend === 'growing' ? 0.4 : 0.15}
                    strokeDasharray={conn.trend === 'fading' ? '4 4' : undefined}
                  />
                );
              })}
            </svg>

            {/* Connection nodes */}
            {connections.map((conn, i) => {
              const pos = getConnectionPosition(conn.closeness, i, connections.length);
              const isGrowing = conn.trend === 'growing';
              const color = isGrowing ? '#8B5CF6' : '#475569';
              return (
                <motion.div
                  key={conn.userId}
                  className="absolute flex flex-col items-center"
                  style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
                  initial={reduced ? undefined : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: isGrowing ? 1 : 0.5 }}
                  transition={reduced ? undefined : { delay: 0.4 + i * 0.05, type: 'spring', stiffness: 100 }}
                >
                  <motion.div
                    className="rounded-full bg-space-800 border flex items-center justify-center"
                    style={{
                      width: 32 + conn.closeness * 16,
                      height: 32 + conn.closeness * 16,
                      borderColor: `${color}66`,
                      boxShadow: isGrowing ? `0 0 12px ${color}44` : 'none',
                    }}
                    animate={reduced ? undefined : isGrowing ? { scale: [1, 1.05, 1] } : undefined}
                    transition={reduced ? undefined : { duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="text-base">{conn.user.avatar}</span>
                  </motion.div>
                  <span className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                    {conn.user.name.split(' ')[0]}
                  </span>
                </motion.div>
              );
            })}
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
              <h3 className="text-sm font-medium uppercase tracking-widest text-slate-600 mb-1">
                Fading
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
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
                  <div className="flex-1">
                    <span className="text-sm text-slate-400">{conn.user.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-1 w-20 rounded-full bg-space-700 overflow-hidden">
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
            className="max-w-md mx-auto mt-10"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? undefined : { delay: 0.8 }}
          >
            <h3 className="text-sm font-medium uppercase tracking-widest text-slate-500 mb-3 text-center">
              Your Sparks
            </h3>
            <div className="space-y-2">
              {userSparks.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/orbit/${s.id}`)}
                  className="w-full text-left p-3 rounded-xl bg-space-800/40 border border-space-700 hover:border-space-600 transition-colors"
                >
                  <p className="text-sm text-slate-300 line-clamp-2">{s.text}</p>
                  <span className="text-xs text-slate-600 capitalize mt-1 inline-block">
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
