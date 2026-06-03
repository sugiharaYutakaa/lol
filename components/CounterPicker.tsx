'use client';

import { useState } from 'react';
import type { Champion, Recommendation } from '@/lib/types';
import ChampionTile from './ChampionTile';

export interface CounterEntry {
  enemy: Champion;
  picks: Recommendation[];
}

interface Props {
  data: CounterEntry[];
}

export default function CounterPicker({ data }: Props) {
  const [enemyKey, setEnemyKey] = useState<string | null>(null);
  const selected = data.find((d) => d.enemy.key === enemyKey) ?? null;

  if (!selected) {
    return (
      <div>
        <p className="text-gold-bright/70 text-sm mb-6">
          相手のチャンピオンを選択してください。
        </p>
        {data.length === 0 ? (
          <p className="text-gold/50 text-sm">
            このレーンのカウンターデータがまだありません。
          </p>
        ) : (
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
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setEnemyKey(null)}
        className="mb-6 text-xs tracking-display uppercase text-gold/70 hover:text-gold-bright transition-colors"
      >
        ‹ 相手を選び直す
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
          <div key={p.champion.key} className="panel p-5 flex flex-col items-center">
            <ChampionTile
              champion={p.champion}
              reason={p.reason}
              size="md"
              selected
              delayMs={i * 60}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
