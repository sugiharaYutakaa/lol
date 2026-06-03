'use client';

import { useCallback, useRef, useState } from 'react';
import type { Recommendation } from '@/lib/types';
import ChampionTile from './ChampionTile';

interface Props {
  pool: Recommendation[];
}

export default function RandomPicker({ pool }: Props) {
  const [current, setCurrent] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const roll = useCallback(() => {
    if (rolling || pool.length === 0) return;
    setRolling(true);
    const start = Date.now();
    const duration = 1300;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setCurrent(Math.floor(Math.random() * pool.length));
      if (elapsed >= duration) {
        if (timer.current) clearInterval(timer.current);
        setCurrent(Math.floor(Math.random() * pool.length));
        setRolling(false);
      }
    }, 80);
  }, [pool, rolling]);

  const picked = current !== null ? pool[current] : null;

  return (
    <div className="flex flex-col items-center">
      <div className="panel w-full max-w-md py-10 flex flex-col items-center min-h-[18rem] justify-center">
        {picked ? (
          <div className={rolling ? 'opacity-70' : ''}>
            <ChampionTile
              champion={picked.champion}
              size="lg"
              selected={!rolling}
              key={picked.champion.key + (rolling ? 'r' : 'f')}
            />
          </div>
        ) : (
          <div className="text-center px-8">
            <div className="w-36 h-36 hex bg-slate/60 border border-gold-dark mx-auto flex items-center justify-center">
              <span className="text-gold/40 font-display text-4xl">?</span>
            </div>
            <p className="mt-5 text-gold-bright/50 text-sm">
              ボタンを押して運命のピックを抽選
            </p>
          </div>
        )}
        {picked && !rolling && (
          <p className="mt-4 text-xs tracking-display text-hextech uppercase animate-fade-up">
            Locked In
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={roll}
        disabled={rolling}
        className="mt-7 px-10 py-3 font-display tracking-display uppercase text-sm border border-gold-dark bg-gradient-to-b from-gold-deep/60 to-abyss text-gold-bright transition-all duration-300 hover:border-gold hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {rolling ? '抽選中…' : picked ? 'もう一度抽選' : '抽選する'}
      </button>

      <p className="mt-4 text-xs text-gold/40">候補 {pool.length} 体からランダム抽選</p>
    </div>
  );
}
