import {
  AlertTriangle,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ImportModal } from '@/features/novels/components/ImportModal';
import { useCoverLibrary } from '@/features/covers/hooks/useCoverLibrary';
import { NewNovelModal } from '@/features/novels/components/NewNovelModal';
import { NovelCard, type NovelCardSettings } from '@/features/novels/components/NovelCard';
import { RecycleBinModal } from '@/features/novels/components/RecycleBinModal';
import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import type { Novel, WorkType } from '@/features/novels/model/novelTypes';
import { readWritingSummary, WRITING_STATS_UPDATED_EVENT } from '@/shared/stats/writingStats';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';

export type BtnColor = 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'amber' | 'pink' | 'teal' | 'indigo' | 'gray';

export interface FullCardSettings extends NovelCardSettings {
  cardHeight: 'small' | 'medium' | 'large';
  statFontSize: 'small' | 'medium' | 'large';
  buttonFontSize: 'small' | 'medium' | 'large';
  buttonFontWeight: 'normal' | 'bold';
  btnPerRow: 2 | 3;
  btnRows: 1 | 2 | 3;
  btnOrder: string[];
  btnColors: Record<string, BtnColor>;
}

export const CARD_SETTINGS_KEY = 'novel_card_settings';
export const defaultBtnOrder = ['重命名', '封面', '导出', '删除'];
export const defaultBtnColors: Record<string, BtnColor> = {
  重命名: 'blue',
  封面: 'blue',
  导出: 'blue',
  删除: 'red',
};

export const defaultCardSettings: FullCardSettings = {
  cardWidth: 'small',
  coverHeight: 'medium',
  cardHeight: 'medium',
  statFontSize: 'large',
  buttonFontSize: 'large',
  buttonFontWeight: 'bold',
  btnPerRow: 2,
  btnRows: 2,
  btnOrder: [...defaultBtnOrder],
  btnColors: { ...defaultBtnColors },
};

let workbenchPagePreload: Promise<unknown> | null = null;
let workbenchLibraryPanelPreload: Promise<unknown> | null = null;
let scriptEditorPagePreload: Promise<unknown> | null = null;

export function preloadEditorPage(workType: WorkType) {
  if (workType === 'script') {
    scriptEditorPagePreload ??= import('@/features/script-editor/pages/ScriptEditorPage');
    return scriptEditorPagePreload;
  }

  workbenchPagePreload ??= import('@/features/workbench/pages/WorkbenchPage');
  workbenchLibraryPanelPreload ??= import('@/features/workbench/components/WorkbenchLibraryPanel');
  return Promise.all([workbenchPagePreload, workbenchLibraryPanelPreload]);
}

export function formatWords(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

export function parseWorkDateValue(value?: string) {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const parsed = new Date(raw).getTime();
  if (!Number.isNaN(parsed)) return parsed;
  const normalized = raw.replace(/\./g, '/').replace(/-/g, '/');
  const normalizedTime = new Date(normalized).getTime();
  return Number.isNaN(normalizedTime) ? 0 : normalizedTime;
}

export function formatWorkDate(value?: string) {
  const raw = String(value ?? '').trim();
  if (!raw) return '--';
  const parts = raw.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (parts) return `${parts[1]}/${Number(parts[2])}/${Number(parts[3])}`;
  return raw;
}

export const colorOptions: { value: BtnColor; label: string }[] = [
  { value: 'blue', label: '蓝色' },
  { value: 'red', label: '红色' },
  { value: 'gray', label: '灰色' },
];

export function PillSegmentGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-0.5 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]">
      {children}
    </div>
  );
}

export function PillSegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-[9px] text-sm font-semibold transition-colors ${
        active ? 'bg-white text-[#08AACE] shadow-sm' : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

export function loadCardSettings(): FullCardSettings {
  try {
    const saved = localStorage.getItem(CARD_SETTINGS_KEY);
    if (!saved) return { ...defaultCardSettings };
    const parsed = JSON.parse(saved);
    let savedOrder: string[] = [];
    if (Array.isArray(parsed.btnOrder) && parsed.btnOrder.length > 0) {
      savedOrder = parsed.btnOrder.filter(
        (label: string) => !!label && label !== '' && !label.startsWith('预留') && !label.startsWith('空'),
      );
    }
    if (savedOrder.length === 0) savedOrder = [...defaultBtnOrder];
    return {
      cardWidth: ['small', 'medium', 'large'].includes(parsed.cardWidth)
        ? parsed.cardWidth
        : defaultCardSettings.cardWidth,
      coverHeight: ['small', 'medium', 'large'].includes(parsed.coverHeight)
        ? parsed.coverHeight
        : defaultCardSettings.coverHeight,
      cardHeight: ['small', 'medium', 'large'].includes(parsed.cardHeight)
        ? parsed.cardHeight
        : defaultCardSettings.cardHeight,
      statFontSize: ['small', 'medium', 'large'].includes(parsed.statFontSize)
        ? parsed.statFontSize
        : defaultCardSettings.statFontSize,
      buttonFontSize: ['small', 'medium', 'large'].includes(parsed.buttonFontSize)
        ? parsed.buttonFontSize
        : defaultCardSettings.buttonFontSize,
      buttonFontWeight: ['normal', 'bold'].includes(parsed.buttonFontWeight)
        ? parsed.buttonFontWeight
        : defaultCardSettings.buttonFontWeight,
      btnPerRow: [2, 3].includes(parsed.btnPerRow) ? parsed.btnPerRow : defaultCardSettings.btnPerRow,
      btnRows: [1, 2, 3].includes(parsed.btnRows) ? parsed.btnRows : defaultCardSettings.btnRows,
      btnOrder: savedOrder,
      btnColors: parsed.btnColors && typeof parsed.btnColors === 'object' ? parsed.btnColors : { ...defaultBtnColors },
    };
  } catch {
    return { ...defaultCardSettings };
  }
}

export function saveCardSettings(settings: FullCardSettings) {
  localStorage.setItem(CARD_SETTINGS_KEY, JSON.stringify(settings));
}

export { CardSettingsModal } from './NovelCardSettingsModal';
export { DeleteConfirmModal } from './NovelDeleteConfirmModal';
export { CoverModal } from './NovelCoverModal';
