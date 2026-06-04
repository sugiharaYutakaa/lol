'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LaneId, Recommendation } from '@/lib/types';
import { deleteRow } from '@/lib/csv-api';
import ChampionTile from './ChampionTile';
import DataFormModal from './DataFormModal';

interface Props {
  picks: Recommendation[];
  lane: LaneId;
  editable: boolean;
}

export default function FirstPickView({ picks, lane, editable }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit';
    initial?: Record<string, string>;
    match?: Record<string, string>;
  } | null>(null);

  const handleDelete = async (p: Recommendation) => {
    if (!confirm(`${p.champion.name} を削除しますか？`)) return;
    try {
      await deleteRow('first_pick.csv', {
        lane,
        pick: p.champion.key,
        reason: p.reason ?? '',
      });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  if (picks.length === 0 && !editable) {
    return (
      <p className="text-gold/50 text-sm">
        このレーンの先出しデータがまだありません。
      </p>
    );
  }

  return (
    <div>
      <p className="text-gold-bright/70 text-sm mb-8">
        相手が見えない先出しでも腐りにくい安定ピックです。
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {picks.map((p, i) => (
          <div
            key={p.champion.key}
            className="panel p-5 flex flex-col items-center relative group/item"
          >
            <ChampionTile
              champion={p.champion}
              reason={p.reason}
              size="md"
              selected
              delayMs={i * 70}
            />
            {editable && (
              <div className="absolute top-2 right-2 hidden group-hover/item:flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      mode: 'edit',
                      initial: { pick: p.champion.key, reason: p.reason ?? '' },
                      match: { lane, pick: p.champion.key, reason: p.reason ?? '' },
                    })
                  }
                  className="w-7 h-7 flex items-center justify-center text-xs bg-abyss/80 border border-gold-dark text-gold/70 hover:text-gold-bright hover:border-gold transition-colors"
                  title="編集"
                >
                  E
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
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
          onClick={() => setModal({ mode: 'add' })}
          className="mt-8 w-full py-3 border border-dashed border-gold-dark text-gold/50 text-sm tracking-display uppercase hover:border-gold hover:text-gold-bright transition-colors"
        >
          + ファーストピックを追加
        </button>
      )}

      {modal && (
        <DataFormModal
          isOpen
          onClose={() => setModal(null)}
          lane={lane}
          csvFile="first_pick.csv"
          editMode={modal.mode}
          initialData={modal.initial}
          originalMatch={modal.match}
        />
      )}
    </div>
  );
}
