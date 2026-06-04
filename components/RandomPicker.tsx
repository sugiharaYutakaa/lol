'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import type { LaneId, Recommendation } from '@/lib/types';
import { deleteRow } from '@/lib/csv-api';
import ChampionTile from './ChampionTile';
import DataFormModal from './DataFormModal';

interface Props {
  pool: Recommendation[];
  lane: LaneId;
  editable: boolean;
}

export default function RandomPicker({ pool, lane, editable }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [modal, setModal] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lockedRef = useRef<HTMLParagraphElement>(null);

  // Entrance animation
  useEffect(() => {
    if (!panelRef.current || !buttonRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' },
      );
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.5, ease: 'power3.out' },
      );
    });

    return () => ctx.revert();
  }, []);

  const roll = useCallback(() => {
    if (rolling || pool.length === 0) return;
    setRolling(true);

    // Shake the panel on roll start
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { boxShadow: '0 0 0px rgba(10, 200, 185, 0)' },
        {
          boxShadow: '0 0 25px rgba(10, 200, 185, 0.4)',
          duration: 0.3,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        },
      );
    }

    const start = Date.now();
    const duration = 1300;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setCurrent(Math.floor(Math.random() * pool.length));
      if (elapsed >= duration) {
        if (timer.current) clearInterval(timer.current);
        const finalPick = Math.floor(Math.random() * pool.length);
        setCurrent(finalPick);
        setRolling(false);

        // Stop panel glow and do a "locked in" burst
        if (panelRef.current) {
          gsap.killTweensOf(panelRef.current);
          gsap.to(panelRef.current, {
            boxShadow: '0 0 30px rgba(200, 170, 110, 0.5)',
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(panelRef.current, {
            boxShadow: '0 0 0px rgba(200, 170, 110, 0)',
            duration: 1,
            delay: 0.3,
            ease: 'power2.out',
          });
        }

        // Scale bounce on the result
        if (resultRef.current) {
          gsap.fromTo(
            resultRef.current,
            { scale: 1.15 },
            { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' },
          );
        }

        // "Locked In" text entrance
        setTimeout(() => {
          if (lockedRef.current) {
            gsap.fromTo(
              lockedRef.current,
              { opacity: 0, scale: 0.7, y: 5 },
              { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(2)' },
            );
          }
        }, 100);
      }
    }, 80);
  }, [pool, rolling]);

  const handleDelete = async (p: Recommendation) => {
    if (!confirm(`${p.champion.name} をプールから削除しますか？`)) return;
    try {
      await deleteRow('champion_lanes.csv', {
        lane,
        champion: p.champion.key,
      });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  const picked = current !== null ? pool[current] : null;

  return (
    <div className="flex flex-col items-center">
      <div
        ref={panelRef}
        className="panel w-full max-w-md py-10 flex flex-col items-center min-h-[18rem] justify-center"
        style={{ opacity: 0 }}
      >
        {picked ? (
          <div ref={resultRef} className={rolling ? 'opacity-70' : ''}>
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
          <p
            ref={lockedRef}
            className="mt-4 text-xs tracking-display text-hextech uppercase"
            style={{ opacity: 0 }}
          >
            Locked In
          </p>
        )}
      </div>

      <button
        ref={buttonRef}
        type="button"
        onClick={roll}
        disabled={rolling}
        className="mt-7 px-10 py-3 font-display tracking-display uppercase text-sm border border-gold-dark bg-gradient-to-b from-gold-deep/60 to-abyss text-gold-bright transition-all duration-300 hover:border-gold hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ opacity: 0 }}
      >
        {rolling ? '抽選中…' : picked ? 'もう一度抽選' : '抽選する'}
      </button>

      <p className="mt-4 text-xs text-gold/40">候補 {pool.length} 体からランダム抽選</p>

      {editable && (
        <div className="mt-6 w-full max-w-md space-y-3">
          <button
            type="button"
            onClick={() => setShowPool(!showPool)}
            className="text-xs tracking-display uppercase text-gold/50 hover:text-gold-bright transition-colors"
          >
            {showPool ? '▾ プール一覧を閉じる' : '▸ プール一覧を表示'}
          </button>

          {showPool && (
            <div className="panel p-4">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {pool.map((p) => (
                  <div key={p.champion.key} className="relative group/item flex flex-col items-center">
                    <ChampionTile champion={p.champion} size="sm" />
                    <div className="absolute -top-1 -right-1 hidden group-hover/item:flex">
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="w-5 h-5 flex items-center justify-center text-[10px] bg-abyss border border-gold-dark text-blood/70 hover:text-blood hover:border-blood transition-colors rounded-full"
                        title="削除"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setModal(true)}
                className="mt-4 w-full py-2 border border-dashed border-gold-dark text-gold/50 text-xs tracking-display uppercase hover:border-gold hover:text-gold-bright transition-colors"
              >
                + チャンピオンを追加
              </button>
            </div>
          )}

          {!showPool && (
            <button
              type="button"
              onClick={() => setModal(true)}
              className="w-full py-3 border border-dashed border-gold-dark text-gold/50 text-sm tracking-display uppercase hover:border-gold hover:text-gold-bright transition-colors"
            >
              + チャンピオンを追加
            </button>
          )}
        </div>
      )}

      {modal && (
        <DataFormModal
          isOpen
          onClose={() => setModal(false)}
          lane={lane}
          csvFile="champion_lanes.csv"
          editMode="add"
        />
      )}
    </div>
  );
}
