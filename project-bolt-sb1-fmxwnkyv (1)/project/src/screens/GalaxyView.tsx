import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';
import { getSparkPosition, getTopicColor, getTopicCenter, getAttentionRadius, getConstellationEmoji } from '@/utils/clusterCoords';
import TopBar from '@/components/TopBar';
import GalaxyNode from '@/components/GalaxyNode';
import LightThread from '@/components/LightThread';

interface Transform {
  x: number;
  y: number;
  scale: number;
}

const MAP_OFFSET_X = 600;
const MAP_OFFSET_Y = 400;
const GRAVITY_PULL_RADIUS = 160;
const GRAVITY_STRENGTH = 0.35;

export default function GalaxyView() {
  const navigate = useNavigate();
  const { sparks, constellations, highlightSparkId } = useApp();
  const reduced = usePrefersReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
  const [hoveredSparkId, setHoveredSparkId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const [liveAttentions, setLiveAttentions] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    sparks.forEach((s) => { initial[s.id] = s.liveAttention; });
    setLiveAttentions(initial);
  }, [sparks]);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setLiveAttentions((prev) => {
        const next = { ...prev };
        for (const s of sparks) {
          const base = prev[s.id] ?? s.liveAttention;
          const delta = Math.round((Math.random() - 0.45) * 6);
          next[s.id] = Math.max(5, base + delta);
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [sparks, reduced]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [transform.x, transform.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTransform((t) => ({ ...t, x: dragStart.current.tx + dx, y: dragStart.current.ty + dy }));
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setTransform((t) => {
      const newScale = Math.max(0.3, Math.min(3, t.scale + delta * t.scale));
      return { ...t, scale: newScale };
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 50;
    if (e.key === 'ArrowUp') setTransform((t) => ({ ...t, y: t.y + step }));
    if (e.key === 'ArrowDown') setTransform((t) => ({ ...t, y: t.y - step }));
    if (e.key === 'ArrowLeft') setTransform((t) => ({ ...t, x: t.x + step }));
    if (e.key === 'ArrowRight') setTransform((t) => ({ ...t, x: t.x - step }));
    if (e.key === '+' || e.key === '=') setTransform((t) => ({ ...t, scale: Math.min(3, t.scale * 1.1) }));
    if (e.key === '-') setTransform((t) => ({ ...t, scale: Math.max(0.3, t.scale * 0.9) }));
  }, []);

  const searchLower = searchQuery.toLowerCase().trim();
  const filteredSparks = useMemo(() => {
    return sparks.filter((s) => {
      if (filterTopic && s.topic !== filterTopic) return false;
      return true;
    });
  }, [sparks, filterTopic]);

  const isMatch = (text: string, topic: string) => {
    if (!searchLower) return true;
    return text.toLowerCase().includes(searchLower) || topic.toLowerCase().includes(searchLower);
  };

  const nodePositions = useMemo(() => {
    return filteredSparks.map((s) => {
      const pos = getSparkPosition(s.id, s.topic);
      return { id: s.id, x: pos.x + MAP_OFFSET_X, y: pos.y + MAP_OFFSET_Y };
    });
  }, [filteredSparks]);

  // Compute gravity pull offsets for same-topic nodes when one is hovered
  const gravityOffsets = useMemo(() => {
    if (!hoveredSparkId || reduced) return {};
    const hoveredSpark = sparks.find((s) => s.id === hoveredSparkId);
    if (!hoveredSpark) return {};
    const hoveredPos = getSparkPosition(hoveredSpark.id, hoveredSpark.topic);
    const hx = hoveredPos.x + MAP_OFFSET_X;
    const hy = hoveredPos.y + MAP_OFFSET_Y;
    const offsets: Record<string, { x: number; y: number }> = {};
    for (const s of filteredSparks) {
      if (s.id === hoveredSparkId) continue;
      if (s.topic !== hoveredSpark.topic) continue;
      const pos = getSparkPosition(s.id, s.topic);
      const sx = pos.x + MAP_OFFSET_X;
      const sy = pos.y + MAP_OFFSET_Y;
      const dx = hx - sx;
      const dy = hy - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < GRAVITY_PULL_RADIUS && dist > 1) {
        const pull = (1 - dist / GRAVITY_PULL_RADIUS) * GRAVITY_STRENGTH;
        offsets[s.id] = { x: dx * pull, y: dy * pull };
      }
    }
    return offsets;
  }, [hoveredSparkId, sparks, filteredSparks, reduced]);

  // Connection lines for hovered node's cluster
  const gravityLines = useMemo(() => {
    if (!hoveredSparkId || reduced) return [];
    const hoveredSpark = sparks.find((s) => s.id === hoveredSparkId);
    if (!hoveredSpark) return [];
    const hoveredPos = getSparkPosition(hoveredSpark.id, hoveredSpark.topic);
    const hx = hoveredPos.x + MAP_OFFSET_X;
    const hy = hoveredPos.y + MAP_OFFSET_Y;
    const color = getTopicColor(hoveredSpark.topic);
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string; key: string }[] = [];
    for (const s of filteredSparks) {
      if (s.id === hoveredSparkId) continue;
      if (s.topic !== hoveredSpark.topic) continue;
      const pos = getSparkPosition(s.id, s.topic);
      const sx = pos.x + MAP_OFFSET_X;
      const sy = pos.y + MAP_OFFSET_Y;
      const dist = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2);
      if (dist < GRAVITY_PULL_RADIUS) {
        lines.push({ x1: hx, y1: hy, x2: sx, y2: sy, color, key: s.id });
      }
    }
    return lines;
  }, [hoveredSparkId, sparks, filteredSparks, reduced]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showMobileStream = isMobile;

  const sortedForMobile = useMemo(() => {
    return [...filteredSparks].sort((a, b) => {
      const aAtt = liveAttentions[a.id] ?? a.liveAttention;
      const bAtt = liveAttentions[b.id] ?? b.liveAttention;
      return bAtt - aAtt;
    });
  }, [filteredSparks, liveAttentions]);

  return (
    <div className="relative min-h-screen bg-space-950 overflow-hidden">
      <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Topic filter chips */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex gap-2 overflow-x-auto max-w-[90vw] pb-1 px-2">
        <button
          type="button"
          onClick={() => setFilterTopic(null)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
            !filterTopic
              ? 'bg-gradient-accent text-white border-transparent'
              : 'bg-space-800/60 text-slate-400 border-space-600'
          }`}
        >
          All
        </button>
        {constellations.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilterTopic(filterTopic === c.name ? null : c.name)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border capitalize ${
              filterTopic === c.name
                ? 'text-white border-transparent'
                : 'bg-space-800/60 text-slate-400 border-space-600'
            }`}
            style={filterTopic === c.name ? { background: getTopicColor(c.name) } : undefined}
          >
            {getConstellationEmoji(c.name)} {c.name.replace('-', ' ')}
          </button>
        ))}
      </div>

      {showMobileStream ? (
        <MobileOrbitStream
          sparks={sortedForMobile}
          liveAttentions={liveAttentions}
          searchLower={searchLower}
          onNodeClick={(id) => navigate(`/orbit/${id}`)}
        />
      ) : (
        <div
          ref={containerRef}
          className="absolute inset-0 no-select touch-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="application"
          aria-label="Galaxy map of active sparks. Use arrow keys to pan, plus and minus to zoom."
        >
          {/* Constellation labels */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: 'center',
            }}
          >
            {constellations.map((c) => {
              const center = getTopicCenter(c.name);
              return (
              <div
                key={c.id}
                className="absolute pointer-events-none"
                style={{ left: center.x + MAP_OFFSET_X, top: center.y + MAP_OFFSET_Y }}
              >
                <div className="text-xs font-medium uppercase tracking-widest text-slate-600 -translate-x-1/2 -translate-y-8 text-center whitespace-nowrap">
                  {c.name.replace('-', ' ')}
                </div>
              </div>
              );
            })}

            {/* Gravity connection lines on hover */}
            <AnimatePresence>
              {gravityLines.length > 0 && (
                <motion.svg
                  className="absolute inset-0 pointer-events-none"
                  width="100%"
                  height="100%"
                  style={{ overflow: 'visible' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {gravityLines.map((line) => (
                    <motion.line
                      key={line.key}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke={line.color}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      strokeDasharray="3 3"
                      style={{ filter: `drop-shadow(0 0 3px ${line.color})` }}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  ))}
                </motion.svg>
              )}
            </AnimatePresence>

            {/* Light threads */}
            {!reduced && nodePositions.length > 1 && (
              <div className="absolute inset-0" style={{ width: 1200, height: 800 }}>
                <LightThread nodes={nodePositions} color="#8B5CF6" />
              </div>
            )}

            {/* Nodes */}
            {filteredSparks.map((s) => {
              const pos = getSparkPosition(s.id, s.topic);
              const attention = liveAttentions[s.id] ?? s.liveAttention;
              const matched = isMatch(s.text, s.topic);
              const highlighted = highlightSparkId === s.id;
              const pullOffset = gravityOffsets[s.id];
              const isActive = hoveredSparkId === s.id;
              return (
                <GalaxyNode
                  key={s.id}
                  x={pos.x + MAP_OFFSET_X}
                  y={pos.y + MAP_OFFSET_Y}
                  attention={attention}
                  topic={s.topic}
                  label={`Spark: ${s.topic}, ${attention} people orbiting`}
                  highlighted={highlighted}
                  dimmed={searchLower !== '' && !matched}
                  onClick={() => navigate(`/orbit/${s.id}`)}
                  onHover={(topic) => {
                    if (topic) {
                      setHoveredTopic(topic);
                      setHoveredSparkId(s.id);
                    } else {
                      setHoveredTopic(null);
                      setHoveredSparkId(null);
                    }
                  }}
                  pullOffset={pullOffset}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Zoom controls */}
      {!showMobileStream && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setTransform((t) => ({ ...t, scale: Math.min(3, t.scale * 1.2) }))}
            className="w-10 h-10 rounded-full bg-space-800/80 border border-space-600 text-slate-300 hover:text-white hover:border-accent-violet/50 flex items-center justify-center transition-colors"
            aria-label="Zoom in"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setTransform((t) => ({ ...t, scale: Math.max(0.3, t.scale * 0.8) }))}
            className="w-10 h-10 rounded-full bg-space-800/80 border border-space-600 text-slate-300 hover:text-white hover:border-accent-violet/50 flex items-center justify-center transition-colors"
            aria-label="Zoom out"
          >
            <Layers className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            className="w-10 h-10 rounded-full bg-space-800/80 border border-space-600 text-slate-300 hover:text-white hover:border-accent-violet/50 flex items-center justify-center transition-colors text-xs"
            aria-label="Reset view"
          >
            1:1
          </button>
        </div>
      )}

      {/* Launch button */}
      <motion.button
        type="button"
        onClick={() => navigate('/launch')}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full text-white font-medium flex items-center gap-2 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)' }}
        whileHover={reduced ? undefined : { scale: 1.05 }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
        aria-label="Launch a new spark"
      >
        <Plus className="w-5 h-5" />
        Launch a Spark
      </motion.button>
    </div>
  );
}

function MobileOrbitStream({
  sparks,
  liveAttentions,
  searchLower,
  onNodeClick,
}: {
  sparks: ReturnType<typeof useApp>['sparks'];
  liveAttentions: Record<string, number>;
  searchLower: string;
  onNodeClick: (id: string) => void;
}) {
  return (
    <div className="pt-28 pb-24 px-4 space-y-3">
      {sparks.map((s) => {
        const attention = liveAttentions[s.id] ?? s.liveAttention;
        const matched = !searchLower || s.text.toLowerCase().includes(searchLower) || s.topic.toLowerCase().includes(searchLower);
        if (!matched) return null;
        const color = getTopicColor(s.topic);
        return (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => onNodeClick(s.id)}
            className="w-full text-left p-4 rounded-2xl bg-space-800/60 border border-space-600 hover:border-space-600 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 rounded-full flex items-center justify-center"
                style={{
                  width: getAttentionRadius(attention) * 2,
                  height: getAttentionRadius(attention) * 2,
                  background: `radial-gradient(circle, ${color}88 0%, ${color}44 50%, transparent 70%)`,
                  border: `1.5px solid ${color}AA`,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 line-clamp-2 mb-1">{s.text}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="capitalize" style={{ color }}>{getConstellationEmoji(s.topic)} {s.topic.replace('-', ' ')}</span>
                  <span>·</span>
                  <span>{attention} orbiting</span>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
