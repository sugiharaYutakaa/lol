'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Animate child elements that match `selector` with a staggered entrance.
 * Returns a ref to attach to the container element.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  options?: {
    y?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
    ease?: string;
  },
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll(selector);
    if (els.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        {
          opacity: 0,
          y: options?.y ?? 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.6,
          stagger: options?.stagger ?? 0.08,
          delay: options?.delay ?? 0,
          ease: options?.ease ?? 'power3.out',
        },
      );
    }, ref.current);

    return () => ctx.revert();
  }, [selector, options?.y, options?.duration, options?.stagger, options?.delay, options?.ease]);

  return ref;
}

/**
 * Animate a single element on mount.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  y?: number;
  x?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  ease?: string;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    const from: gsap.TweenVars = { opacity: 0 };
    if (options?.y !== undefined) from.y = options.y;
    else from.y = 20;
    if (options?.x !== undefined) from.x = options.x;
    if (options?.scale !== undefined) from.scale = options.scale;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current!,
        from,
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: options?.duration ?? 0.7,
          delay: options?.delay ?? 0,
          ease: options?.ease ?? 'power3.out',
        },
      );
    }, ref.current!);

    return () => ctx.revert();
  }, [options?.y, options?.x, options?.scale, options?.duration, options?.delay, options?.ease]);

  return ref;
}
