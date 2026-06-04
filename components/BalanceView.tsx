'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BalanceCategory, LaneId, Recommendation } from '@/lib/types';
import { BALANCE_CATEGORIES } from '@/lib/lanes';
import { deleteRow } from '@/lib/csv-api';
import ChampionTile from './ChampionTile';
import DataFormModal from './DataFormModal';

interface Props {
  board: Record<BalanceCategory, Recommendation[]>;
  lane: LaneId;
  editable: boolean;
}

export default function BalanceView({ board, lane, editable }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit';
    initial?: Record<string, string>;
    match?: Record<string, string>;
  } | null>(null);

  const handleDelete = async (category: BalanceCategory, p: Recommendation) => {
    if (!confirm(`${p.champion.name} を削除しますか？`)) return;
    try {
      await deleteRow('balance_pick.csv', {
        lane,
        category,
        pick: p.champion.key,
        reason: p.reason ?? '',
      });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  const hasAny = BALANCE_CATEGORIES.some((c) => board[c.id]?.length);
  if (!hasAny && !editable) {
    return (
      <p className="text-gold/50 text-sm">
        このレーンのバランスデータがまだありません。
      </p>
    );
  }

  return (
    <div>
      <p className="text-gold-bright/70 text-sm mb-8">
        チーム構成で不足しがちな役割を、カテゴリ別に確認できます。
      </p>
      <div className="space-y-10">
        {BALANCE_CATEGORIES.map((cat) => {
          const picks = board[cat.id] ?? [];
          if (picks.length === 0 && !editable) return null;
          return (
            <section key={cat.id}>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="font-display text-lg tracking-display text-hextech uppercase">
                  {cat.label}
                </h2>
                <span className="text-xs text-gold-bright/45">{cat.desc}</span>
              </div>
              <div className="filigree opacity-50 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9">
                {picks.map((p, i) => (
                  <div
                    key={p.champion.key}
                    className="flex flex-col items-center relative group/item"
                  >
                    <ChampionTile
                      champion={p.champion}
                      reason={p.reason}
                      size="md"
                      delayMs={i * 50}
                    />
                    {editable && (
                      <div className="absolute top-0 right-0 hidden group-hover/item:flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setModal({
                              mode: 'edit',
                              initial: {
                                category: cat.id,
                                pick: p.champion.key,
                                reason: p.reason ?? '',
                              },
                              match: {
                                lane,
                                category: cat.id,
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
                          onClick={() => handleDelete(cat.id, p)}
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
            </section>
          );
        })}
      </div>

      {editable && (
        <button
          type="button"
          onClick={() => setModal({ mode: 'add' })}
          className="mt-8 w-full py-3 border border-dashed border-gold-dark text-gold/50 text-sm tracking-display uppercase hover:border-gold hover:text-gold-bright transition-colors"
        >
          + バランスピックを追加
        </button>
      )}

      {modal && (
        <DataFormModal
          isOpen
          onClose={() => setModal(null)}
          lane={lane}
          csvFile="balance_pick.csv"
          editMode={modal.mode}
          initialData={modal.initial}
          originalMatch={modal.match}
        />
      )}
    </div>
  );
}
