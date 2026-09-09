import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';

interface LightThreadProps {
  nodes: { x: number; y: number }[];
  color?: string;
}

interface ThreadPair {
  from: { x: number; y: number };
  to: { x: number; y: number };
  key: string;
}

export default function LightThread({ nodes, color = '#8B5CF6' }: LightThreadProps) {
  const reduced = usePrefersReducedMotion();
  const [thread, setThread] = useState<ThreadPair | null>(null);

  useEffect(() => {
    if (reduced || nodes.length < 2) return;
    const interval = setInterval(() => {
      if (nodes.length < 2) return;
      const i = Math.floor(Math.random() * nodes.length);
      let j = Math.floor(Math.random() * nodes.length);
      while (j === i) j = Math.floor(Math.random() * nodes.length);
      setThread({
        from: nodes[i],
        to: nodes[j],
        key: `${Date.now()}`,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [nodes, reduced]);

  if (reduced || !thread) return null;

  return (
    <AnimatePresence>
      {thread && (
        <motion.svg
          key={thread.key}
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.line
            x1={thread.from.x}
            y1={thread.from.y}
            x2={thread.to.x}
            y2={thread.to.y}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.8, 0] }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            onAnimationComplete={() => setThread(null)}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}
