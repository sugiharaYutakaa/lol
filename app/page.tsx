'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { LANES } from '@/lib/lanes';
import LaneIcon from '@/components/LaneIcon';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Title area entrance
      tl.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: -10, letterSpacing: '0.1em' },
        { opacity: 1, y: 0, letterSpacing: '0.4em', duration: 0.8 },
      )
        .fromTo(
          '.hero-title',
          { opacity: 0, scale: 0.85, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)' },
          '-=0.5',
        )
        .fromTo(
          '.hero-filigree',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.4',
        )
        .fromTo(
          '.hero-desc',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.3',
        );

      // Lane cards stagger
      tl.fromTo(
        '.lane-card',
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.2)',
        },
        '-=0.2',
      );

      // Lane icons pulse on arrival
      tl.fromTo(
        '.lane-icon',
        { scale: 0.6, rotation: -15 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.5)',
        },
        '-=0.8',
      );
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="text-center mb-12">
        <p className="hero-subtitle font-body text-xs tracking-[0.4em] text-hextech uppercase mb-3 opacity-0">
          Champion Select Advisor
        </p>
        <h1 className="hero-title font-display text-5xl md:text-6xl font-bold tracking-display text-gold-bright text-glow-gold uppercase opacity-0">
          Rift Pick
        </h1>
        <div className="hero-filigree filigree my-6 w-72 mx-auto opacity-0" />
        <p className="hero-desc text-gold-bright/60 text-sm md:text-base max-w-md mx-auto opacity-0">
          まずは担当するレーンを選択してください。
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 w-full max-w-4xl">
        {LANES.map((lane) => (
          <Link
            key={lane.id}
            href={`/pick/${lane.id}`}
            className="lane-card group panel flex flex-col items-center gap-3 px-4 py-7 text-gold transition-all duration-300 hover:border-gold hover:shadow-gold opacity-0"
          >
            <span className="lane-icon text-gold group-hover:text-hextech transition-colors duration-300">
              <LaneIcon lane={lane.id} className="w-12 h-12" />
            </span>
            <span className="font-display text-base tracking-display text-gold-bright uppercase">
              {lane.label}
            </span>
            <span className="font-body text-[10px] tracking-[0.3em] text-gold/50">
              {lane.short}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
