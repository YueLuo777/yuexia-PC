import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { UiSample, UiSpecs } from './softwareUiCatalogTypes';

export const DEFAULT_UI_SPECS: UiSpecs = {
  width: 120,
  height: 40,
  fontSize: 14,
  radius: 12,
  paddingX: 20,
  gap: 8,
  iconSize: 16,
  plusMinusSize: 22,
};

const UI_SPEC_DEFAULTS_STORAGE_KEY = 'xinyuexia_software_ui_catalog_spec_defaults_v1';

export function readUiSpecDefaults() {
  try {
    const raw = localStorage.getItem(UI_SPEC_DEFAULTS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, Partial<UiSpecs>>) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeUiSpecDefaults(value: Record<string, Partial<UiSpecs>>) {
  localStorage.setItem(UI_SPEC_DEFAULTS_STORAGE_KEY, JSON.stringify(value));
}

export function getBaseSpecs(item: UiSample): UiSpecs {
  const groupDefaults: Partial<Record<string, Partial<UiSpecs>>> = {
    按钮: { width: 120, height: 40, fontSize: 14, radius: 12, paddingX: 20, iconSize: 16 },
    字号: { width: 184, height: 46, fontSize: 14, radius: 16, paddingX: 16, gap: 18, plusMinusSize: 24 },
    标签: { width: 220, height: 40, fontSize: 16, radius: 15, paddingX: 20, gap: 6 },
    导航: { width: 260, height: 44, fontSize: 14, radius: 12, paddingX: 12, gap: 8, iconSize: 14 },
    AI: { width: 300, height: 44, fontSize: 14, radius: 12, paddingX: 12, gap: 8 },
  };
  return {
    ...DEFAULT_UI_SPECS,
    ...(groupDefaults[item.group] ?? {}),
    ...(item.specs ?? {}),
  };
}

export function NumberSpecInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);
  const helpText = SPEC_HELP_TEXT[label] ?? '这个数值会影响当前 UI 样式预览和以后复用时的规格。';

  useEffect(() => {
    if (!isEditing) setDraft(String(value));
  }, [isEditing, value]);

  return (
    <label className="min-w-0 text-[11px] font-bold text-slate-400" title={helpText}>
      <span className="cursor-help border-b border-dotted border-slate-300">{label}</span>
      <input
        inputMode="numeric"
        value={draft}
        onFocus={() => setIsEditing(true)}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (next.trim() === '') return;
          const numeric = Number(next);
          if (!Number.isFinite(numeric)) return;
          onChange(Math.min(max, Math.max(min, numeric)));
        }}
        onBlur={() => {
          setIsEditing(false);
          if (draft.trim() === '') setDraft(String(value));
        }}
        className="mt-1 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 outline-none focus:border-brand"
      />
    </label>
  );
}

const SPEC_HELP_TEXT: Record<string, string> = {
  宽: '控制这个 UI 的整体宽度。比如按钮、输入框、字号调节器会变宽或变窄。',
  高: '控制这个 UI 的整体高度。数值越大，按钮或输入框越高。',
  字号: '控制文字大小。只影响这个 UI 里显示文字的大小，不会改变功能逻辑。',
  圆角: '控制边角圆润程度。0 是直角，数值越大越圆。',
  左右距: '控制文字或图标到左右边缘的距离。数值越大，内容离边缘越远。',
  间隔: '控制内部元素之间的距离。比如 -、数字、+ 之间的空隙。',
  图标: '控制图标大小。只影响图标显示尺寸。',
  '+/-': '控制加号和减号的大小，常用于字号放大缩小按钮。',
};

export function SpecPill({ label, value }: { label: string; value: string }) {
  const helpText = SPEC_HELP_TEXT[label] ?? '这个数值会影响当前 UI 样式预览和以后复用时的规格。';
  return (
    <span className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500" title={helpText}>
      <span className="cursor-help border-b border-dotted border-slate-300">{label}</span>{' '}
      <b className="text-[#08AACE]">{value}</b>
    </span>
  );
}

export function RenderSpecPreview({ item, specs }: { item: UiSample; specs: UiSpecs }) {
  const commonStyle = {
    width: specs.width,
    height: specs.height,
    boxSizing: 'content-box' as const,
    borderRadius: specs.radius,
    paddingLeft: specs.paddingX,
    paddingRight: specs.paddingX,
    fontSize: specs.fontSize,
    gap: specs.gap,
  };

  if (item.group === '字号' || item.name.includes('字号')) {
    return (
      <div
        className="inline-flex items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm"
        style={commonStyle}
      >
        <span style={{ fontSize: specs.plusMinusSize, lineHeight: 1, fontWeight: 900 }}>-</span>
        <span className="min-w-8 text-center font-black text-[#08AACE]" style={{ fontSize: specs.fontSize }}>
          17
        </span>
        <span style={{ fontSize: specs.plusMinusSize, lineHeight: 1, fontWeight: 900 }}>+</span>
      </div>
    );
  }

  return (
    <button
      className="inline-flex items-center justify-center bg-[#08AACE] font-bold text-white shadow-sm"
      style={commonStyle}
    >
      {item.group === '按钮' && item.id.includes('06') ? (
        <Settings style={{ width: specs.iconSize, height: specs.iconSize }} />
      ) : (
        item.name.slice(0, 4)
      )}
    </button>
  );
}
