import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, HelpCircle, Rocket } from 'lucide-react';
import AvatarOrbit from './AvatarOrbit';
import HowItWorksModal from './HowItWorksModal';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showAvatar?: boolean;
  showSearch?: boolean;
}

export default function TopBar({ searchQuery, onSearchChange, showAvatar = true, showSearch = true }: TopBarProps) {
  const navigate = useNavigate();
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 sm:px-6 py-3 bg-gradient-to-b from-space-950/90 to-transparent backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate('/galaxy')}
          className="flex items-center gap-2 text-white font-display font-bold text-lg sm:text-xl shrink-0"
        >
          <span className="text-gradient">Orbit</span>
        </button>

        {showSearch && (
          <div className="flex-1 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="What are you curious about?"
              className="w-full bg-space-800/60 border border-space-600 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-accent-violet/50 transition-colors"
              aria-label="Search sparks and topics"
            />
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setHowItWorksOpen(true)}
            aria-label="How Orbit works"
            className="w-11 h-11 rounded-full bg-space-800/60 border border-space-600 text-slate-400 hover:text-white hover:border-accent-violet/50 transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            aria-label="Discover constellations"
            className="w-11 h-11 rounded-full bg-space-800/60 border border-space-600 text-slate-400 hover:text-accent-cyan hover:border-accent-cyan/50 transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Compass className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/launch')}
            aria-label="Launch a spark"
            className="w-11 h-11 rounded-full bg-space-800/60 border border-space-600 text-slate-400 hover:text-accent-pink hover:border-accent-pink/50 transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Rocket className="w-5 h-5" />
          </button>
          {showAvatar && <AvatarOrbit onClick={() => navigate('/sky')} />}
        </div>
      </div>

      <HowItWorksModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </>
  );
}
