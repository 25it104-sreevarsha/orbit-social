import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { useApp } from '@/context/AppContext';
import StarfieldBackground from '@/components/StarfieldBackground';
import ConstellationChip from '@/components/ConstellationChip';
import { mockData } from '@/data/mockData';

export default function OnboardingInterests() {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const { setSelectedInterests } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= 5) return prev;
      return [...prev, name];
    });
  };

  const handleContinue = () => {
    setSelectedInterests(selected);
    navigate('/galaxy');
  };

  const canContinue = selected.length >= 3;

  return (
    <div className="relative min-h-screen bg-space-950 flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <StarfieldBackground count={120} />

      <motion.div
        className="relative z-10 w-full max-w-2xl flex flex-col items-center"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? undefined : { duration: 0.8 }}
      >
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-3"
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? undefined : { delay: 0.2 }}
        >
          Choose your <span className="text-gradient">constellations</span>
        </motion.h2>
        <p className="text-slate-400 text-center mb-2">
          Pick 3 to 5 topics to seed your sky. You can always drift to new ones.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          {selected.length} of 5 selected
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-10 max-w-lg">
          {mockData.constellations.map((c, i) => (
            <motion.div
              key={c.id}
              initial={reduced ? undefined : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduced ? undefined : { delay: 0.3 + i * 0.05 }}
            >
              <ConstellationChip
                name={c.name}
                selected={selected.includes(c.name)}
                onClick={() => toggle(c.name)}
                size="lg"
              />
            </motion.div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="px-8 py-3.5 rounded-full font-medium text-lg transition-all"
          style={
            canContinue
              ? { background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)', color: 'white' }
              : { background: '#1A1B2E', color: '#475569' }
          }
          whileHover={reduced || !canContinue ? undefined : { scale: 1.05 }}
          whileTap={reduced || !canContinue ? undefined : { scale: 0.97 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}
