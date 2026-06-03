'use client';

import { useState } from 'react';
import type { Champion } from '@/lib/types';

interface Props {
  champion: Champion;
  reason?: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  delayMs?: number;
}

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-36 h-36',
};

export default function ChampionTile({
  champion,
  reason,
  size = 'md',
  selected = false,
  onClick,
  delayMs = 0,
}: Props) {
  const [broken, setBroken] = useState(false);
  const interactive = typeof onClick === 'function';

  const portrait = (
    <div
      className={`relative ${SIZES[size]} hex transition-transform duration-300 ${
        interactive ? 'group-hover:scale-105' : ''
      }`}
    >
      {/* gold frame underlay */}
      <div
        className={`absolute inset-0 hex ${
          selected ? 'bg-gold-bright' : 'bg-gold-dark'
        } ${interactive ? 'group-hover:bg-gold' : ''}`}
      />
      <div className="absolute inset-[2px] hex bg-abyss overflow-hidden">
        {!broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={champion.imageUrl}
            alt={champion.name}
            className="w-full h-full object-cover scale-110"
            onError={() => setBroken(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate text-gold font-display text-lg">
            {champion.key.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );

  const body = (
    <>
      {portrait}
      <div
        className={`mt-2 text-center font-display text-sm tracking-display ${
          selected ? 'text-gold-bright text-glow-gold' : 'text-gold-bright/90'
        }`}
      >
        {champion.name}
      </div>
      {reason && (
        <p className="mt-2 text-[13px] leading-relaxed text-gold-bright/70 text-center max-w-[15rem]">
          {reason}
        </p>
      )}
    </>
  );

  const wrapperClass =
    'group flex flex-col items-center animate-fade-up' +
    (interactive ? ' cursor-pointer' : '');

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={wrapperClass}
        style={{ animationDelay: `${delayMs}ms` }}
      >
        {body}
      </button>
    );
  }

  return (
    <div className={wrapperClass} style={{ animationDelay: `${delayMs}ms` }}>
      {body}
    </div>
  );
}
