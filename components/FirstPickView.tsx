import type { Recommendation } from '@/lib/types';
import ChampionTile from './ChampionTile';

export default function FirstPickView({
  picks,
}: {
  picks: Recommendation[];
}) {
  if (picks.length === 0) {
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
            className="panel p-5 flex flex-col items-center"
          >
            <ChampionTile
              champion={p.champion}
              reason={p.reason}
              size="md"
              selected
              delayMs={i * 70}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
