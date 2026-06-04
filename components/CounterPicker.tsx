'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import type { Champion, LaneId, Recommendation } from '@/lib/types';
import { deleteRow } from '@/lib/csv-api';
import ChampionTile from './ChampionTile';
import DataFormModal from './DataFormModal';

export interface CounterEntry {
  enemy: Champion;
  picks: Recommendation[];
}

interface Props {
  data: CounterEntry[];
  lane: LaneId;
  editable: boolean;
}

export default function CounterPicker({ data, lane, editable }: Props) {
  const router = useRouter();
  const [enemyKey, setEnemyKey] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit';
    initial?: Record<string, string>;
    match?: Record<string, string>;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selected = data.find((d) => d.enemy.key === enemyKey) ?? null;

  // Animate counter picks panel when enemy is selected
  useEffect(() => {
    if (!selected || !detailRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        detailRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' },
      );

      gsap.fromTo(
        '.counter-card',
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          delay: 0.15,
          ease: 'back.out(1.2)',
        },
      );
    }, detailRef.current);

    return () => ctx.revert();
  }, [selected]);

  const handleDelete = async (enemy: string, p: Recommendation) => {
    if (!confirm(`${p.champion.name} を削除しますか？`)) return;
    try {
      await deleteRow('counters.csv', {
        lane,
        enemy,
        pick: p.champion.key,
        reason: p.reason ?? '',
      });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  if (!selected) {
    return (
      <div ref={containerRef}>
        <p className="text-gold-bright/70 text-sm mb-6">
          相手のチャンピオンを選択してください。
        </p>
        {data.length === 0 && !editable ? (
          <p className="text-gold/50 text-sm">
            このレーンのカウンターデータがまだありません。
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-6 gap-x-3">
              {data.map((d, i) => (
                <ChampionTile
                  key={d.enemy.key}
                  champion={d.enemy}
                  size="md"
                  onClick={() => setEnemyKey(d.enemy.key)}
                  delayMs={i * 50}
                />
              ))}
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => setModal({ mode: 'add' })}
                className="mt-8 w-full py-3 border border-dashed border-gold-dark text-gold/50 text-sm tracking-display uppercase hover:border-gold hover:text-gold-bright transition-colors"
              >
                + カウンターピックを追加
              </button>
            )}
          </>
        )}

        {modal && (
          <DataFormModal
            isOpen
            onClose={() => setModal(null)}
            lane={lane}
            csvFile="counters.csv"
            editMode={modal.mode}
            initialData={modal.initial}
            originalMatch={modal.match}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={detailRef} style={{ opacity: 0 }}>
      <button
        type="button"
        onClick={() => setEnemyKey(null)}
        className="mb-6 text-xs tracking-display uppercase text-gold/70 hover:text-gold-bright transition-colors"
      >
        &lsaquo; 相手を選び直す
      </button>

      <div className="flex items-center gap-4 mb-8 panel p-4">
        <div className="shrink-0">
          <ChampionTile champion={selected.enemy} size="sm" />
        </div>
        <div>
          <p className="text-xs tracking-display text-blood uppercase">Enemy</p>
          <p className="font-display text-lg text-gold-bright tracking-display">
            {selected.enemy.name}
          </p>
          <p className="text-xs text-gold-bright/50">
            への有利ピック {selected.picks.length} 件
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {selected.picks.map((p, i) => (
          <div
            key={p.champion.key}
            className="counter-card panel p-5 flex flex-col items-center relative group/item"
            style={{ opacity: 0 }}
          >
            <ChampionTile
              champion={p.champion}
              reason={p.reason}
              size="md"
              selected
              delayMs={i * 60}
            />
            {editable && (
              <div className="absolute top-2 right-2 hidden group-hover/item:flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      mode: 'edit',
                      initial: {
                        enemy: selected.enemy.key,
                        pick: p.champion.key,
                        reason: p.reason ?? '',
                      },
                      match: {
                        lane,
                        enemy: selected.enemy.key,
                        pick: p.champion.key,
                        reason: p.reason ?? '',
                      },
                    })
                  }
                  className="w-7 h-7 flex items-center justify-center text-xs bg-abyss/80 border border-gold-dark text-gold/70 hover:text-gold-bright hover:border-gold transition-colors"
                  title="編集"
                >
                  E
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selected.enemy.key, p)}
                  className="w-7 h-7 flex items-center justify-center text-xs bg-abyss/80 border border-gold-dark text-blood/70 hover:text-blood hover:border-blood transition-colors"
                  title="削除"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editable && (
        <button
          type="button"
          onClick={() =>
            setModal({
              mode: 'add',
              initial: { enemy: selected.enemy.key },
            })
          }
          className="mt-8 w-full py-3 border border-dashed border-gold-dark text-gold/50 text-sm tracking-display uppercase hover:border-gold hover:text-gold-bright transition-colors"
        >
          + {selected.enemy.name} へのカウンターを追加
        </button>
      )}

      {modal && (
        <DataFormModal
          isOpen
          onClose={() => setModal(null)}
          lane={lane}
          csvFile="counters.csv"
          editMode={modal.mode}
          initialData={modal.initial}
          originalMatch={modal.match}
        />
      )}
    </div>
  );
}
