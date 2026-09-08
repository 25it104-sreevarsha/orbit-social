import { useNavigate } from 'react-router-dom';
import { Search, Compass } from 'lucide-react';
import AvatarOrbit from './AvatarOrbit';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showAvatar?: boolean;
  showSearch?: boolean;
}

export default function TopBar({ searchQuery, onSearchChange, showAvatar = true, showSearch = true }: TopBarProps) {
  const navigate = useNavigate();

  return (
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
          onClick={() => navigate('/discover')}
          aria-label="Discover constellations"
          className="p-2 rounded-full bg-space-800/60 border border-space-600 text-slate-400 hover:text-accent-cyan hover:border-accent-cyan/50 transition-colors"
        >
          <Compass className="w-5 h-5" />
        </button>
        {showAvatar && <AvatarOrbit onClick={() => navigate('/sky')} />}
      </div>
    </div>
  );
}
