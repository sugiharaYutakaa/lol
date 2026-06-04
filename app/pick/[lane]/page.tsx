'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import gsap from 'gsap';
import { getLane, MODES } from '@/lib/lanes';
import LaneIcon from '@/components/LaneIcon';
import PageHeader from '@/components/PageHeader';
import type { LaneId } from '@/lib/types';

export default function ModeSelectPage() {
  const params = useParams();
  const lane = getLane(params.lane as string);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !lane) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Lane badge entrance
      tl.fromTo(
        '.lane-badge',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.3 },
      );

      // Mode cards staggered entrance with slide and scale
      tl.fromTo(
        '.mode-card',
        { opacity: 0, y: 50, scale: 0.95, rotateX: 5 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'back.out(1.2)',
        },
        '-=0.2',
      );

      // Filigree inside cards
      tl.fromTo(
        '.mode-card .filigree',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
        '-=0.6',
      );
    }, containerRef.current);

    return () => ctx.revert();
  }, [lane]);

  if (!lane) notFound();

  return (
    <main ref={containerRef} className="min-h-screen px-4 py-12 max-w-5xl mx-auto">
      <PageHeader
        trail={[
          { label: 'Lane', href: '/' },
          { label: lane.label },
        ]}
        title="ピック方式を選択"
        subtitle={`${lane.label} で使用する戦略を選んでください。`}
      />

      <div className="lane-badge flex items-center gap-3 mb-8 text-hextech opacity-0">
        <LaneIcon lane={lane.id as LaneId} className="w-9 h-9" />
        <span className="font-display tracking-display text-gold-bright/80 uppercase">
          {lane.label} / {lane.short}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {MODES.map((mode) => (
          <Link
            key={mode.id}
            href={`/pick/${lane.id}/${mode.id}`}
            className="mode-card group panel p-6 transition-all duration-300 hover:border-gold hover:shadow-gold opacity-0"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-display text-gold-bright uppercase group-hover:text-glow-gold">
                {mode.label}
              </h2>
              <span className="text-gold/40 group-hover:text-hextech transition-colors text-2xl leading-none">
                ›
              </span>
            </div>
            <div className="filigree my-4 opacity-60" />
            <p className="text-sm text-gold-bright/60 leading-relaxed">
              {mode.tagline}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
