'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Champion, LaneId } from '@/lib/types';
import { addRow, updateRow } from '@/lib/csv-api';
import ChampionSelect from './ChampionSelect';

/* ------------------------------------------------------------------ */
/*  Field configuration per CSV file                                   */
/* ------------------------------------------------------------------ */

interface FieldDef {
  name: string;
  label: string;
  type: 'champion' | 'category' | 'textarea';
}

const FIELD_MAP: Record<string, { title: string; fields: FieldDef[] }> = {
  'champion_lanes.csv': {
    title: 'チャンピオン',
    fields: [{ name: 'champion', label: 'チャンピオン', type: 'champion' }],
  },
  'counters.csv': {
    title: 'カウンターピック',
    fields: [
      { name: 'enemy', label: '相手チャンピオン', type: 'champion' },
      { name: 'pick', label: 'カウンターピック', type: 'champion' },
      { name: 'reason', label: '理由', type: 'textarea' },
    ],
  },
  'first_pick.csv': {
    title: 'ファーストピック',
    fields: [
      { name: 'pick', label: 'チャンピオン', type: 'champion' },
      { name: 'reason', label: '理由', type: 'textarea' },
    ],
  },
  'balance_pick.csv': {
    title: 'バランスピック',
    fields: [
      { name: 'category', label: 'カテゴリ', type: 'category' },
      { name: 'pick', label: 'チャンピオン', type: 'champion' },
      { name: 'reason', label: '理由', type: 'textarea' },
    ],
  },
};

const CATEGORIES = [
  { id: 'engage', label: 'エンゲージ' },
  { id: 'aoe', label: 'AoE' },
  { id: 'assassin', label: 'アサシン' },
  { id: 'fighter', label: 'ファイター' },
  { id: 'tank', label: 'タンク' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lane: LaneId;
  csvFile: string;
  editMode: 'add' | 'edit';
  /** Pre-filled values (edit mode or fixed fields like enemy). */
  initialData?: Record<string, string>;
  /** Original row fields used to find the row index for update. */
  originalMatch?: Record<string, string>;
}

export default function DataFormModal({
  isOpen,
  onClose,
  lane,
  csvFile,
  editMode,
  initialData,
  originalMatch,
}: Props) {
  const router = useRouter();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const config = FIELD_MAP[csvFile];

  // Fetch champions list
  useEffect(() => {
    if (!isOpen || champions.length > 0) return;
    fetch('/api/champions')
      .then((r) => r.json())
      .then((data: Champion[]) => setChampions(data))
      .catch(() => {});
  }, [isOpen, champions.length]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setForm(initialData ?? {});
      setError('');
    }
  }, [isOpen, initialData]);

  const setField = useCallback((name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!config) return;
    // Validate
    for (const f of config.fields) {
      if (!form[f.name]?.trim()) {
        setError(`「${f.label}」を入力してください`);
        return;
      }
    }
    setSaving(true);
    setError('');
    try {
      const row = { lane } as Record<string, string>;
      for (const f of config.fields) {
        row[f.name] = form[f.name].trim();
      }
      if (editMode === 'add') {
        await addRow(csvFile, row);
      } else {
        if (!originalMatch) throw new Error('originalMatch is required for edit');
        await updateRow(csvFile, originalMatch, row);
      }
      onClose();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative panel w-full max-w-md p-6 animate-fade-up">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-gold/50 hover:text-gold-bright text-xl leading-none"
        >
          &times;
        </button>

        <h2 className="font-display text-lg tracking-display text-gold-bright uppercase mb-1">
          {editMode === 'add' ? '追加' : '編集'}: {config.title}
        </h2>
        <div className="filigree mb-5" />

        <div className="space-y-4">
          {config.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs tracking-display text-gold/70 uppercase mb-1.5">
                {field.label}
              </label>
              {field.type === 'champion' && (
                <ChampionSelect
                  champions={champions}
                  value={form[field.name] ?? ''}
                  onChange={(key) => setField(field.name, key)}
                />
              )}
              {field.type === 'category' && (
                <select
                  value={form[field.name] ?? ''}
                  onChange={(e) => setField(field.name, e.target.value)}
                  className="w-full bg-abyss border border-gold-dark text-gold-bright text-sm px-3 py-2 focus:border-gold focus:outline-none"
                >
                  <option value="">-- 選択 --</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === 'textarea' && (
                <textarea
                  value={form[field.name] ?? ''}
                  onChange={(e) => setField(field.name, e.target.value)}
                  rows={3}
                  className="w-full bg-abyss border border-gold-dark text-gold-bright text-sm px-3 py-2 focus:border-gold focus:outline-none resize-y"
                  placeholder="カウンター理由を入力..."
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-blood">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs tracking-display uppercase text-gold/70 border border-gold-dark hover:border-gold hover:text-gold-bright transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-xs tracking-display uppercase text-gold-bright border border-gold-dark bg-gradient-to-b from-gold-deep/60 to-abyss hover:border-gold hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : editMode === 'add' ? '追加する' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
}
