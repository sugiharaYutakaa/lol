import type { Metadata } from 'next';
import './globals.css';
import HextechParticles from '@/components/HextechParticles';

export const metadata: Metadata = {
  title: 'Rift Pick — LoL ピックアドバイザー',
  description:
    'レーンとピック方式を選んで、ランダム / カウンター / ファースト / バランスの最適ピックを提案します。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Saira:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg-rift" aria-hidden />
        <div className="bg-grid" aria-hidden />
        <HextechParticles />
        {children}
      </body>
    </html>
  );
}
