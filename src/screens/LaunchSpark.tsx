import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Rocket } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { mockData } from '@/data/mockData';
import StarfieldBackground from '@/components/StarfieldBackground';
import ConstellationChip from '@/components/ConstellationChip';

export default function LaunchSpark() {
  const navigate = useNavigate();
  const { addSpark } = useApp();
  const reduced = usePrefersReducedMotion();
  const [text, setText] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  const canLaunch = text.trim().length > 0 && topic !== null;

  const handleLaunch = () => {
    if (!canLaunch || !topic) return;
    setLaunching(true);
    addSpark(text.trim(), topic);
    setTimeout(() => {
      navigate('/galaxy');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-space-950 flex flex-col">
      <StarfieldBackground count={100} />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-space-950/90 to-transparent backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate('/galaxy')}
          className="w-11 h-11 rounded-full bg-space-800/60 border border-space-600 text-slate-400 hover:text-white transition-colors flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Back to galaxy"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-white font-display font-bold text-lg">Launch a Spark</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
        <motion.div
          className="w-full max-w-lg"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6 }}
        >
          {/* Composer */}
          <div className="relative">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                What's pulling at you?
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="A thought, a question, a spark of an idea..."
                rows={4}
                maxLength={280}
                autoFocus
                className="w-full p-4 rounded-2xl bg-space-800/60 border border-space-600 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-accent-violet/50 transition-colors resize-none text-base leading-relaxed"
                aria-label="Spark text"
              />
              <div className="text-right text-xs text-slate-400 mt-1">
                {text.length}/280
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-3">
                Which constellation does it belong to?
              </label>
              <div className="flex flex-wrap gap-2">
                {mockData.constellations.map((c) => (
                  <ConstellationChip
                    key={c.id}
                    name={c.name}
                    selected={topic === c.name}
                    onClick={() => setTopic(topic === c.name ? null : c.name)}
                  />
                ))}
              </div>
            </div>

            {/* Launch button */}
            <motion.button
              type="button"
              onClick={handleLaunch}
              disabled={!canLaunch || launching}
              className="w-full py-3.5 rounded-full font-medium text-base sm:text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={
                canLaunch && !launching
                  ? { background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)', color: 'white' }
                  : { background: '#1A1B2E', color: '#475569' }
              }
              whileHover={reduced || !canLaunch ? undefined : { scale: 1.02 }}
              whileTap={reduced || !canLaunch ? undefined : { scale: 0.98 }}
            >
              <Rocket className="w-5 h-5" />
              {launching ? 'Launching...' : 'Launch'}
            </motion.button>
          </div>

          {/* Launch animation overlay */}
          <AnimatePresence>
            {launching && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-space-950/80" />
                <motion.div
                  className="relative"
                  initial={reduced ? undefined : { scale: 0, y: 100 }}
                  animate={reduced ? undefined : { scale: 1, y: -200 }}
                  transition={reduced ? undefined : { duration: 1, ease: 'easeOut' }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-accent" style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)' }} />
                  <motion.div
                    className="absolute -inset-4 rounded-full"
                    style={{ border: '2px solid #8B5CF6' }}
                    animate={reduced ? undefined : { scale: [1, 2], opacity: [0.8, 0] }}
                    transition={reduced ? undefined : { duration: 1, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
