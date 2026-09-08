import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { getAttentionRadius, getTopicColor } from '@/utils/clusterCoords';

interface GalaxyNodeProps {
  x: number;
  y: number;
  attention: number;
  topic: string;
  label: string;
  highlighted: boolean;
  dimmed: boolean;
  onClick: () => void;
  pulsing?: boolean;
}

export default function GalaxyNode({
  x,
  y,
  attention,
  topic,
  label,
  highlighted,
  dimmed,
  onClick,
  pulsing = true,
}: GalaxyNodeProps) {
  const reduced = usePrefersReducedMotion();
  const radius = getAttentionRadius(attention);
  const color = getTopicColor(topic);

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: x, top: y, x: '-50%', y: '-50%' } as never}
      tabIndex={0}
      role="button"
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onClick();
        }
      }}
      whileHover={reduced ? undefined : { scale: 1.2 }}
      whileTap={reduced ? undefined : { scale: 0.9 }}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: radius * 2,
          height: radius * 2,
          background: `radial-gradient(circle, ${color}88 0%, ${color}44 50%, transparent 70%)`,
          border: `1.5px solid ${color}AA`,
          boxShadow: highlighted
            ? `0 0 30px ${color}, 0 0 60px ${color}66`
            : `0 0 15px ${color}66`,
          opacity: dimmed ? 0.3 : 1,
        }}
        animate={
          reduced || !pulsing
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: dimmed ? [0.3, 0.2, 0.3] : [0.85, 1, 0.85],
              }
        }
        transition={
          reduced || !pulsing
            ? undefined
            : {
                duration: 3 + (attention % 3),
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        {highlighted && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${color}` }}
            animate={reduced ? undefined : { scale: [1, 1.5], opacity: [0.8, 0] }}
            transition={reduced ? undefined : { duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
