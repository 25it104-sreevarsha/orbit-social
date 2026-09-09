import type { Constellation } from '@/data/types';

const TOPIC_CENTERS: Record<string, { x: number; y: number }> = {
  music: { x: 200, y: 150 },
  startups: { x: -250, y: -100 },
  'mental-health': { x: 100, y: -300 },
  gaming: { x: -150, y: 250 },
  art: { x: 350, y: -200 },
  climate: { x: -350, y: 100 },
  books: { x: 0, y: 350 },
  fitness: { x: 300, y: 300 },
  tech: { x: -100, y: -150 },
};

export function getTopicCenter(topic: string): { x: number; y: number } {
  return TOPIC_CENTERS[topic] ?? { x: 0, y: 0 };
}

export function getTopicColor(topic: string): string {
  const colors: Record<string, string> = {
    music: '#8B5CF6',
    startups: '#EC4899',
    'mental-health': '#22D3EE',
    gaming: '#A78BFA',
    art: '#F472B6',
    climate: '#34D399',
    books: '#60A5FA',
    fitness: '#FBBF24',
    tech: '#C084FC',
  };
  return colors[topic] ?? '#8B5CF6';
}

const positionCache: Record<string, { x: number; y: number }> = {};

export function getSparkPosition(sparkId: string, topic: string): { x: number; y: number } {
  if (positionCache[sparkId]) return positionCache[sparkId];
  const center = getTopicCenter(topic);
  const seed = sparkId.charCodeAt(1) * 137 + sparkId.charCodeAt(0) * 31;
  const angle = (seed % 360) * (Math.PI / 180);
  const radius = 40 + (seed % 80);
  const pos = {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
  positionCache[sparkId] = pos;
  return pos;
}

export function getConstellationPositions(constellations: Constellation[]): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  for (const c of constellations) {
    result[c.name] = getTopicCenter(c.name);
  }
  return result;
}

export function formatRelativeTime(iso: string): string {
  const now = new Date('2026-09-08T17:00:00Z').getTime();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff / (1000 * 60));
  if (hours >= 1) return `${hours}h ago`;
  if (mins >= 1) return `${mins}m ago`;
  return 'just now';
}

export function getUserById(users: { id: string; name: string; avatar: string; interests: string[] }[], id: string) {
  return users.find((u) => u.id === id);
}

export function getAttentionRadius(attention: number): number {
  return 16 + Math.min(30, attention / 4);
}

/**
 * Given a desired base radius and angle, returns a radius that guarantees
 * the resulting point clears an axis-aligned rectangle (the center spark
 * card) centered at the origin. Prevents ring avatars from overlapping the
 * card regardless of how tall the card gets (long spark text, wrapped
 * name/timestamp row, etc).
 */
export function getRadiusClearingRect(
  baseRadius: number,
  angleDeg: number,
  rectHalfWidth: number,
  rectHalfHeight: number,
  buffer = 24
): number {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const distX = cos !== 0 ? rectHalfWidth / Math.abs(cos) : Infinity;
  const distY = sin !== 0 ? rectHalfHeight / Math.abs(sin) : Infinity;
  const distToRectEdge = Math.min(distX, distY);
  return Math.max(baseRadius, distToRectEdge + buffer);
}

export function getConstellationEmoji(name: string): string {
  const emojis: Record<string, string> = {
    music: '🎵',
    startups: '🚀',
    'mental-health': '🧠',
    gaming: '🎮',
    art: '🎨',
    climate: '🌍',
    books: '📚',
    fitness: '💪',
    tech: '💡',
  };
  return emojis[name] ?? '✨';
}
