import { motion } from 'framer-motion';

interface ConnectionThreadProps {
  /** Origin point, relative to the container's center (px offset). */
  from: { x: number; y: number };
  /** Destination point, relative to the container's center (px offset). */
  to: { x: number; y: number };
  color?: string;
  /** How long the line takes to draw in, in seconds. */
  drawDuration?: number;
  onDrawComplete?: () => void;
}

/**
 * A single "connection-forming" thread that draws from one point to another,
 * matching the visual language of LightThread (dashed glowing line). Unlike
 * LightThread — which cycles through random ambient node pairs — this draws
 * one specific, caller-controlled connection, so it's used for the
 * new-signal flow in OrbitRoom rather than LightThread itself.
 *
 * Mount/unmount this component inside an <AnimatePresence> so it fades in
 * and back out cleanly.
 */
export default function ConnectionThread({
  from,
  to,
  color = '#8B5CF6',
  drawDuration = 0.45,
  onDrawComplete,
}: ConnectionThreadProps) {
  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none z-20"
      width="100%"
      height="100%"
      style={{ overflow: 'visible' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
      transition={{ duration: 0.15 }}
    >
      <motion.line
        x1={`calc(50% + ${from.x}px)`}
        y1={`calc(50% + ${from.y}px)`}
        x2={`calc(50% + ${to.x}px)`}
        y2={`calc(50% + ${to.y}px)`}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="4 4"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.85 }}
        transition={{ duration: drawDuration, ease: 'easeInOut' }}
        onAnimationComplete={onDrawComplete}
      />
    </motion.svg>
  );
}
