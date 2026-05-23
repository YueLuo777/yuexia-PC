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

import { useDraggableModal } from '@/shared/hooks/useDraggableModal';

export interface FormatOptions {
  indent: boolean;
  mergeParagraphs: boolean;
  smartBreak: boolean;
  sentencesPerLine: number;
}

export interface FontSettings {
  fontFamily: string;
  fontColor: string;
  fontSize: number;
  lineHeight: number;
}

export interface HistorySnapshot {
  id: string;
  chapterId: number;
  content: string;
  wordCount: number;
  timestamp: string;
  trigger: 'manual' | 'auto';
}

interface ChapterAssociateItem {
  id: number;
  serialNumber: number;
  wordCount: number;
}

export type GenerateMode = 'opening' | 'continue';

const FONT_SETTINGS_KEY = 'xinyuexia_font_settings';
const SMART_FORMAT_KEY = 'xinyuexia_smart_format_settings';
const SMART_FORMAT_ENABLED_KEY = 'xinyuexia_smart_format_enabled';
const HIGH_FREQ_WORDS_KEY = 'xinyuexia_high_freq_words';
const HIGH_FREQ_ENABLED_KEY = 'xinyuexia_high_freq_enabled';
const LEGACY_SMART_FORMAT_KEY = 'smart_format_settings';
const LEGACY_SMART_FORMAT_ENABLED_KEY = 'smart_format_enabled';
const LEGACY_HIGH_FREQ_WORDS_KEY = 'high_freq_words';
const LEGACY_HIGH_FREQ_ENABLED_KEY = 'high_freq_enabled';
const HISTORY_KEY = 'xinyuexia_editor_history_snapshots';
const ASSOCIATED_CHAPTERS_KEY = 'xinyuexia_associated_chapters';

const defaultFontSettings: FontSettings = {
  fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
  fontColor: '#374151',
  fontSize: 22,
  lineHeight: 1.8,
};

export const defaultFormatOptions: FormatOptions = {
  indent: true,
  mergeParagraphs: true,
  smartBreak: false,
  sentencesPerLine: 3,
};

const fontOptions = [
  { label: '默认字体', value: 'PingFang SC, Microsoft YaHei, sans-serif' },
  { label: '宋体', value: 'SimSun, Songti SC, serif' },
  { label: '黑体', value: 'SimHei, Heiti SC, sans-serif' },
];

const colorOptions = [
  '#374151', '#111827', '#DC2626', '#EA580C', '#D97706',
  '#059669', '#0891B2', '#2563EB', '#7C3AED', '#DB2777',
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredFontSettings(): FontSettings {
  return { ...defaultFontSettings, ...readJson<Partial<FontSettings>>(FONT_SETTINGS_KEY, {}) };
}

export function getStoredFormatSettings(): FormatOptions {
  return {
    ...defaultFormatOptions,
    ...readJson<Partial<FormatOptions>>(LEGACY_SMART_FORMAT_KEY, {}),
    ...readJson<Partial<FormatOptions>>(SMART_FORMAT_KEY, {}),
  };
}

export function isSmartFormatEnabled() {
  if (localStorage.getItem(SMART_FORMAT_ENABLED_KEY) !== null) {
    return readJson<boolean>(SMART_FORMAT_ENABLED_KEY, false);
  }
  return readJson<boolean>(LEGACY_SMART_FORMAT_ENABLED_KEY, false);
}

export function setSmartFormatEnabled(value: boolean) {
  writeJson(SMART_FORMAT_ENABLED_KEY, value);
  writeJson(LEGACY_SMART_FORMAT_ENABLED_KEY, value);
  window.dispatchEvent(new CustomEvent('xinyuexia_smart_format_updated'));
}

function getStoredHighFreqWords() {
  return [
    ...readJson<string[]>(LEGACY_HIGH_FREQ_WORDS_KEY, []),
    ...readJson<string[]>(HIGH_FREQ_WORDS_KEY, []),
  ].filter((word, index, list) => word && list.indexOf(word) === index);
}

function isHighFreqEnabled() {
  if (localStorage.getItem(HIGH_FREQ_ENABLED_KEY) !== null) {
    return readJson<boolean>(HIGH_FREQ_ENABLED_KEY, false);
  }
  return readJson<boolean>(LEGACY_HIGH_FREQ_ENABLED_KEY, false);
}

function setHighFreqEnabled(value: boolean) {
  writeJson(HIGH_FREQ_ENABLED_KEY, value);
  writeJson(LEGACY_HIGH_FREQ_ENABLED_KEY, value);
}

export function applyFormat(text: string, options: FormatOptions) {
  if (!text.trim()) return '';
  let result = text;
  result = result.replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2');
  result = result.replace(/(\d)\s+(\d)/g, '$1$2');
  if (options.mergeParagraphs) {
    result = result
      .replace(/\n{2,}/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');
  }
  if (options.indent) {
    result = result
      .split('\n')
      .map((line) => (line.trim() ? `　　${line.trim()}` : line))
      .join('\n');
  }
  if (options.smartBreak) {
    const sentences = result.replace(/([。！？.!?]+)/g, '$1\x00').split('\x00').filter((item) => item.trim());
    const grouped: string[] = [];
    for (let index = 0; index < sentences.length; index += options.sentencesPerLine) {
      grouped.push(sentences.slice(index, index + options.sentencesPerLine).join(''));
    }
    result = grouped.join('\n');
  }
  return result;
}

export function applyFormatWithCursor(text: string, cursorPos: number, options: FormatOptions) {
  const formatted = applyFormat(text, options);
  if (formatted === text) return { text, cursorPos };

  const anchor = text.slice(Math.max(0, cursorPos - 10), cursorPos);
  if (anchor) {
    const anchorIndex = formatted.indexOf(anchor);
    if (anchorIndex >= 0) {
      return { text: formatted, cursorPos: anchorIndex + anchor.length };
    }
  }

  const ratio = text.length > 0 ? cursorPos / text.length : 1;
  return {
    text: formatted,
    cursorPos: Math.max(0, Math.min(formatted.length, Math.round(formatted.length * ratio))),
  };
}

function loadSnapshots() {
  return readJson<Record<string, HistorySnapshot[]>>(HISTORY_KEY, {});
}

export function saveSnapshot(chapterId: number, content: string) {
  if (!content.trim()) return;
  const all = loadSnapshots();
  const key = String(chapterId);
  const list = all[key] ?? [];
  const now = Date.now();
  const last = list[list.length - 1];
  if (last && now - Number(last.id) < 5 * 60 * 1000) return;
  const date = new Date(now);
  const timestamp = date.toLocaleString('zh-CN', { hour12: false });
  const snapshot: HistorySnapshot = {
    id: String(now),
    chapterId,
    content,
    wordCount: content.replace(/\s/g, '').length,
    timestamp,
    trigger: 'auto',
  };
  all[key] = [...list, snapshot].slice(-20);
  writeJson(HISTORY_KEY, all);
}

function ModalShell({ title, icon, children, onClose, widthClass = 'w-[520px]' }: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  const draggable = useDraggableModal(`editor_tool_${title}`);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`${widthClass} max-h-[88vh] max-w-[94vw] overflow-hidden rounded-xl bg-white shadow-2xl`}
        data-draggable-managed="true"
        style={draggable.style}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex cursor-move items-center justify-between border-b border-gray-100 px-5 py-3" {...draggable.dragHandleProps}>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
          </div>
          <button data-no-modal-drag="true" onClick={onClose} className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface GeneratedCard {
  id: number;
  status: 'thinking' | 'done';
  content: string;
}

const generateModeConfig: Record<GenerateMode, {
  title: string;
  taskName: string;
  taskTarget: string;
  promptTitle: string;
  promptDesc: string;
}> = {
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

export function AIGenerateModal({ isOpen, onClose, mode, currentChapterSerial, currentContent, onApply }: {
  isOpen: boolean;
  onClose: () => void;
  mode: GenerateMode;
  currentChapterSerial: number;
  currentContent: string;
  onApply: (content: string) => void;
}) {
  const config = generateModeConfig[mode];
  const [promptTab, setPromptTab] = useState<'library' | 'custom'>('library');
  const [chapterCount, setChapterCount] = useState('3');
  const [showDetail, setShowDetail] = useState(false);
  const [emojiSwitch, setEmojiSwitch] = useState('关闭');
  const [extraInfo, setExtraInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cards, setCards] = useState<GeneratedCard[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setCards([]);
    setIsGenerating(false);
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const makeDraft = (index: number) => {
    const seed = currentContent.replace(/\s/g, '').slice(-36) || '前文情绪仍在延续';
    return [
      `　　${seed}，新的冲突顺势压了下来。`,
      `　　第${currentChapterSerial}章的后续可以从人物的即时反应切入，让矛盾先落到一个明确选择上。`,
      `　　方案${index}：先补行动，再补心理，结尾留下一个能牵引下一幕的钩子。${extraInfo ? `\n　　额外约束：${extraInfo}` : ''}`,
    ].join('\n');
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setCards(Array.from({ length: Number(chapterCount) }, (_, index) => ({
      id: index + 1,
      status: 'thinking',
      content: '',
    })));
    window.setTimeout(() => {
      setCards(Array.from({ length: Number(chapterCount) }, (_, index) => ({
        id: index + 1,
        status: 'done',
        content: makeDraft(index + 1),
      })));
      setIsGenerating(false);
    }, 700);
  };

  return (
    <ModalShell title={config.title} onClose={onClose} widthClass="w-[960px]">
      <div className="flex h-[680px] max-h-[78vh] flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">1-3</span>
            <span className="text-sm text-gray-500">任务目标</span>
            <span className="text-sm font-bold text-gray-900">{config.taskName}</span>
            <span className="text-sm font-bold text-brand-dark">{config.taskTarget}</span>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
            <Diamond className="h-3.5 w-3.5 text-brand-dark" />
            预计 2364 灵石
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-y-auto p-5">
            <section className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">本次生成</p>
                <span className="text-xs text-gray-500">预计范围：第{currentChapterSerial}章起</span>
              </div>
              <div className="mb-2 flex items-center gap-3">
                <span className="shrink-0 text-sm text-gray-500">一次生成</span>
                <div className="relative flex-1">
                  <select
                    value={chapterCount}
                    onChange={(event) => setChapterCount(event.target.value)}
                    className="w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm outline-none focus:border-brand"
                  >
                    {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <span className="shrink-0 text-sm text-gray-500">章</span>
              </div>
              <p className="text-xs text-gray-400">上限 5 章；若章纲不足，会自动下调实际生成章数。</p>
            </section>

            <section className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">使用的提示词</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPromptTab('library')}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${promptTab === 'library' ? 'bg-brand text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    提示词库
                  </button>
                  <button
                    onClick={() => setPromptTab('custom')}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${promptTab === 'custom' ? 'bg-brand text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    自定义提示词
                  </button>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border border-gray-100 bg-white p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-700 to-amber-900">
                  <span className="text-xs font-bold text-amber-200">炼</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-brand-light px-2 py-0.5 text-xs text-brand-dark">提示词库</span>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-600">关联信息已调整</span>
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-gray-900">{config.promptTitle}</h4>
                  <p className="mb-1 text-xs text-gray-400">作者：炼字官方出品</p>
                  <p className="text-xs text-gray-400">{config.promptDesc}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => setShowDetail((prev) => !prev)}
                      className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      详情
                      {showDetail ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <button className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand-dark">
                      <Sparkles className="h-3.5 w-3.5" />
                      更换提示词
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">补充信息</p>
                <div className="flex items-center gap-2">
                  <button className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-white">填入预设</button>
                  <button className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:text-gray-700"><BookOpen className="h-3.5 w-3.5" /></button>
                  <button className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:text-gray-700"><AtSign className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <textarea
                value={extraInfo}
                onChange={(event) => setExtraInfo(event.target.value)}
                placeholder="可选：限制字数、强调某条设定、改人称、加冲突/反转..."
                rows={3}
                className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </section>

            {mode === 'continue' && (
              <section className="mb-4 rounded-lg bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">提示词参数</p>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">共 1 个</span>
                </div>
                <label className="mb-1.5 block text-sm text-gray-600">表情包和颜文字开关<span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={emojiSwitch}
                    onChange={(event) => setEmojiSwitch(event.target.value)}
                    className="w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm outline-none focus:border-brand"
                  >
                    <option value="关闭">关闭</option>
                    <option value="开启">开启</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </section>
            )}
          </div>

          <div className="flex w-[340px] flex-col border-l border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-xs text-gray-500">工具生成内容</span>
              <span className="text-xs text-gray-400">当前 {cards.reduce((sum, card) => sum + card.content.replace(/\s/g, '').length, 0)} 字</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cards.length === 0 ? (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <p className="text-sm leading-6 text-gray-400">尚未生成内容，请先完成提示词审批并开始生成。</p>
                </div>
              ) : cards.map((card) => (
                <div key={card.id} className="rounded-lg border border-gray-100 p-4">
                  {card.status === 'thinking' ? (
                    <div className="mb-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-dark" />
                      <span className="text-sm text-gray-600">思考中...</span>
                    </div>
                  ) : (
                    <p className="mb-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">{card.content}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">字数: {card.content.replace(/\s/g, '').length} 字</span>
                    <button
                      onClick={() => void navigator.clipboard.writeText(card.content)}
                      disabled={!card.content}
                      className="flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                    >
                      <Copy className="h-3 w-3" />
                      复制
                    </button>
                    <button
                      onClick={() => {
                        onApply(card.content);
                        onClose();
                      }}
                      disabled={!card.content}
                      className="flex items-center gap-1 rounded bg-brand px-2 py-1 text-xs text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                      采纳
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">模型</span>
            <button className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
              哈基米 1.1
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              isGenerating ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'bg-brand text-white hover:bg-brand-dark'
            }`}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? '生成中...' : 'AI生成'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function FontSettingsModal({ isOpen, onClose, settings, onChange }: {
  isOpen: boolean;
  onClose: () => void;
  settings: FontSettings;
  onChange: (settings: FontSettings) => void;
}) {
  const [local, setLocal] = useState(settings);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocal(settings), [settings]);
  if (!isOpen) return null;

  const update = (patch: Partial<FontSettings>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
    writeJson(FONT_SETTINGS_KEY, next);
  };

  return (
    <ModalShell title="字体设置" icon={<Type className="h-4 w-4 text-brand" />} onClose={onClose} widthClass="w-[420px]">
      <div className="space-y-5 p-5">
        <section>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-700"><Type className="h-3.5 w-3.5 text-gray-400" />字体</div>
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
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-700"><Palette className="h-3.5 w-3.5 text-gray-400" />字体颜色</div>
          <div className="flex flex-wrap items-center gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => update({ fontColor: color })}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${local.fontColor === color ? 'scale-110 border-brand' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input ref={colorInputRef} type="color" value={local.fontColor} onChange={(event) => update({ fontColor: event.target.value })} className="h-7 w-7 cursor-pointer overflow-hidden rounded-full border-0 p-0" />
          </div>
        </section>
        <SliderSetting label="字号" value={`${local.fontSize}px`} icon={<Type className="h-3.5 w-3.5 text-gray-400" />}>
          <button onClick={() => update({ fontSize: Math.max(12, local.fontSize - 1) })} className="h-7 w-7 rounded border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">-</button>
          <input type="range" min={12} max={30} value={local.fontSize} onChange={(event) => update({ fontSize: Number(event.target.value) })} className="flex-1" />
          <button onClick={() => update({ fontSize: Math.min(30, local.fontSize + 1) })} className="h-7 w-7 rounded border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">+</button>
        </SliderSetting>
        <SliderSetting label="行高" value={String(local.lineHeight)} icon={<Rows3 className="h-3.5 w-3.5 text-gray-400" />}>
          <button onClick={() => update({ lineHeight: Math.max(1, Number((local.lineHeight - 0.1).toFixed(1))) })} className="h-7 w-7 rounded border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">-</button>
          <input type="range" min={10} max={24} value={Math.round(local.lineHeight * 10)} onChange={(event) => update({ lineHeight: Number(event.target.value) / 10 })} className="flex-1" />
          <button onClick={() => update({ lineHeight: Math.min(2.4, Number((local.lineHeight + 0.1).toFixed(1))) })} className="h-7 w-7 rounded border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">+</button>
        </SliderSetting>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
          <p className="mb-2 text-xs text-gray-400">预览</p>
          <div className="rounded border border-gray-200 bg-white p-3" style={{ fontFamily: local.fontFamily, color: local.fontColor, fontSize: Math.min(local.fontSize, 16), lineHeight: local.lineHeight }}>
            这是一段预览文字，用于查看字体设置效果。
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
        <button onClick={() => update(defaultFontSettings)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">恢复默认</button>
        <button onClick={onClose} className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark">确定</button>
      </div>
    </ModalShell>
  );
}

function SliderSetting({ label, value, icon, children }: { label: string; value: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700">{icon}{label}</div>
        <span className="text-xs text-gray-400">{value}</span>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </section>
  );
}

export function SmartFormatModal({ isOpen, onClose, currentText, settings, onApply }: {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  settings: FormatOptions;
  onApply: (text: string, settings: FormatOptions) => void;
}) {
  const [options, setOptions] = useState(settings);
  const [preview, setPreview] = useState('');

  useEffect(() => setOptions(settings), [settings]);
  if (!isOpen) return null;

  const apply = () => {
    const formatted = applyFormat(currentText, options);
    writeJson(SMART_FORMAT_KEY, options);
    onApply(formatted, options);
    onClose();
  };

  return (
    <ModalShell title="智能排版" icon={<Wand2 className="h-5 w-5 text-brand" />} onClose={onClose} widthClass="w-[560px]">
      <div className="space-y-1 p-5">
        <ToggleRow label="首行缩进" desc="每段开头自动添加两个全角空格" checked={options.indent} onChange={(value) => setOptions((prev) => ({ ...prev, indent: value }))} />
        <ToggleRow label="合并空段落" desc="合并空行并整理成连续正文段落" checked={options.mergeParagraphs} onChange={(value) => setOptions((prev) => ({ ...prev, mergeParagraphs: value }))} />
        <ToggleRow label="智能断句" desc="按句子数量自动换行" checked={options.smartBreak} onChange={(value) => setOptions((prev) => ({ ...prev, smartBreak: value }))} />
        {options.smartBreak && (
          <div className="mb-2 ml-4 flex items-center gap-3">
            <span className="text-sm text-gray-500">每</span>
            <input type="number" min={1} max={10} value={options.sentencesPerLine} onChange={(event) => setOptions((prev) => ({ ...prev, sentencesPerLine: Math.max(1, Number(event.target.value)) }))} className="w-14 rounded border border-gray-200 px-2 py-1 text-center text-sm outline-none focus:border-brand" />
            <span className="text-sm text-gray-500">句为一行</span>
          </div>
        )}
        {preview && (
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="mb-2 text-xs text-gray-400">预览</p>
            <pre className="max-h-[120px] overflow-y-auto whitespace-pre-wrap text-xs text-gray-600">{preview}</pre>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <button onClick={() => { setOptions(defaultFormatOptions); setPreview(''); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <RotateCcw className="h-4 w-4" />恢复默认
        </button>
        <div className="flex gap-2">
          <button onClick={() => setPreview(applyFormat(currentText, options))} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">预览效果</button>
          <button onClick={apply} className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            <Wand2 className="h-4 w-4" />立即智能排版
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-gray-400">{desc}</p>}
      </div>
      <Switch checked={checked} onClick={() => onChange(!checked)} />
    </div>
  );
}

export function Switch({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-2 py-1.5" title={checked ? '已启用，点击关闭' : '未启用，点击开启'}>
      <div className={`relative h-4 w-7 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
      </div>
    </button>
  );
}

export function HighFreqModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [words, setWords] = useState<string[]>(getStoredHighFreqWords);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (isOpen) setWords(getStoredHighFreqWords());
  }, [isOpen]);

  if (!isOpen) return null;

  const addWords = () => {
    const nextWords = input.split(/[,，\n]+/).map((word) => word.trim()).filter((word) => word && !words.includes(word));
    if (nextWords.length) setWords((prev) => [...prev, ...nextWords]);
    setInput('');
  };

  return (
    <ModalShell title="高频词设置" icon={<BarChart3 className="h-4 w-4 text-brand" />} onClose={onClose} widthClass="w-[480px]">
      <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5">
        <div>
          <p className="mb-2 text-sm text-gray-700">添加需要高亮的高频词</p>
          <div className="mb-3 min-h-[60px] rounded-md border border-gray-200 bg-white p-3">
            {words.length === 0 ? (
              <p className="py-2 text-center text-sm text-gray-400">暂无高频词，请在下方添加</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {words.map((word, index) => (
                  <span key={`${word}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {word}
                    <button onClick={() => setWords((prev) => prev.filter((_, itemIndex) => itemIndex !== index))} className="text-gray-400 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addWords(); }} placeholder="请输入高频词" className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
            <button onClick={addWords} className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900">添加</button>
          </div>
          <p className="mt-3 text-xs text-gray-400">用逗号或换行分隔多个词。</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
        <button onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
        <button onClick={() => { writeJson(HIGH_FREQ_WORDS_KEY, words); writeJson(LEGACY_HIGH_FREQ_WORDS_KEY, words); window.dispatchEvent(new CustomEvent('xinyuexia_high_freq_updated')); onClose(); }} className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900">保存</button>
      </div>
    </ModalShell>
  );
}

export function HighFreqToggle() {
  const [enabled, setEnabled] = useState(isHighFreqEnabled);

  useEffect(() => {
    const sync = () => setEnabled(isHighFreqEnabled());
    window.addEventListener('xinyuexia_high_freq_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('xinyuexia_high_freq_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setHighFreqEnabled(next);
    window.dispatchEvent(new CustomEvent('xinyuexia_high_freq_updated'));
  };
  return <Switch checked={enabled} onClick={toggle} />;
}

export function HighlightOverlay({ content, fontSettings, scrollTop = 0 }: { content: string; fontSettings: FontSettings; scrollTop?: number }) {
  const [words, setWords] = useState<string[]>(getStoredHighFreqWords);
  const [enabled, setEnabled] = useState(isHighFreqEnabled);

  useEffect(() => {
    const sync = () => {
      setWords(getStoredHighFreqWords());
      setEnabled(isHighFreqEnabled());
    };
    window.addEventListener('xinyuexia_high_freq_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('xinyuexia_high_freq_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!enabled || words.length === 0 || !content) return null;
  const escaped = [...words]
    .sort((a, b) => b.length - a.length)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const wordSet = new Set(words);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden whitespace-pre-wrap break-words px-6 pb-6 pt-2 text-transparent"
      style={{
        fontFamily: fontSettings.fontFamily,
        fontSize: `${fontSettings.fontSize}px`,
        lineHeight: fontSettings.lineHeight,
        transform: `translateY(-${scrollTop}px)`,
      }}
    >
      {content.split('\n').map((line, lineIndex) => {
        const parts = line.split(regex);
        return (
          <span key={lineIndex}>
            {parts.map((part, partIndex) => wordSet.has(part)
              ? <span key={partIndex} className="rounded-sm bg-yellow-300/90 shadow-[0_0_0_1px_rgba(234,179,8,0.35)] text-transparent">{part}</span>
              : <span key={partIndex}>{part}</span>)}
            {lineIndex < content.split('\n').length - 1 ? '\n' : null}
          </span>
        );
      })}
    </div>
  );
}

export function HistoryModal({ isOpen, onClose, chapterId, onRestore }: {
  isOpen: boolean;
  onClose: () => void;
  chapterId: number;
  onRestore: (content: string) => void;
}) {
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([]);
  useEffect(() => {
    if (isOpen) setSnapshots(loadSnapshots()[String(chapterId)] ?? []);
  }, [chapterId, isOpen]);
  if (!isOpen) return null;

  return (
    <ModalShell title="历史版本" icon={<RotateCcw className="h-4 w-4 text-brand" />} onClose={onClose} widthClass="w-[480px]">
      <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs leading-5 text-gray-600">
        每 5 分钟自动保存一次历史版本，最多保留 20 个。
      </div>
      <div className="max-h-[520px] space-y-2 overflow-y-auto p-4">
        {snapshots.length === 0 ? (
          <div className="py-12 text-center">
            <RotateCcw className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">暂无历史快照</p>
          </div>
        ) : [...snapshots].reverse().map((snapshot) => (
          <div key={snapshot.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm text-gray-700">{snapshot.timestamp}</span>
                <span className="text-xs text-gray-400">{snapshot.wordCount}字</span>
              </div>
              <p className="truncate text-xs text-gray-400">{snapshot.content.slice(0, 60)}</p>
            </div>
            <button onClick={() => { onRestore(snapshot.content); onClose(); }} className="ml-3 shrink-0 rounded-md border border-brand px-3 py-1.5 text-xs text-brand hover:bg-brand-light">
              恢复
            </button>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

export function TitleOptimizeModal({ isOpen, onClose, currentChapterSerial, currentContent, onApply }: {
  isOpen: boolean;
  onClose: () => void;
  currentChapterSerial: number;
  currentContent: string;
  onApply: (title: string) => void;
}) {
  const [candidateCount, setCandidateCount] = useState(10);
  const [platform, setPlatform] = useState('番茄');
  const [maxLength, setMaxLength] = useState(16);
  const [titles, setTitles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  if (!isOpen) return null;

  const generate = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      const seed = currentContent.replace(/\s/g, '').slice(0, 18) || '本章剧情';
      setTitles([
        `第${currentChapterSerial}章 ${seed}暗潮初起`,
        `第${currentChapterSerial}章 危机逼近，真相浮现`,
        `第${currentChapterSerial}章 反转将至`,
        `第${currentChapterSerial}章 旧局崩塌`,
        `第${currentChapterSerial}章 他终于出手`,
        `第${currentChapterSerial}章 所有人都低估了他`,
        `第${currentChapterSerial}章 一步错，满盘惊`,
        `第${currentChapterSerial}章 隐藏底牌曝光`,
        `第${currentChapterSerial}章 局势彻底失控`,
        `第${currentChapterSerial}章 新的交易`,
      ].map((title) => title.slice(0, maxLength + 4)).slice(0, candidateCount));
      setIsGenerating(false);
    }, 600);
  };

  return (
    <ModalShell title="AI 标题优化" icon={<Sparkles className="h-4 w-4 text-brand" />} onClose={onClose} widthClass="w-[520px]">
      <div className="max-h-[640px] space-y-4 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-gray-500">
            发布平台
            <input value={platform} onChange={(event) => setPlatform(event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <label className="text-xs text-gray-500">
            标题字数上限
            <input type="number" min={1} max={50} value={maxLength} onChange={(event) => setMaxLength(Number(event.target.value))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">第{currentChapterSerial}章 · {platform}</span>
            <label className="flex items-center gap-2 text-xs text-gray-500">
              候选数
              <input type="number" min={1} max={20} value={candidateCount} onChange={(event) => setCandidateCount(Number(event.target.value))} className="w-16 rounded-md border border-gray-200 px-2 py-1 text-center text-sm" />
            </label>
          </div>
          <button onClick={generate} disabled={isGenerating} className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-sm text-white hover:bg-brand-dark disabled:bg-gray-300">
            <Sparkles className="h-4 w-4" />{isGenerating ? '生成中...' : '生成标题'}
          </button>
        </div>
        {titles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">生成结果</p>
            {titles.map((title, index) => (
              <button key={`${title}-${index}`} onClick={() => { onApply(title.replace(/^第\d+章\s*/, '')); onClose(); }} className="flex w-full items-center justify-between rounded-lg border border-gray-100 p-3 text-left hover:border-brand hover:bg-brand-light">
                <span className="text-sm text-gray-700">{index + 1}. {title}</span>
                <span className="text-xs text-gray-400">{title.length}字</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

export function ChapterAssociateModal({ isOpen, onClose, chapters, onAssociate }: {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterAssociateItem[];
  onAssociate: (ids: number[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    const stored = readJson<number[]>(ASSOCIATED_CHAPTERS_KEY, []);
    setSelectedIds(new Set(stored.filter((id) => chapters.some((chapter) => chapter.id === id))));
  }, [chapters, isOpen]);

  if (!isOpen) return null;
  const selectedChapters = chapters.filter((chapter) => selectedIds.has(chapter.id));
  const selectedCount = selectedIds.size;
  const selectedWords = selectedChapters.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0);
  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectRecent = (count: number) => setSelectedIds(new Set(chapters.slice(-count).map((chapter) => chapter.id)));

  return (
    <ModalShell title="关联章节" icon={<Link2 className="h-4 w-4 text-brand" />} onClose={onClose} widthClass="w-[420px]">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-2">
        <div className="flex flex-wrap gap-1.5">
          {[5, 10, 50, 100].map((count) => (
            <button key={count} onClick={() => selectRecent(count)} className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-50">
              近{count}章
            </button>
          ))}
          <button onClick={() => setSelectedIds(new Set(chapters.map((chapter) => chapter.id)))} className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-50">全选</button>
          <button onClick={() => setSelectedIds(new Set())} className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-50">清空</button>
        </div>
        <div className="ml-2 shrink-0 text-[10px] text-gray-500"><span className="font-bold text-brand">{selectedCount}</span> 章</div>
      </div>
      <div className="max-h-[320px] overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-5 gap-2">
          {chapters.map((chapter) => {
            const isSelected = selectedIds.has(chapter.id);
            return (
              <button key={chapter.id} onClick={() => toggle(chapter.id)} className={`rounded border px-1 py-1.5 text-[11px] transition-colors ${isSelected ? 'border-brand bg-brand-light font-medium text-brand-dark' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                第{chapter.serialNumber}章
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-[10px] text-gray-500">已选 <span className="font-bold text-brand">{selectedCount}</span> 章 · <span className="font-bold text-brand">{selectedWords.toLocaleString()}</span> 字</span>
        <div className="flex gap-2">
          <button onClick={onClose} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">取消</button>
          <button
            onClick={() => {
              const ids = Array.from(selectedIds);
              writeJson(ASSOCIATED_CHAPTERS_KEY, ids);
              onAssociate(ids);
              onClose();
            }}
            disabled={selectedCount === 0}
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            确认关联
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
