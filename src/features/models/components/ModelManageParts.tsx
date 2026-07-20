import { AlertCircle, Eye, EyeOff, Settings, X } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useModels } from '@/features/models/hooks/useModels';
import type { ModelItem, ModelProvider } from '@/features/models/model/modelTypes';
import { callModel } from '@/features/models/services/callModel';
import { addRecord, useCallRecords } from '@/hooks/useCallRecords';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';
import { RadialCreateButton } from '@/shared/ui/RadialCreateButton';

export type ModelDraft = {
  name: string;
  id: string;
  baseUrl: string;
  apiKey: string;
  provider: ModelProvider;
  temperature: number;
};

export type ModelCardsPerRow = 3 | 4;

export type ModelManagePageProps = {
  embedded?: boolean;
  onClose?: () => void;
  headerDragHandleProps?: HTMLAttributes<HTMLDivElement>;
};

export const MODEL_MANAGE_SETTINGS_KEY = 'xinyuexia_model_manage_settings_v1';
export const MODEL_MANAGE_COLUMNS: ModelCardsPerRow = 4;
export const MODEL_CARD_HEIGHT_CLASS = 'h-[247px]';

export const temperaturePresets = [
  { label: '精准', value: 0.3, desc: '提炼、总结、校对' },
  { label: '均衡', value: 0.7, desc: '写作、对话、通用' },
  { label: '创意', value: 1.0, desc: '脑洞、扩写、风格化' },
] as const;

export type TemperaturePresetSelection = (typeof temperaturePresets)[number]['value'] | 'custom';

export function getTemperaturePresetSelection(value: number): TemperaturePresetSelection {
  const normalized = normalizeTemperature(value);
  return temperaturePresets.find((preset) => preset.value === normalized)?.value ?? 'custom';
}

export function loadCardsPerRow(): ModelCardsPerRow {
  return MODEL_MANAGE_COLUMNS;
}

export function saveCardsPerRow(cardsPerRow: ModelCardsPerRow) {
  localStorage.setItem(MODEL_MANAGE_SETTINGS_KEY, JSON.stringify({ cardsPerRow }));
}

export const providerMeta: Record<
  ModelProvider,
  { label: string; defaultBaseUrl: string; modelPlaceholder: string; namePlaceholder: string }
> = {
  'openai-compatible': {
    label: 'OpenAI 兼容（GPT / DeepSeek 等）',
    defaultBaseUrl: '',
    modelPlaceholder: '',
    namePlaceholder: '',
  },
  anthropic: {
    label: 'Anthropic Claude',
    defaultBaseUrl: '',
    modelPlaceholder: '',
    namePlaceholder: '',
  },
};

export function normalizeTemperature(value: number) {
  if (!Number.isFinite(value)) return 0.7;
  const stepped = Math.round(value / 0.05) * 0.05;
  return Math.max(0.1, Math.min(1, Number(stepped.toFixed(2))));
}

export function formatTemperature(value: number) {
  return normalizeTemperature(value).toFixed(2);
}

export function normalizeModelDraft(draft: ModelDraft) {
  const id = draft.id.trim();
  return {
    ...draft,
    id,
    name: draft.name.trim() || id,
    temperature: normalizeTemperature(draft.temperature),
    baseUrl: draft.baseUrl.trim().replace(/^(?:POST|GET)\s+/i, ''),
    apiKey: draft.apiKey.trim(),
  };
}

export function getSwapPreviewItems<T>(items: T[], dragSourceIndex: number | null, targetIndex: number | null) {
  if (
    dragSourceIndex === null ||
    targetIndex === null ||
    dragSourceIndex === targetIndex ||
    dragSourceIndex < 0 ||
    targetIndex < 0 ||
    dragSourceIndex >= items.length ||
    targetIndex >= items.length
  )
    return items;
  const next = [...items];
  const [moved] = next.splice(dragSourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export type ModelPointerDragState = {
  sourceIndex: number;
  pointerId: number;
  element: HTMLElement;
  startX: number;
  startY: number;
  active: boolean;
  armed: boolean;
  activationTimer: number;
  lastPreviewX: number;
  lastPreviewY: number;
  lastPreviewTargetKey: string | null;
  cleanup: () => void;
} | null;

export const MODEL_POINTER_DRAG_ACTIVATION_DISTANCE = 14;
export const MODEL_POINTER_DRAG_ACTIVATION_DELAY_MS = 160;
export const MODEL_POINTER_DRAG_RETARGET_DISTANCE = 28;
export const MODEL_POINTER_DRAG_RETURN_DISTANCE = 28;

export function hasModelPointerRetargetedTooSoon(
  pointerDrag: NonNullable<ModelPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  if (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey) return false;
  const distanceFromLastPreview = Math.hypot(clientX - pointerDrag.lastPreviewX, clientY - pointerDrag.lastPreviewY);
  const retargetDistance =
    targetKey === `model:${pointerDrag.sourceIndex}`
      ? MODEL_POINTER_DRAG_RETURN_DISTANCE
      : MODEL_POINTER_DRAG_RETARGET_DISTANCE;
  return distanceFromLastPreview < retargetDistance;
}

export function rememberModelPointerPreviewTarget(
  pointerDrag: NonNullable<ModelPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  pointerDrag.lastPreviewTargetKey = targetKey;
  pointerDrag.lastPreviewX = clientX;
  pointerDrag.lastPreviewY = clientY;
}

export function formatLogTime(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function ModelEditorModal({
  isOpen,
  title,
  initial,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  title: string;
  initial: ModelDraft;
  onClose: () => void;
  onSave: (draft: ModelDraft) => void;
}) {
  const [draft, setDraft] = useState<ModelDraft>(initial);
  const [showKey, setShowKey] = useState(false);
  const [temperaturePresetSelection, setTemperaturePresetSelection] = useState<TemperaturePresetSelection>(() =>
    getTemperaturePresetSelection(initial.temperature),
  );
  const currentProvider = providerMeta[draft.provider];

  useEffect(() => {
    if (isOpen) {
      setDraft(initial);
      setTemperaturePresetSelection(getTemperaturePresetSelection(initial.temperature));
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

  return (
    <AppModalShell
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[713px]"
      heightClass="min-h-[650px] max-h-[calc(100vh-48px)]"
      zIndexClass="z-[260]"
      storageId="model-editor-modal"
    >
      <div className="min-h-0 space-y-5 overflow-y-auto px-8 py-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <span className="shrink-0">模型名称</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder={currentProvider.namePlaceholder}
              className="h-9 min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <span className="shrink-0">模型 ID</span>
            <input
              value={draft.id}
              onChange={(event) => setDraft((prev) => ({ ...prev, id: event.target.value }))}
              placeholder={currentProvider.modelPlaceholder}
              className="h-9 min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
            />
          </label>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-600">温度预设</label>
            <span className="text-xs font-bold text-brand">{formatTemperature(draft.temperature)}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {temperaturePresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setDraft((prev) => ({ ...prev, temperature: preset.value }));
                  setTemperaturePresetSelection(preset.value);
                }}
                className={`rounded-2xl border px-3 py-2 text-left transition-colors ${
                  temperaturePresetSelection === preset.value
                    ? 'border-brand bg-brand-light text-brand'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="text-sm font-bold">{preset.label}</div>
                <div className="mt-0.5 text-[11px] opacity-80">{formatTemperature(preset.value)}</div>
                <div className="mt-1 truncate text-[10px] opacity-70">{preset.desc}</div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setTemperaturePresetSelection('custom')}
              className={`rounded-2xl border px-3 py-2 text-left transition-colors ${
                temperaturePresetSelection === 'custom'
                  ? 'border-brand bg-brand-light text-brand'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-bold">自定义</div>
              <div className="mt-0.5 text-[11px] opacity-80">{formatTemperature(draft.temperature)}</div>
              <div className="mt-1 truncate text-[10px] opacity-70">手动调节温度</div>
            </button>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={normalizeTemperature(draft.temperature)}
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, temperature: normalizeTemperature(Number(event.target.value)) }));
              setTemperaturePresetSelection('custom');
            }}
            className="mt-3 w-full accent-brand"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">接口类型</label>
          <CapsuleSelect
            value={draft.provider}
            onChange={(value) => {
              const provider = value as ModelProvider;
              setDraft((prev) => ({
                ...prev,
                provider,
                baseUrl: prev.baseUrl,
              }));
            }}
            options={(Object.keys(providerMeta) as ModelProvider[]).map((provider) => ({
              value: provider,
              label: providerMeta[provider].label,
            }))}
          />
        </div>
        <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <span className="w-[84px] shrink-0">接口地址</span>
          <input
            value={draft.baseUrl}
            onChange={(event) => setDraft((prev) => ({ ...prev, baseUrl: event.target.value }))}
            placeholder={currentProvider.defaultBaseUrl}
            className="h-9 min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <span className="w-[84px] shrink-0">API Key</span>
          <span className="relative min-w-0 flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={draft.apiKey}
              onChange={(event) => setDraft((prev) => ({ ...prev, apiKey: event.target.value }))}
              className="h-9 w-full rounded-[10px] border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-[#E7F8FD] hover:text-[#08AACE]"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-8 py-5">
        <ActionButton onClick={onClose} variant="secondary">
          取消
        </ActionButton>
        <ActionButton onClick={() => onSave(draft)} disabled={!draft.name.trim() || !draft.id.trim()}>
          保存修改
        </ActionButton>
      </div>
    </AppModalShell>
  );
}

export function ModelManageSettingsModal({
  isOpen,
  cardsPerRow,
  onChange,
  onClose,
}: {
  isOpen: boolean;
  cardsPerRow: ModelCardsPerRow;
  onChange: (value: ModelCardsPerRow) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-sharp fixed inset-0 z-[265] flex items-center justify-center bg-black/35 px-6"
      onClick={onClose}
    >
      <div
        className="modal-sharp w-[420px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">模型管理设置</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#08AACE]/50 hover:bg-[#EAF9FD] hover:text-[#078fb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-3 text-sm font-bold text-slate-700">模型卡片布局</div>
          <div className="grid grid-cols-1 gap-3">
            {([MODEL_MANAGE_COLUMNS] as const).map((value) => {
              const isActive = cardsPerRow === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange(value)}
                  className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078fb0]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-[#F8FEFF]'
                  }`}
                >
                  <div className="text-base font-bold">每行 {value} 个</div>
                  <div className="mt-1 text-xs opacity-75">一列约 3 个，适合大弹窗快速浏览。</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
