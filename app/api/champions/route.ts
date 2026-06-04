import { NextResponse } from 'next/server';
import { getChampionMap } from '@/lib/ddragon';

export async function GET() {
  const map = await getChampionMap();
  const champions = Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ja'),
  );
  return NextResponse.json(champions);
}
