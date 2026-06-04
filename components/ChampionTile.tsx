'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
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
  const tileRef = useRef<HTMLDivElement>(null);
  const hexRef = useRef<HTMLDivElement>(null);
  const interactive = typeof onClick === 'function';

  // Entrance animation
  useEffect(() => {
    if (!tileRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tileRef.current,
        { opacity: 0, y: 24, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          delay: delayMs / 1000,
          ease: 'back.out(1.3)',
        },
      );
    }, tileRef.current!);

    return () => ctx.revert();
  }, [delayMs]);

  // Hover animation for interactive tiles
  const handleMouseEnter = useCallback(() => {
    if (!hexRef.current || !interactive) return;
    gsap.to(hexRef.current, {
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    if (!hexRef.current || !interactive) return;
    gsap.to(hexRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [interactive]);

  const portrait = (
    <div
      ref={hexRef}
      className={`relative ${SIZES[size]} hex transition-transform duration-300`}
    >
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
    'group flex flex-col items-center' +
    (interactive ? ' cursor-pointer' : '');

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={wrapperClass}
        ref={tileRef as React.Ref<HTMLDivElement> & React.Ref<HTMLButtonElement>}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ opacity: 0 }}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      ref={tileRef}
      className={wrapperClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ opacity: 0 }}
    >
      {body}
    </div>
  );
}
