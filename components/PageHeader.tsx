import Link from 'next/link';

interface Props {
  trail: { label: string; href?: string }[];
  title: string;
  subtitle?: string;
}

export default function PageHeader({ trail, title, subtitle }: Props) {
  return (
    <header className="mb-8">
      <nav className="flex items-center gap-2 text-xs tracking-display text-gold/70 mb-3">
        {trail.map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            {t.href ? (
              <Link
                href={t.href}
                className="hover:text-gold-bright transition-colors uppercase"
              >
                {t.label}
              </Link>
            ) : (
              <span className="uppercase text-gold-bright/80">{t.label}</span>
            )}
            {i < trail.length - 1 && <span className="text-steel">/</span>}
          </span>
        ))}
      </nav>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-display text-gold-bright text-glow-gold uppercase">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-gold-bright/60 text-sm md:text-base">{subtitle}</p>
      )}
      <div className="filigree mt-5" />
    </header>
  );
}
