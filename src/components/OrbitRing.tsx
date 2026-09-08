import { usePrefersReducedMotion } from '@/utils/usePrefersReducedMotion';

interface OrbitRingProps {
  radius: number;
  ringNumber: number;
  color?: string;
}

export default function OrbitRing({ radius, ringNumber, color = '#8B5CF6' }: OrbitRingProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        borderColor: `${color}22`,
        borderWidth: ringNumber === 1 ? 1.5 : 1,
        borderStyle: 'dashed',
        opacity: reduced ? 0.3 : 0.4,
      }}
      aria-hidden="true"
    />
  );
}
