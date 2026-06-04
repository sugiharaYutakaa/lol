'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const PARTICLE_COUNT = 12;

export default function HextechParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const particles = containerRef.current!.querySelectorAll('.particle');
      particles.forEach((p) => {
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const size = 2 + Math.random() * 4;
        const el = p as HTMLElement;

        el.style.left = `${startX}%`;
        el.style.top = `${startY}%`;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;

        // Floating animation
        gsap.to(el, {
          y: -40 - Math.random() * 60,
          x: (Math.random() - 0.5) * 80,
          opacity: 0,
          duration: 4 + Math.random() * 4,
          delay: Math.random() * 5,
          repeat: -1,
          ease: 'power1.out',
          onRepeat: () => {
            gsap.set(el, {
              left: `${Math.random() * 100}%`,
              top: `${60 + Math.random() * 40}%`,
              opacity: 0.3 + Math.random() * 0.4,
              y: 0,
              x: 0,
            });
          },
        });

        // Initial fade in
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 0.3 + Math.random() * 0.4,
            duration: 1,
            delay: Math.random() * 3,
          },
        );
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden
    >
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full"
          style={{
            background:
              i % 3 === 0
                ? 'rgba(10, 200, 185, 0.6)'
                : 'rgba(200, 170, 110, 0.5)',
            opacity: 0,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}
