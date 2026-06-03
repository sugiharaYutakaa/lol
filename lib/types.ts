export type LaneId = 'top' | 'jungle' | 'mid' | 'bot' | 'support';

export type PickMode = 'random' | 'counter' | 'first' | 'balance';

export type BalanceCategory =
  | 'engage'
  | 'aoe'
  | 'assassin'
  | 'fighter'
  | 'tank';

/** A champion enriched with Data Dragon display data. */
export interface Champion {
  key: string; // Data Dragon key, e.g. "Ahri"
  name: string; // localized display name
  imageUrl: string; // square icon url
}

export interface CounterRow {
  lane: LaneId;
  enemy: string;
  pick: string;
  reason: string;
}

export interface FirstPickRow {
  lane: LaneId;
  pick: string;
  reason: string;
}

export interface BalanceRow {
  lane: LaneId;
  category: BalanceCategory;
  pick: string;
  reason: string;
}

export interface LaneChampionRow {
  lane: LaneId;
  champion: string;
}

/** A recommendation = champion + reason, ready for the UI. */
export interface Recommendation {
  champion: Champion;
  reason?: string;
}
