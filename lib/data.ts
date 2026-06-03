import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import type {
  BalanceCategory,
  BalanceRow,
  CounterRow,
  FirstPickRow,
  LaneChampionRow,
  LaneId,
  Recommendation,
} from './types';
import { getChampionMap, resolveChampion } from './ddragon';

const DATA_DIR = path.join(process.cwd(), 'data');

function readCsv<T>(file: string): T[] {
  const full = path.join(DATA_DIR, file);
  const text = fs.readFileSync(full, 'utf8');
  const parsed = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transform: (v) => v.trim(),
  });
  return parsed.data;
}

// --- Raw row access ---------------------------------------------------------

export function getCounterRows(lane: LaneId): CounterRow[] {
  return readCsv<CounterRow>('counters.csv').filter((r) => r.lane === lane);
}

export function getFirstPickRows(lane: LaneId): FirstPickRow[] {
  return readCsv<FirstPickRow>('first_pick.csv').filter((r) => r.lane === lane);
}

export function getBalanceRows(lane: LaneId): BalanceRow[] {
  return readCsv<BalanceRow>('balance_pick.csv').filter((r) => r.lane === lane);
}

export function getLaneChampions(lane: LaneId): string[] {
  return readCsv<LaneChampionRow>('champion_lanes.csv')
    .filter((r) => r.lane === lane)
    .map((r) => r.champion);
}

// --- Enriched (champion + reason) data for the UI ---------------------------

/** Distinct enemy champions that have counter data for this lane. */
export async function getEnemyChampions(lane: LaneId): Promise<Recommendation[]> {
  const map = await getChampionMap();
  const seen = new Set<string>();
  const rows = getCounterRows(lane);
  const out: Recommendation[] = [];
  for (const r of rows) {
    if (seen.has(r.enemy)) continue;
    seen.add(r.enemy);
    out.push({ champion: resolveChampion(map, r.enemy) });
  }
  return out;
}

/** Counter picks against a specific enemy in a lane. */
export async function getCounterPicks(
  lane: LaneId,
  enemy: string
): Promise<Recommendation[]> {
  const map = await getChampionMap();
  return getCounterRows(lane)
    .filter((r) => r.enemy === enemy)
    .map((r) => ({ champion: resolveChampion(map, r.pick), reason: r.reason }));
}

export async function getFirstPicks(lane: LaneId): Promise<Recommendation[]> {
  const map = await getChampionMap();
  return getFirstPickRows(lane).map((r) => ({
    champion: resolveChampion(map, r.pick),
    reason: r.reason,
  }));
}

export async function getBalancePicks(
  lane: LaneId
): Promise<Record<BalanceCategory, Recommendation[]>> {
  const map = await getChampionMap();
  const rows = getBalanceRows(lane);
  const result = {
    engage: [],
    aoe: [],
    assassin: [],
    fighter: [],
    tank: [],
  } as Record<BalanceCategory, Recommendation[]>;
  for (const r of rows) {
    if (!result[r.category]) continue;
    result[r.category].push({
      champion: resolveChampion(map, r.pick),
      reason: r.reason,
    });
  }
  return result;
}

/** Full champion pool for a lane, enriched, for the random picker. */
export async function getRandomPool(lane: LaneId): Promise<Recommendation[]> {
  const map = await getChampionMap();
  return getLaneChampions(lane).map((key) => ({
    champion: resolveChampion(map, key),
  }));
}
