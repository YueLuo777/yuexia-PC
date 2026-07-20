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

export function SmartFormatModal({
  isOpen,
  onClose,
  currentText,
  settings,
  onSettingsChange,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  settings: FormatOptions;
  onSettingsChange?: (settings: FormatOptions) => void;
  onApply: (text: string, settings: FormatOptions) => void;
}) {
  const [options, setOptions] = useState(settings);
  const [preview, setPreview] = useState('');

  useEffect(() => setOptions(settings), [settings]);
  if (!isOpen) return null;

  const updateOptions = (next: FormatOptions) => {
    setOptions(next);
    writeJson(SMART_FORMAT_KEY, next);
    onSettingsChange?.(next);
  };

  const apply = () => {
    const formatted = applyFormat(currentText, options);
    writeJson(SMART_FORMAT_KEY, options);
    onApply(formatted, options);
    onClose();
  };

  return (
    <ModalShell
      title="智能排版"
      icon={<Wand2 className="h-5 w-5 text-brand" />}
      onClose={onClose}
      widthClass="w-[560px]"
    >
      <div className="px-5 py-3">
        <ToggleRow
          label="段落缩进"
          desc="每个非空段落开头写入两个全角空格"
          checked={options.paragraphIndent}
          onChange={(value) => updateOptions({ ...options, paragraphIndent: value })}
        />
        <ToggleRow
          label="合并空段落"
          desc="合并空行并整理成连续正文段落"
          checked={options.mergeParagraphs}
          onChange={(value) => updateOptions({ ...options, mergeParagraphs: value })}
        />
        {preview && (
          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="mb-2 text-xs text-gray-400">预览</p>
            <pre className="max-h-[120px] overflow-y-auto whitespace-pre-wrap text-xs text-gray-600">{preview}</pre>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-2.5">
        <button
          onClick={() => {
            updateOptions(defaultFormatOptions);
            setPreview('');
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="h-4 w-4" />
          恢复默认
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(applyFormat(currentText, options))}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            预览效果
          </button>
          <button
            onClick={apply}
            className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            <Wand2 className="h-4 w-4" />
            立即智能排版
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
