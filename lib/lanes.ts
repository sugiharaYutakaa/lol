import type { LaneId, PickMode, BalanceCategory } from './types';

export interface LaneMeta {
  id: LaneId;
  label: string; // Japanese display label
  short: string; // short EN tag
}

export const LANES: LaneMeta[] = [
  { id: 'top', label: 'トップ', short: 'TOP' },
  { id: 'jungle', label: 'ジャングル', short: 'JG' },
  { id: 'mid', label: 'ミッド', short: 'MID' },
  { id: 'bot', label: 'ボット', short: 'BOT' },
  { id: 'support', label: 'サポート', short: 'SUP' },
];

export const LANE_IDS: LaneId[] = LANES.map((l) => l.id);

export function getLane(id: string): LaneMeta | undefined {
  return LANES.find((l) => l.id === id);
}

export interface ModeMeta {
  id: PickMode;
  label: string;
  tagline: string;
}

export const MODES: ModeMeta[] = [
  {
    id: 'random',
    label: 'ランダムピック',
    tagline: '運命に身を任せる。完全ランダム抽選。',
  },
  {
    id: 'counter',
    label: 'カウンターピック',
    tagline: '相手を指定し、対面で有利を取るピックを提案。',
  },
  {
    id: 'first',
    label: 'ファーストピック',
    tagline: '相手が見えない先出しでも腐らない安定枠。',
  },
  {
    id: 'balance',
    label: 'バランスピック',
    tagline: 'チーム構成で不足しがちな役割をカテゴリ別に提案。',
  },
];

export const MODE_IDS: PickMode[] = MODES.map((m) => m.id);

export function getMode(id: string): ModeMeta | undefined {
  return MODES.find((m) => m.id === id);
}

export interface CategoryMeta {
  id: BalanceCategory;
  label: string;
  desc: string;
}

export const BALANCE_CATEGORIES: CategoryMeta[] = [
  { id: 'engage', label: 'エンゲージ', desc: '集団戦の開始役。CCで仕掛ける。' },
  { id: 'aoe', label: 'AoE', desc: '範囲ダメージで複数体に対応。' },
  { id: 'assassin', label: 'アサシン', desc: '後衛を狩るバースト火力。' },
  { id: 'fighter', label: 'ファイター', desc: '前線で殴り合う持続火力。' },
  { id: 'tank', label: 'タンク', desc: '盾役。被弾を引き受ける。' },
];
