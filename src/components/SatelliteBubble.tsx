import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import type { User } from '@/data/types';

interface SatelliteBubbleProps {
  user: User;
  text: string;
  angle: number;
  ringRadius: number;
  color: string;
  isNew?: boolean;
}

export default function SatelliteBubble({ user, text, angle, ringRadius, color, isNew }: SatelliteBubbleProps) {
  const reduced = usePrefersReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * ringRadius;
  const y = Math.sin(rad) * ringRadius;

  return (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.button
        type="button"
        className="relative flex items-center justify-center rounded-full bg-space-800 border transition-colors hover:bg-space-700"
        style={{
          width: expanded ? undefined : 44,
          height: expanded ? undefined : 44,
          borderColor: `${color}66`,
          boxShadow: `0 0 10px ${color}33`,
        }}
        onClick={() => setExpanded((e) => !e)}
        aria-label={`Signal from ${user.name}: ${text}`}
        initial={isNew && !reduced ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduced ? undefined : { type: 'spring', stiffness: 200, damping: 15 }}
        whileHover={reduced ? undefined : { scale: 1.1 }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
      >
        <span className="text-lg" style={{ filter: expanded ? 'none' : 'grayscale(0.2)' }}>
          {user.avatar}
        </span>

        <AnimatePresence>
          {expanded && (
            <motion.div
              className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 w-48 sm:w-56 p-3 rounded-xl bg-space-800 border border-space-600 text-left"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: -5 }}
              transition={reduced ? undefined : { duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{user.avatar}</span>
                <span className="text-xs font-medium text-slate-300">{user.name}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {!expanded && (
        <div
          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-400 pointer-events-none"
        >
          {user.name.split(' ')[0]}
        </div>
      )}
    </div>
  );
}
