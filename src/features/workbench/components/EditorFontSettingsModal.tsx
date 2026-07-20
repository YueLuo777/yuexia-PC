import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AtSign,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Diamond,
  Link2,
  Loader2,
  Palette,
  Plus,
  RotateCcw,
  Rows3,
  Sparkles,
  Type,
  Wand2,
  X,
} from 'lucide-react';

import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { WordCountText } from '@/shared/ui/WordCountText';

import { ModalShell } from './EditorToolModalShell';
import {
  applyFormat,
  colorOptions,
  defaultFontSettings,
  defaultFormatOptions,
  editorGridLineModeOptions,
  FONT_SETTINGS_KEY,
  fontOptions,
  getEditorGridLineStyle,
  getEditorTextLineHeight,
  normalizeFontSettings,
  SMART_FORMAT_KEY,
  writeJson,
} from './editorToolState';
import type { FontSettings, FormatOptions, GenerateMode } from './editorToolState';
import { ToggleRow } from './EditorReplaceTools';

interface GeneratedCard {
  id: number;
  status: 'thinking' | 'done';
  content: string;
}

const generateModeConfig: Record<
  GenerateMode,
  {
    title: string;
    taskName: string;
    taskTarget: string;
    promptTitle: string;
    promptDesc: string;
  }
> = {
  opening: {
    title: '黄金开篇 审批',
    taskName: '黄金开篇',
    taskTarget: '第1-3章 正文',
    promptTitle: '官方-黄金三章 节奏优化版',
    promptDesc: '强化开篇钩子、冲突密度和角色动机，适合快速打磨前三章。',
  },
  continue: {
    title: '章节续写 审批',
    taskName: '章节续写',
    taskTarget: '当前章节后续正文',
    promptTitle: '官方-章节续写 钩子优化版',
    promptDesc: '推演后续剧情，延续文风，补足冲突、转折和收束节奏。',
  },
};

export function FontSettingsModal({
  isOpen,
  onClose,
  settings,
  onChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: FontSettings;
  onChange: (settings: FontSettings) => void;
}) {
  const [local, setLocal] = useState(() => normalizeFontSettings(settings));
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocal(normalizeFontSettings(settings)), [settings]);
  if (!isOpen) return null;

  const update = (patch: Partial<FontSettings>) => {
    const next = normalizeFontSettings({ ...local, ...patch });
    setLocal(next);
    onChange(next);
    writeJson(FONT_SETTINGS_KEY, next);
  };

  return (
    <ModalShell
      title="字体设置"
      icon={<Type className="h-4 w-4 text-brand" />}
      onClose={onClose}
      widthClass="w-[420px]"
    >
      <div className="space-y-5 p-5">
        <section>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
            <Type className="h-3.5 w-3.5 text-gray-400" />
            字体
          </div>
          <div className="grid grid-cols-3 gap-2">
            {fontOptions.map((font) => (
              <button
                key={font.value}
                onClick={() => update({ fontFamily: font.value })}
                className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${local.fontFamily === font.value ? 'border-brand bg-brand-light font-medium text-brand-dark' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
            <Palette className="h-3.5 w-3.5 text-gray-400" />
            字体颜色
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => update({ fontColor: color })}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${local.fontColor === color ? 'scale-110 border-brand' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              ref={colorInputRef}
              type="color"
              value={local.fontColor}
              onChange={(event) => update({ fontColor: event.target.value })}
              className="h-7 w-7 cursor-pointer overflow-hidden rounded-full border-0 p-0"
            />
          </div>
        </section>
        <SliderSetting label="字号" value={`${local.fontSize}px`} icon={<Type className="h-3.5 w-3.5 text-gray-400" />}>
          <FontSizeStepper
            value={local.fontSize}
            min={12}
            max={30}
            onChange={(fontSize) => update({ fontSize })}
            ariaLabel="编辑器工具字号"
          />
        </SliderSetting>
        <SliderSetting
          label="行高"
          value={String(local.lineHeight)}
          icon={<Rows3 className="h-3.5 w-3.5 text-gray-400" />}
        >
          <button
            onClick={() => update({ lineHeight: Math.max(1, Number((local.lineHeight - 0.1).toFixed(1))) })}
            className="h-7 w-7 rounded border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
          >
            -
          </button>
          <input
            type="range"
            min={10}
            max={24}
            value={Math.round(local.lineHeight * 10)}
            onChange={(event) => update({ lineHeight: Number(event.target.value) / 10 })}
            className="flex-1"
          />
          <button
            onClick={() => update({ lineHeight: Math.min(2.4, Number((local.lineHeight + 0.1).toFixed(1))) })}
            className="h-7 w-7 rounded border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
          >
            +
          </button>
        </SliderSetting>
        <section>
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700">稿纸线</p>
              <p className="mt-0.5 text-xs text-gray-400">在正文编辑区显示随字号和行高同步变化的参考线</p>
            </div>
            <div className="grid h-8 shrink-0 grid-cols-3 overflow-hidden rounded-md border border-brand bg-white">
              {editorGridLineModeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update({ gridLineMode: option.value })}
                  className={`min-w-[46px] px-3 text-xs font-medium transition-colors ${
                    local.gridLineMode === option.value
                      ? 'bg-brand text-white'
                      : 'border-l border-brand/20 text-brand first:border-l-0 hover:bg-brand-light'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
          <p className="mb-2 text-xs text-gray-400">预览</p>
          <div
            className="rounded border border-gray-200 bg-white p-3"
            style={{
              ...getEditorGridLineStyle(local),
              fontFamily: local.fontFamily,
              color: local.fontColor,
              fontSize: Math.min(local.fontSize, 16),
              lineHeight: getEditorTextLineHeight(local),
            }}
          >
            这是一段预览文字，用于查看字体设置效果。
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
        <button
          onClick={() => update(defaultFontSettings)}
          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
        >
          恢复默认
        </button>
        <button onClick={onClose} className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark">
          确定
        </button>
      </div>
    </ModalShell>
  );
}

function SliderSetting({
  label,
  value,
  icon,
  children,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {icon}
          {label}
        </div>
        <span className="text-xs text-gray-400">{value}</span>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </section>
  );
}
