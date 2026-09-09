import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { useApp } from '@/context/AppContext';
import StarfieldBackground from '@/components/StarfieldBackground';

// Small, deliberately distinct from the mock cast's avatars so a new
// person's presence in the sky reads as clearly "them".
const AVATAR_OPTIONS = ['🌟', '🦄', '🐢', '🍉', '🎧', '🧭', '🌵', '🦉'];
const NAME_MAX_LENGTH = 30;

export default function OnboardingIdentity() {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const { setIdentity } = useApp();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [touched, setTouched] = useState(false);

  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0;

  const handleContinue = () => {
    if (!canContinue) {
      setTouched(true);
      return;
    }
    setIdentity(trimmedName, avatar);
    navigate('/onboarding/interests');
  };

  return (
    <div className="relative min-h-screen bg-space-950 flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <StarfieldBackground count={120} />

      <motion.div
        className="relative z-10 w-full max-w-md flex flex-col items-center"
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
          Who's <span className="text-gradient">orbiting</span>?
        </motion.h2>
        <p className="text-slate-400 text-center mb-8">
          Pick a name and an avatar so people can recognize you in the sky.
        </p>

        {/* Avatar preview + picker */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center text-3xl">
            {avatar}
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-accent opacity-30 blur-xl" />
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8 max-w-xs">
          {AVATAR_OPTIONS.map((emoji) => {
            const selected = avatar === emoji;
            return (
              <motion.button
                key={emoji}
                type="button"
                onClick={() => setAvatar(emoji)}
                aria-label={`Choose avatar ${emoji}`}
                aria-pressed={selected}
                className="relative flex items-center justify-center rounded-full bg-space-800 border text-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  width: 48,
                  height: 48,
                  borderColor: selected ? '#8B5CF6' : '#334155',
                  boxShadow: selected ? '0 0 14px rgba(139, 92, 246, 0.6)' : 'none',
                }}
                whileHover={reduced ? undefined : { scale: 1.08 }}
                whileTap={reduced ? undefined : { scale: 0.95 }}
              >
                {emoji}
              </motion.button>
            );
          })}
        </div>

        {/* Name input */}
        <div className="w-full mb-2">
          <label htmlFor="display-name" className="block text-sm font-medium text-slate-400 mb-2">
            Your display name
          </label>
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleContinue();
            }}
            maxLength={NAME_MAX_LENGTH}
            autoFocus
            placeholder="e.g. Jordan"
            className="w-full p-4 rounded-2xl bg-space-800/60 border border-space-600 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-accent-violet/50 transition-colors text-base"
            aria-label="Display name"
            aria-invalid={touched && !canContinue}
          />
        </div>
        <p className="text-slate-400 text-sm mb-8 h-5">
          {touched && !canContinue ? (
            <span className="text-rose-400">Enter a name to continue</span>
          ) : (
            'This is what shows up next to your signals and sparks.'
          )}
        </p>

        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="px-8 py-3.5 rounded-full font-medium text-base sm:text-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
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
