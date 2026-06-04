'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  trail: { label: string; href?: string }[];
  title: string;
  subtitle?: string;
}

export default function PageHeader({ trail, title, subtitle }: Props) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.header-breadcrumb',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5 },
      )
        .fromTo(
          '.header-title',
          { opacity: 0, x: -30, skewX: -3 },
          { opacity: 1, x: 0, skewX: 0, duration: 0.7 },
          '-=0.3',
        )
        .fromTo(
          '.header-subtitle',
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.3',
        )
        .fromTo(
          '.header-filigree',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.2',
        );
    }, headerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={headerRef} className="mb-8">
      <nav className="header-breadcrumb flex items-center gap-2 text-xs tracking-display text-gold/70 mb-3 opacity-0">
        {trail.map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            {t.href ? (
              <Link
                href={t.href}
                className="hover:text-gold-bright transition-colors uppercase"
              >
                {t.label}
              </Link>
            ) : (
              <span className="uppercase text-gold-bright/80">{t.label}</span>
            )}
            {i < trail.length - 1 && <span className="text-steel">/</span>}
          </span>
        ))}
      </nav>
      <h1 className="header-title font-display text-3xl md:text-4xl font-bold tracking-display text-gold-bright text-glow-gold uppercase opacity-0">
        {title}
      </h1>
      {subtitle && (
        <p className="header-subtitle mt-2 text-gold-bright/60 text-sm md:text-base opacity-0">
          {subtitle}
        </p>
      )}
      <div className="header-filigree filigree mt-5 opacity-0" />
    </header>
  );
}
