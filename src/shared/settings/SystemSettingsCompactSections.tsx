import { useEffect, useState } from 'react';

import {
  KEEP_WORKBENCH_ASSOCIATIONS_UPDATED_EVENT,
  readKeepWorkbenchAssociations,
  writeKeepWorkbenchAssociations,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';

type WindowSettingsCompactSectionProps = {
  settings: WindowSettingsResult | null;
  onToggleRemember: () => void;
  onApplyStartupBounds: (bounds: { width: number; height: number }) => void;
};

const SETTINGS_GRID_CLASS = 'grid w-full grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4';
const CARD_CLASS = 'flex min-h-[156px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm';
const META_CLASS = 'rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500';
const WINDOW_SIZE_PRESETS = [
  { width: 1366, height: 768 },
  { width: 1600, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2064, height: 1120 },
];

export function WindowSettingsCompactSection({
  settings,
  onToggleRemember,
  onApplyStartupBounds,
}: WindowSettingsCompactSectionProps) {
  const rememberSize = settings?.rememberSize ?? false;
  const defaultBounds = settings?.defaultBounds ?? { width: 1600, height: 900 };
  const currentBounds = settings?.currentBounds ?? defaultBounds;
  const startupBounds = settings?.startupBounds ?? defaultBounds;
  const [customWidth, setCustomWidth] = useState(String(startupBounds.width));
  const [customHeight, setCustomHeight] = useState(String(startupBounds.height));

  useEffect(() => {
    setCustomWidth(String(startupBounds.width));
    setCustomHeight(String(startupBounds.height));
  }, [startupBounds.height, startupBounds.width]);

  const applyCustomBounds = () => {
    onApplyStartupBounds({
      width: Math.max(1100, Math.round(Number(customWidth) || defaultBounds.width)),
      height: Math.max(680, Math.round(Number(customHeight) || defaultBounds.height)),
    });
  };

  return (
    <div className="w-full">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-100 p-6">
          <div>
            <h3 className="text-lg font-black text-slate-950">窗口大小</h3>
            <p className="mt-1 text-sm text-slate-500">窗口大小记忆与固定启动分辨率互斥，只会有一种生效。</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
              <span className={META_CLASS}>默认 {defaultBounds.width} × {defaultBounds.height}</span>
              <span className="rounded-md bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-[#078FAE]" aria-live="polite">
                当前 {currentBounds.width} × {currentBounds.height}
              </span>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              aria-label="窗口大小记忆"
              checked={rememberSize}
              onChange={onToggleRemember}
              className="h-4 w-4 accent-[#08AACE]"
            />
            <span>
              <span className="block text-sm font-black text-slate-900">窗口大小记忆</span>
              <span className="mt-0.5 block text-xs text-slate-500">记住关闭软件时的宽高和位置</span>
            </span>
          </label>
        </div>

        <fieldset disabled={rememberSize} className="p-6 disabled:cursor-not-allowed disabled:opacity-45">
          <div className="flex items-start justify-between gap-4">
            <div>
              <legend className="text-base font-black text-slate-950">固定启动分辨率</legend>
              <p className="mt-1 text-sm text-slate-500">
                {rememberSize ? '已由窗口大小记忆接管，此区域暂时失效。' : '每次打开软件都使用这里选择的尺寸。'}
              </p>
            </div>
            <span className="rounded-lg bg-cyan-50 px-3 py-2 text-xs font-black text-[#078FAE]">
              启动 {startupBounds.width} × {startupBounds.height}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {WINDOW_SIZE_PRESETS.map((preset) => {
            const isCurrent = startupBounds.width === preset.width && startupBounds.height === preset.height;
            return (
              <button
                key={`${preset.width}x${preset.height}`}
                type="button"
                aria-pressed={isCurrent}
                onClick={() => onApplyStartupBounds(preset)}
                className={
                  isCurrent
                    ? `${PRIMARY_TEXT_BUTTON_CLASS} w-full py-2`
                    : 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition-colors hover:border-[#08AACE]/40 hover:bg-cyan-50 hover:text-[#078ca9]'
                }
              >
                {preset.width} × {preset.height}
              </button>
            );
          })}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="text-xs font-bold text-slate-500">
              宽度
              <input
                type="number"
                min="1100"
                value={customWidth}
                onChange={(event) => setCustomWidth(event.target.value)}
                className="mt-1 block h-10 w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-[#08AACE]"
              />
            </label>
            <span className="pb-2 text-sm font-black text-slate-400">×</span>
            <label className="text-xs font-bold text-slate-500">
              高度
              <input
                type="number"
                min="680"
                value={customHeight}
                onChange={(event) => setCustomHeight(event.target.value)}
                className="mt-1 block h-10 w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-[#08AACE]"
              />
            </label>
            <button type="button" onClick={applyCustomBounds} className={`${PRIMARY_TEXT_BUTTON_CLASS} h-10 px-5`}>
              应用并预览
            </button>
          </div>
        </fieldset>
      </section>
    </div>
  );
}

export function AssociationSettingsCompactSection() {
  const [keepAssociations, setKeepAssociations] = useState(readKeepWorkbenchAssociations);

  useEffect(() => {
    const syncValue = () => setKeepAssociations(readKeepWorkbenchAssociations());
    window.addEventListener(KEEP_WORKBENCH_ASSOCIATIONS_UPDATED_EVENT, syncValue);
    window.addEventListener('storage', syncValue);
    return () => {
      window.removeEventListener(KEEP_WORKBENCH_ASSOCIATIONS_UPDATED_EVENT, syncValue);
      window.removeEventListener('storage', syncValue);
    };
  }, []);

  const updateKeepAssociations = (value: boolean) => {
    setKeepAssociations(writeKeepWorkbenchAssociations(value));
  };

  return (
    <div className={SETTINGS_GRID_CLASS}>
      <section className={CARD_CLASS}>
        <div>
          <h3 className="text-sm font-black text-slate-950">保持关联</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            勾选后，资料、本章、脑洞和其他关联内容在关闭软件后继续保留。
          </p>
        </div>
        <label className="mt-auto flex cursor-pointer items-center gap-2 pt-3 text-sm font-black text-slate-700">
          <input
            type="checkbox"
            aria-label="保持关联"
            checked={keepAssociations}
            onChange={(event) => updateKeepAssociations(event.target.checked)}
            className="h-4 w-4 accent-[#08AACE]"
          />
          <span>{keepAssociations ? '已保持关联' : '不保持关联'}</span>
        </label>
      </section>

      <section className={CARD_CLASS}>
        <div>
          <h3 className="text-sm font-black text-slate-950">关闭软件时</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {keepAssociations
              ? '当前会保留全部关联，下次打开软件时无需重新关联。'
              : '当前会自动取消全部关联，下次打开软件时需要重新关联。'}
          </p>
        </div>
        <div className="mt-auto pt-3">
          <span className={META_CLASS}>{keepAssociations ? '保留全部关联' : '恢复未关联状态'}</span>
        </div>
      </section>
    </div>
  );
}
