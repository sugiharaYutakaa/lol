import type { LaneId } from '@/lib/types';

interface Props {
  lane: LaneId;
  className?: string;
}

/**
 * Stylized position glyphs inspired by the in-game role icons (diamond lane
 * with a marker indicating the position on the map).
 */
export default function LaneIcon({ lane, className = 'w-10 h-10' }: Props) {
  const stroke = 'currentColor';
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 6,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {/* lane diamond */}
      <path d="M50 8 L92 50 L50 92 L8 50 Z" {...common} opacity={0.35} />
      {lane === 'top' && (
        <>
          <path d="M16 50 L50 16 L84 50" {...common} />
          <circle cx="30" cy="36" r="7" fill={stroke} />
        </>
      )}
      {lane === 'mid' && (
        <>
          <path d="M22 78 L78 22" {...common} />
          <circle cx="50" cy="50" r="8" fill={stroke} />
        </>
      )}
      {lane === 'bot' && (
        <>
          <path d="M16 50 L50 84 L84 50" {...common} />
          <circle cx="70" cy="64" r="7" fill={stroke} />
        </>
      )}
      {lane === 'jungle' && (
        <>
          <path
            d="M50 20 C36 40 36 60 50 80 C64 60 64 40 50 20 Z"
            {...common}
          />
          <path d="M50 80 L50 44" {...common} />
        </>
      )}
      {lane === 'support' && (
        <>
          <path
            d="M50 30 C42 18 22 22 24 42 C26 60 50 74 50 74 C50 74 74 60 76 42 C78 22 58 18 50 30 Z"
            {...common}
          />
        </>
      )}
    </svg>
  );
}
