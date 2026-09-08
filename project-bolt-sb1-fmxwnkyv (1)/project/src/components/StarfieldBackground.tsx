import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function StarfieldBackground({ count = 150 }: { count?: number }) {
  const reduced = usePrefersReducedMotion();
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: reduced ? 0.4 : undefined,
          }}
          animate={
            reduced
              ? undefined
              : {
                  opacity: [0.15, 0.6, 0.15],
                  scale: [1, 1.3, 1],
                }
          }
          transition={
            reduced
              ? undefined
              : {
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
      ))}
    </div>
  );
}
