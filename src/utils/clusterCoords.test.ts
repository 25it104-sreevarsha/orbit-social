import { describe, expect, it } from 'vitest';
import { getRadiusClearingRect, getConstellationEmoji } from './clusterCoords';

describe('getRadiusClearingRect', () => {
  it('returns at least the base radius when the rectangle is small relative to it', () => {
    // A tiny 2x2 rect can never push the clearing radius past the base radius.
    const baseRadius = 200;
    const result = getRadiusClearingRect(baseRadius, 45, 1, 1, 0);
    expect(result).toBeGreaterThanOrEqual(baseRadius);
    expect(result).toBe(baseRadius);
  });

  it('returns at least the base radius across a range of angles', () => {
    const baseRadius = 150;
    for (const angle of [0, 30, 60, 90, 120, 180, 270]) {
      expect(getRadiusClearingRect(baseRadius, angle, 5, 5)).toBeGreaterThanOrEqual(baseRadius);
    }
  });

  it('returns a larger radius when the angle points directly at a wide rectangle', () => {
    const baseRadius = 80;
    // Wide, short rectangle: half-width 300, half-height 50.
    const angleAtWideAxis = getRadiusClearingRect(baseRadius, 0, 300, 50);
    const angleAtNarrowAxis = getRadiusClearingRect(baseRadius, 90, 300, 50);

    // Pointing straight at the wide side must clear further than the base radius.
    expect(angleAtWideAxis).toBeGreaterThan(baseRadius);
    // And further than pointing at the rectangle's narrow (short) side.
    expect(angleAtWideAxis).toBeGreaterThan(angleAtNarrowAxis);
  });

  it('returns a larger radius when the angle points directly at a tall rectangle', () => {
    const baseRadius = 80;
    // Tall, narrow rectangle: half-width 50, half-height 300.
    const angleAtTallAxis = getRadiusClearingRect(baseRadius, 90, 50, 300);
    const angleAtNarrowAxis = getRadiusClearingRect(baseRadius, 0, 50, 300);

    expect(angleAtTallAxis).toBeGreaterThan(baseRadius);
    expect(angleAtTallAxis).toBeGreaterThan(angleAtNarrowAxis);
  });
});

describe('getConstellationEmoji', () => {
  it('returns the mapped emoji for known constellation names', () => {
    expect(getConstellationEmoji('music')).toBe('🎵');
    expect(getConstellationEmoji('startups')).toBe('🚀');
    expect(getConstellationEmoji('mental-health')).toBe('🧠');
    expect(getConstellationEmoji('gaming')).toBe('🎮');
    expect(getConstellationEmoji('art')).toBe('🎨');
    expect(getConstellationEmoji('climate')).toBe('🌍');
    expect(getConstellationEmoji('books')).toBe('📚');
    expect(getConstellationEmoji('fitness')).toBe('💪');
    expect(getConstellationEmoji('tech')).toBe('💡');
  });

  it('falls back to a sparkle for unknown topics', () => {
    expect(getConstellationEmoji('some-unknown-topic')).toBe('✨');
    expect(getConstellationEmoji('')).toBe('✨');
  });
});
