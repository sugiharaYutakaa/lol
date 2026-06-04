'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Champion } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  Katakana → Romaji converter (Hepburn)                              */
/* ------------------------------------------------------------------ */

const COMBO: [string, string][] = [
  ['シャ','sha'],['シュ','shu'],['ショ','sho'],
  ['チャ','cha'],['チュ','chu'],['チョ','cho'],
  ['ジャ','ja'],['ジュ','ju'],['ジョ','jo'],
  ['キャ','kya'],['キュ','kyu'],['キョ','kyo'],
  ['ニャ','nya'],['ニュ','nyu'],['ニョ','nyo'],
  ['ヒャ','hya'],['ヒュ','hyu'],['ヒョ','hyo'],
  ['ミャ','mya'],['ミュ','myu'],['ミョ','myo'],
  ['リャ','rya'],['リュ','ryu'],['リョ','ryo'],
  ['ギャ','gya'],['ギュ','gyu'],['ギョ','gyo'],
  ['ビャ','bya'],['ビュ','byu'],['ビョ','byo'],
  ['ピャ','pya'],['ピュ','pyu'],['ピョ','pyo'],
  ['ティ','ti'],['ディ','di'],['デュ','dyu'],
  ['ファ','fa'],['フィ','fi'],['フェ','fe'],['フォ','fo'],
  ['ヴァ','va'],['ヴィ','vi'],['ヴェ','ve'],['ヴォ','vo'],
];

const SINGLE: Record<string, string> = {
  'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
  'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
  'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
  'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
  'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
  'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
  'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
  'ヤ':'ya','ユ':'yu','ヨ':'yo',
  'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
  'ワ':'wa','ヲ':'wo','ン':'n',
  'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
  'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
  'ダ':'da','ヂ':'di','ヅ':'du','デ':'de','ド':'do',
  'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
  'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
  'ヴ':'vu',
};

function katakanaToRomaji(str: string): string {
  let result = '';
  let i = 0;
  while (i < str.length) {
    // Small tsu → double next consonant
    if (str[i] === 'ッ' && i + 1 < str.length) {
      const next = SINGLE[str[i + 1]];
      if (next) { result += next[0]; i++; continue; }
    }
    // Long vowel mark → repeat previous vowel
    if (str[i] === 'ー') {
      const prev = result[result.length - 1];
      if (prev && 'aiueo'.includes(prev)) result += prev;
      i++; continue;
    }
    // 2-char combo
    if (i + 1 < str.length) {
      const pair = str[i] + str[i + 1];
      const combo = COMBO.find(([k]) => k === pair);
      if (combo) { result += combo[1]; i += 2; continue; }
    }
    // Single kana
    const s = SINGLE[str[i]];
    if (s) { result += s; i++; continue; }
    // Pass through (punctuation, spaces, etc.)
    result += str[i]; i++;
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  champions: Champion[];
  value: string;
  onChange: (key: string) => void;
}

export default function ChampionSelect({ champions, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = champions.find((c) => c.key === value);

  // Pre-compute romaji for each champion
  const romajiMap = useMemo(
    () => new Map(champions.map((c) => [c.key, katakanaToRomaji(c.name).toLowerCase()])),
    [champions],
  );

  const filtered = query
    ? champions.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.key.toLowerCase().includes(q) ||
          (romajiMap.get(c.key) ?? '').includes(q)
        );
      })
    : champions;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-abyss border border-gold-dark text-sm px-3 py-2 text-left flex items-center gap-2 focus:border-gold focus:outline-none hover:border-gold transition-colors"
      >
        {selected ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.imageUrl}
              alt=""
              className="w-6 h-6 rounded-sm object-cover"
            />
            <span className="text-gold-bright">{selected.name}</span>
          </>
        ) : (
          <span className="text-gold/40">-- 選択 --</span>
        )}
        <span className="ml-auto text-gold/40 text-xs">&#9662;</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-abyss border border-gold-dark shadow-gold max-h-64 flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-gold-dark/50">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前 / ローマ字 / 英語で検索..."
              className="w-full bg-void border border-gold-dark/50 text-gold-bright text-sm px-2 py-1.5 focus:border-gold focus:outline-none placeholder:text-gold/30"
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gold/40">
                該当なし
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    onChange(c.key);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center gap-2 text-sm text-left hover:bg-gold-deep/30 transition-colors ${
                    c.key === value
                      ? 'bg-gold-deep/20 text-gold-bright'
                      : 'text-gold-bright/80'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="w-6 h-6 rounded-sm object-cover"
                  />
                  {c.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
