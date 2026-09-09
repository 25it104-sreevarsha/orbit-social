import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { getConstellationEmoji } from '@/utils/clusterCoords';

interface ConstellationChipProps {
  name: string;
  selected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConstellationChip({ name, selected, onClick, size = 'md' }: ConstellationChipProps) {
  const reduced = usePrefersReducedMotion();
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative rounded-full font-medium transition-colors border ${sizeClasses[size]} ${
        selected
          ? 'text-white border-transparent'
          : 'text-slate-400 border-space-600 bg-space-800/50 hover:border-space-600 hover:text-slate-300'
      }`}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      style={
        selected
          ? { background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)' }
          : undefined
      }
    >
      <span className="mr-1.5">{getConstellationEmoji(name)}</span>
      <span className="capitalize">{name.replace('-', ' ')}</span>
      {selected && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
          animate={reduced ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
}
