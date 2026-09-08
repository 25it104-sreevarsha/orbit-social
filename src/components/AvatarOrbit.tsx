import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';

interface AvatarOrbitProps {
  size?: number;
  onClick?: () => void;
  ariaLabel?: string;
}

export default function AvatarOrbit({ size = 40, onClick, ariaLabel }: AvatarOrbitProps) {
  const reduced = usePrefersReducedMotion();
  const center = size / 2;
  const orbitRadius = size * 0.35;
  const dots = [
    { color: '#8B5CF6', angle: 0, duration: 6 },
    { color: '#EC4899', angle: 120, duration: 8 },
    { color: '#22D3EE', angle: 240, duration: 7 },
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? 'Your Sky'}
      className="relative flex items-center justify-center rounded-full bg-space-800 border border-space-600 hover:border-accent-violet/50 transition-colors"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute rounded-full bg-gradient-accent opacity-80"
        style={{ width: size * 0.3, height: size * 0.3 }}
      />
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            background: dot.color,
            boxShadow: `0 0 6px ${dot.color}`,
          }}
          animate={
            reduced
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={
            reduced
              ? undefined
              : {
                  duration: dot.duration,
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
          initial={{ rotate: dot.angle }}
        >
          <div
            style={{
              position: 'absolute',
              left: orbitRadius - 2,
              top: -2,
              width: 4,
              height: 4,
            }}
            className="rounded-full"
          />
        </motion.div>
      ))}
    </button>
  );
}
