import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLane, MODES } from '@/lib/lanes';
import LaneIcon from '@/components/LaneIcon';
import PageHeader from '@/components/PageHeader';
import type { LaneId } from '@/lib/types';

export default function ModeSelectPage({
  params,
}: {
  params: { lane: string };
}) {
  const lane = getLane(params.lane);
  if (!lane) notFound();

  return (
    <main className="min-h-screen px-4 py-12 max-w-5xl mx-auto">
      <PageHeader
        trail={[
          { label: 'Lane', href: '/' },
          { label: lane.label },
        ]}
        title="ピック方式を選択"
        subtitle={`${lane.label} で使用する戦略を選んでください。`}
      />

      <div className="flex items-center gap-3 mb-8 text-hextech">
        <LaneIcon lane={lane.id as LaneId} className="w-9 h-9" />
        <span className="font-display tracking-display text-gold-bright/80 uppercase">
          {lane.label} / {lane.short}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {MODES.map((mode, i) => (
          <Link
            key={mode.id}
            href={`/pick/${lane.id}/${mode.id}`}
            className="group panel p-6 transition-all duration-300 hover:border-gold hover:shadow-gold animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-display text-gold-bright uppercase group-hover:text-glow-gold">
                {mode.label}
              </h2>
              <span className="text-gold/40 group-hover:text-hextech transition-colors text-2xl leading-none">
                ›
              </span>
            </div>
            <div className="filigree my-4 opacity-60" />
            <p className="text-sm text-gold-bright/60 leading-relaxed">
              {mode.tagline}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
