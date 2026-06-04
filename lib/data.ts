import 'server-only';
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
import { readCsvFromS3 } from './s3';

function parseCsv<T>(text: string): T[] {
  const parsed = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transform: (v) => v.trim(),
  });
  return parsed.data;
}

async function readCsv<T>(file: string): Promise<T[]> {
  const text = await readCsvFromS3(file);
  return parseCsv<T>(text);
}

// --- Raw row access ---------------------------------------------------------

export async function getCounterRows(lane: LaneId): Promise<CounterRow[]> {
  const rows = await readCsv<CounterRow>('counters.csv');
  return rows.filter((r) => r.lane === lane);
}

export async function getFirstPickRows(lane: LaneId): Promise<FirstPickRow[]> {
  const rows = await readCsv<FirstPickRow>('first_pick.csv');
  return rows.filter((r) => r.lane === lane);
}

export async function getBalanceRows(lane: LaneId): Promise<BalanceRow[]> {
  const rows = await readCsv<BalanceRow>('balance_pick.csv');
  return rows.filter((r) => r.lane === lane);
}

export async function getLaneChampions(lane: LaneId): Promise<string[]> {
  const rows = await readCsv<LaneChampionRow>('champion_lanes.csv');
  return rows.filter((r) => r.lane === lane).map((r) => r.champion);
}

// --- All-rows access (for API) ----------------------------------------------

export async function getAllCounterRows(): Promise<CounterRow[]> {
  return readCsv<CounterRow>('counters.csv');
}

export async function getAllFirstPickRows(): Promise<FirstPickRow[]> {
  return readCsv<FirstPickRow>('first_pick.csv');
}

export async function getAllBalanceRows(): Promise<BalanceRow[]> {
  return readCsv<BalanceRow>('balance_pick.csv');
}

export async function getAllLaneChampionRows(): Promise<LaneChampionRow[]> {
  return readCsv<LaneChampionRow>('champion_lanes.csv');
}

// --- Enriched (champion + reason) data for the UI ---------------------------

/** Distinct enemy champions that have counter data for this lane. */
export async function getEnemyChampions(lane: LaneId): Promise<Recommendation[]> {
  const map = await getChampionMap();
  const seen = new Set<string>();
  const rows = await getCounterRows(lane);
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
  const rows = await getCounterRows(lane);
  return rows
    .filter((r) => r.enemy === enemy)
    .map((r) => ({ champion: resolveChampion(map, r.pick), reason: r.reason }));
}

export async function getFirstPicks(lane: LaneId): Promise<Recommendation[]> {
  const map = await getChampionMap();
  const rows = await getFirstPickRows(lane);
  return rows.map((r) => ({
    champion: resolveChampion(map, r.pick),
    reason: r.reason,
  }));
}

export async function getBalancePicks(
  lane: LaneId
): Promise<Record<BalanceCategory, Recommendation[]>> {
  const map = await getChampionMap();
  const rows = await getBalanceRows(lane);
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
  const champs = await getLaneChampions(lane);
  return champs.map((key) => ({
    champion: resolveChampion(map, key),
  }));
}
