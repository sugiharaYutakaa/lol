import type { BalanceCategory, Recommendation } from '@/lib/types';
import { BALANCE_CATEGORIES } from '@/lib/lanes';
import ChampionTile from './ChampionTile';

export default function BalanceView({
  board,
}: {
  board: Record<BalanceCategory, Recommendation[]>;
}) {
  const hasAny = BALANCE_CATEGORIES.some((c) => board[c.id]?.length);
  if (!hasAny) {
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
          if (picks.length === 0) return null;
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
                    className="flex flex-col items-center"
                  >
                    <ChampionTile
                      champion={p.champion}
                      reason={p.reason}
                      size="md"
                      delayMs={i * 50}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
