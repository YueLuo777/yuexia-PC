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

export function AIGenerateModal({
  isOpen,
  onClose,
  mode,
  currentChapterSerial,
  currentContent,
  onApply,
}: {
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
    setCards(
      Array.from({ length: Number(chapterCount) }, (_, index) => ({
        id: index + 1,
        status: 'thinking',
        content: '',
      })),
    );
    window.setTimeout(() => {
      setCards(
        Array.from({ length: Number(chapterCount) }, (_, index) => ({
          id: index + 1,
          status: 'done',
          content: makeDraft(index + 1),
        })),
      );
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
                  <CapsuleSelect
                    value={chapterCount}
                    onChange={setChapterCount}
                    buttonClassName="h-10 rounded-xl px-3 text-sm"
                    options={[1, 2, 3, 4, 5].map((option) => ({ value: String(option), label: String(option) }))}
                  />
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
                  <button className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-white">
                    填入预设
                  </button>
                  <button className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:text-gray-700">
                    <BookOpen className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:text-gray-700">
                    <AtSign className="h-3.5 w-3.5" />
                  </button>
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
                <label className="mb-1.5 block text-sm text-gray-600">
                  表情包和颜文字开关<span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <CapsuleSelect
                    value={emojiSwitch}
                    onChange={setEmojiSwitch}
                    buttonClassName="h-10 rounded-xl px-3 text-sm"
                    options={[
                      { value: '关闭', label: '关闭' },
                      { value: '开启', label: '开启' },
                    ]}
                  />
                </div>
              </section>
            )}
          </div>

          <div className="flex w-[340px] flex-col border-l border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-xs text-gray-500">工具生成内容</span>
              <span className="text-xs text-gray-400">
                当前{' '}
                <WordCountText value={cards.reduce((sum, card) => sum + card.content.replace(/\s/g, '').length, 0)} />
              </span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cards.length === 0 ? (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <p className="text-sm leading-6 text-gray-400">尚未生成内容，请先完成提示词审批并开始生成。</p>
                </div>
              ) : (
                cards.map((card) => (
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
                      <span className="text-xs text-gray-400">
                        字数: <WordCountText value={card.content.replace(/\s/g, '').length} />
                      </span>
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
                ))
              )}
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
