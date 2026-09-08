import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import StarfieldBackground from '@/components/StarfieldBackground';

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative min-h-screen bg-space-950 flex flex-col items-center justify-center px-6 overflow-hidden">
      <StarfieldBackground count={200} />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-2xl"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? undefined : { duration: 1, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-8"
          initial={reduced ? undefined : { scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={reduced ? undefined : { duration: 1.2, delay: 0.3, type: 'spring', stiffness: 60 }}
        >
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-accent opacity-30 blur-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-accent" />
            </div>
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={reduced ? undefined : { rotate: 360 }}
                transition={reduced ? undefined : { duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
                style={{ rotate: angle }}
              >
                <div
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: '50%',
                    top: '0%',
                    background: ['#8B5CF6', '#EC4899', '#22D3EE'][i],
                    boxShadow: `0 0 10px ${['#8B5CF6', '#EC4899', '#22D3EE'][i]}`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.8, delay: 0.5 }}
        >
          Stop scrolling.
          <br />
          <span className="text-gradient">Start orbiting.</span>
        </motion.h1>

        <motion.p
          className="text-slate-400 text-lg sm:text-xl mb-10 max-w-md"
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? undefined : { duration: 0.8, delay: 0.8 }}
        >
          No feeds. No followers. No likes. Just a living sky of ideas and the people drawn to them.
        </motion.p>

        <motion.button
          type="button"
          onClick={() => navigate('/onboarding/interests')}
          className="relative px-8 py-3.5 rounded-full text-white font-medium text-lg overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)' }}
          initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? undefined : { duration: 0.6, delay: 1 }}
          whileHover={reduced ? undefined : { scale: 1.05 }}
          whileTap={reduced ? undefined : { scale: 0.97 }}
        >
          <span className="relative z-10">Enter the Sky</span>
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #22D3EE 0%, #EC4899 50%, #8B5CF6 100%)' }}
          />
        </motion.button>
      </motion.div>

      <motion.p
        className="absolute bottom-8 text-slate-600 text-sm"
        initial={reduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduced ? undefined : { duration: 1, delay: 1.5 }}
      >
        A different way to be together online
      </motion.p>
    </div>
  );
}
