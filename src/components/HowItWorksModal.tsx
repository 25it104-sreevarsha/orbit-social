import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

const PRINCIPLES = [
  'No feeds, no followers, no likes — just a living sky of ideas.',
  'Closeness is gravity: the more attention a spark gets, the bigger it grows.',
  'A Spark is a thought you launch. People who join it form an Orbit.',
  'Your Sky maps who you gravitate toward — connections that grow and fade.',
];

export default function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? undefined : { duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-space-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md rounded-3xl bg-space-800/90 border border-space-600 p-6 shadow-2xl"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
            transition={reduced ? undefined : { type: 'spring', stiffness: 200, damping: 20 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-space-700/60 border border-space-600 text-slate-400 hover:text-white transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-xl font-bold text-white mb-1">
              How Orbit Works
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              A different way to be together online.
            </p>

            <div className="space-y-3">
              {PRINCIPLES.map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: ['rgba(139,92,246,0.15)', 'rgba(236,72,153,0.15)', 'rgba(34,211,238,0.15)', 'rgba(139,92,246,0.15)'][i],
                      color: ['#8B5CF6', '#EC4899', '#22D3EE', '#8B5CF6'][i],
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{line}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-6 py-3 rounded-full text-white font-medium text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)' }}
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
