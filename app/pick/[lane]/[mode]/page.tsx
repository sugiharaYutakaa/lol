import { notFound } from 'next/navigation';
import { getLane, getMode } from '@/lib/lanes';
import {
  getRandomPool,
  getEnemyChampions,
  getCounterPicks,
  getFirstPicks,
  getBalancePicks,
} from '@/lib/data';
import type { LaneId } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import RandomPicker from '@/components/RandomPicker';
import CounterPicker, { type CounterEntry } from '@/components/CounterPicker';
import FirstPickView from '@/components/FirstPickView';
import BalanceView from '@/components/BalanceView';

// Data Dragon is fetched at request time; revalidate handles freshness.
export const dynamic = 'force-dynamic';

export default async function ResultPage({
  params,
}: {
  params: { lane: string; mode: string };
}) {
  const lane = getLane(params.lane);
  const mode = getMode(params.mode);
  if (!lane || !mode) notFound();
  const laneId = lane.id as LaneId;

  let view: React.ReactNode = null;

  if (mode.id === 'random') {
    const pool = await getRandomPool(laneId);
    view = <RandomPicker pool={pool} />;
  } else if (mode.id === 'counter') {
    const enemies = await getEnemyChampions(laneId);
    const entries: CounterEntry[] = [];
    for (const e of enemies) {
      const picks = await getCounterPicks(laneId, e.champion.key);
      entries.push({ enemy: e.champion, picks });
    }
    view = <CounterPicker data={entries} />;
  } else if (mode.id === 'first') {
    const picks = await getFirstPicks(laneId);
    view = <FirstPickView picks={picks} />;
  } else if (mode.id === 'balance') {
    const board = await getBalancePicks(laneId);
    view = <BalanceView board={board} />;
  }

  return (
    <main className="min-h-screen px-4 py-12 max-w-5xl mx-auto">
      <PageHeader
        trail={[
          { label: 'Lane', href: '/' },
          { label: lane.label, href: `/pick/${lane.id}` },
          { label: mode.label },
        ]}
        title={mode.label}
        subtitle={`${lane.label} / ${mode.tagline}`}
      />
      {view}
    </main>
  );
}
