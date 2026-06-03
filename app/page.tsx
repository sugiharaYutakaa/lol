import Link from 'next/link';
import { LANES } from '@/lib/lanes';
import LaneIcon from '@/components/LaneIcon';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-12 animate-fade-up">
        <p className="font-body text-xs tracking-[0.4em] text-hextech uppercase mb-3">
          Champion Select Advisor
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-display text-gold-bright text-glow-gold uppercase">
          Rift Pick
        </h1>
        <div className="filigree my-6 w-72 mx-auto" />
        <p className="text-gold-bright/60 text-sm md:text-base max-w-md mx-auto">
          まずは担当するレーンを選択してください。
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 w-full max-w-4xl">
        {LANES.map((lane, i) => (
          <Link
            key={lane.id}
            href={`/pick/${lane.id}`}
            className="group panel flex flex-col items-center gap-3 px-4 py-7 text-gold transition-all duration-300 hover:border-gold hover:shadow-gold animate-fade-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="text-gold group-hover:text-hextech transition-colors duration-300">
              <LaneIcon lane={lane.id} className="w-12 h-12" />
            </span>
            <span className="font-display text-base tracking-display text-gold-bright uppercase">
              {lane.label}
            </span>
            <span className="font-body text-[10px] tracking-[0.3em] text-gold/50">
              {lane.short}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
