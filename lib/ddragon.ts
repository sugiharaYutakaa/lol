import type { Champion } from './types';

const DDRAGON = 'https://ddragon.leagueoflegends.com';
const LOCALE = 'ja_JP';
// Fallback version used only if the version endpoint is unreachable.
const FALLBACK_VERSION = '14.10.1';

/** Cache the latest Data Dragon version for a day. */
export async function getVersion(): Promise<string> {
  try {
    const res = await fetch(`${DDRAGON}/api/versions.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`versions ${res.status}`);
    const versions: string[] = await res.json();
    return versions[0] ?? FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

export function championIconUrl(version: string, key: string): string {
  return `${DDRAGON}/cdn/${version}/img/champion/${key}.png`;
}

interface DdragonChampionData {
  data: Record<string, { id: string; name: string }>;
}

/**
 * Returns a map keyed by Data Dragon champion key (e.g. "Ahri") containing
 * the localized name and icon URL. If the network is unavailable, returns an
 * empty map; callers fall back to using the key as the display name.
 */
export async function getChampionMap(): Promise<Map<string, Champion>> {
  const version = await getVersion();
  const map = new Map<string, Champion>();
  try {
    const res = await fetch(
      `${DDRAGON}/cdn/${version}/data/${LOCALE}/champion.json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error(`champion.json ${res.status}`);
    const json: DdragonChampionData = await res.json();
    for (const c of Object.values(json.data)) {
      map.set(c.id, {
        key: c.id,
        name: c.name,
        imageUrl: championIconUrl(version, c.id),
      });
    }
  } catch {
    // leave map empty; resolveChampion will build a fallback entry
  }
  // store version so resolveChampion can build fallback URLs
  versionCache = version;
  return map;
}

let versionCache = FALLBACK_VERSION;

/**
 * Build a Champion object for a given key, using the loaded map when possible
 * and a graceful fallback (key as name) otherwise.
 */
export function resolveChampion(
  map: Map<string, Champion>,
  key: string
): Champion {
  const hit = map.get(key);
  if (hit) return hit;
  return {
    key,
    name: key,
    imageUrl: championIconUrl(versionCache, key),
  };
}
