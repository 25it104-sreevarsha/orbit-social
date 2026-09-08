import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { getTopicColor, getConstellationEmoji } from '@/utils/clusterCoords';
import StarfieldBackground from '@/components/StarfieldBackground';

export default function Discover() {
  const navigate = useNavigate();
  const { constellations, sparks } = useApp();
  const reduced = usePrefersReducedMotion();
  const [gravities, setGravities] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    constellations.forEach((c) => { initial[c.name] = c.gravity; });
    setGravities(initial);
  }, [constellations]);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setGravities((prev) => {
        const next = { ...prev };
        for (const c of constellations) {
          const base = prev[c.name] ?? c.gravity;
          const delta = Math.round((Math.random() - 0.4) * 20);
          next[c.name] = Math.max(50, base + delta);
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [constellations, reduced]);

  const sorted = useMemo(() => {
    return [...constellations].sort((a, b) => {
      const ga = gravities[a.name] ?? a.gravity;
      const gb = gravities[b.name] ?? b.gravity;
      return gb - ga;
    });
  }, [constellations, gravities]);

  const maxGravity = Math.max(...sorted.map((c) => gravities[c.name] ?? c.gravity));

  return (
    <div className="relative min-h-screen bg-space-950 overflow-y-auto">
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
        <span className="text-white font-display font-bold text-lg">Discover</span>
      </div>

      <div className="pt-20 px-4 max-w-2xl mx-auto pb-12">
        <motion.div
          className="text-center mb-8"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Current <span className="text-gradient">Gravity</span>
          </h1>
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            Live attention across constellations
          </p>
        </motion.div>

        {/* Leaderboard */}
        <div className="space-y-2">
          {sorted.map((c, i) => {
            const gravity = gravities[c.name] ?? c.gravity;
            const color = getTopicColor(c.name);
            const sparkCount = sparks.filter((s) => s.topic === c.name).length;
            const pct = (gravity / maxGravity) * 100;

            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => navigate('/galaxy')}
                className="w-full text-left p-4 rounded-2xl bg-space-800/40 border border-space-700 hover:border-space-600 transition-colors group"
                initial={reduced ? undefined : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={reduced ? undefined : { delay: i * 0.05 }}
                whileHover={reduced ? undefined : { scale: 1.01 }}
                whileTap={reduced ? undefined : { scale: 0.99 }}
                aria-label={`Constellation ${c.name}, gravity ${gravity}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-slate-600 w-6 text-center">
                    {i + 1}
                  </span>

                  {/* Pulsing node */}
                  <motion.div
                    className="shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      background: `radial-gradient(circle, ${color}88 0%, ${color}44 50%, transparent 70%)`,
                      border: `1.5px solid ${color}AA`,
                    }}
                    animate={reduced ? undefined : { scale: [1, 1.1, 1] }}
                    transition={reduced ? undefined : { duration: 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="text-base">{getConstellationEmoji(c.name)}</span>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-200 capitalize">
                        {c.name.replace('-', ' ')}
                      </span>
                      <motion.span
                        className="text-sm font-bold tabular-nums"
                        style={{ color }}
                        key={gravity}
                        animate={reduced ? undefined : { opacity: [1, 0.5, 1] }}
                        transition={reduced ? undefined : { duration: 0.5 }}
                      >
                        {gravity}
                      </motion.span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-space-700 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={reduced ? undefined : { duration: 0.8, delay: i * 0.05 }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 shrink-0">
                        {sparkCount} {sparkCount === 1 ? 'spark' : 'sparks'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          Gravity reflects live attention — not an algorithmic ranking.
        </p>
      </div>
    </div>
  );
}
