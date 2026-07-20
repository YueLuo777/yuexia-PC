import { Folder, FolderOpen } from 'lucide-react';
import type { ReactNode } from 'react';

import { STATUS_PROMPT_CATEGORY } from '@/features/prompts/hooks/usePrompts';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type { Chapter } from '@/features/workbench/model/workbenchTypes';
import {
  ChapterNumberButton,
  CHAPTER_NUMBER_GRID_STYLE as WORKBENCH_CHAPTER_NUMBER_GRID_STYLE,
} from '@/shared/ui/ChapterNumberButton';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { WordCountText } from '@/shared/ui/WordCountText';

import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
} from './chapterEditorLayout';
import { countCompactWords, getStatusTargetLabel } from './chapterEditorPresentation';

type StatusDirectoryGroup = {
  id: number;
  name: string;
  chapters: Chapter[];
};

type StatusSelectOption = {
  id: string;
  name: string;
};

interface ChapterStatusPanelProps {
  embedded: boolean;
  onClose: () => void;
  statusPageLeftWidth: number;
  statusPageRightWidth: number;
  statusLeftResizeHandle: ReactNode;
  statusRightResizeHandle: ReactNode;
  chapterDirectoryGroups: StatusDirectoryGroup[];
  expandedStatusVolumeIds: Set<number>;
  toggleStatusDirectoryVolume: (volumeId: number) => void;
  activeStatusChapter: Chapter | null;
  statusUpdatedChapterIds: Set<number>;
  selectStatusChapter: (chapterId: number) => void;
  statusPreviewChapters: Chapter[];
  statusPreviewWordCount: number;
  statusPreviewText: string;
  reviewModelId: string;
  activeStatusPromptId: string;
  reviewModels: StatusSelectOption[];
  statusPrompts: StatusSelectOption[];
  setReviewModelIdWithStorage: (modelId: string) => void;
  setStatusPromptId: (promptId: string) => void;
  onManageModels: () => void;
  onManagePrompts: () => void;
  selectedStatusTargets: WorkbenchLibraryEntry[];
  statusTargetEntries: WorkbenchLibraryEntry[];
  statusTargetIds: Set<string>;
  toggleStatusTarget: (entry: WorkbenchLibraryEntry) => void;
  statusDraft: string;
  setStatusDraft: (value: string) => void;
  saveStatusUpdate: () => void;
}

export function ChapterStatusPanel({
  embedded,
  onClose,
  statusPageLeftWidth,
  statusPageRightWidth,
  statusLeftResizeHandle,
  statusRightResizeHandle,
  chapterDirectoryGroups,
  expandedStatusVolumeIds,
  toggleStatusDirectoryVolume,
  activeStatusChapter,
  statusUpdatedChapterIds,
  selectStatusChapter,
  statusPreviewChapters,
  statusPreviewWordCount,
  statusPreviewText,
  reviewModelId,
  activeStatusPromptId,
  reviewModels,
  statusPrompts,
  setReviewModelIdWithStorage,
  setStatusPromptId,
  onManageModels,
  onManagePrompts,
  selectedStatusTargets,
  statusTargetEntries,
  statusTargetIds,
  toggleStatusTarget,
  statusDraft,
  setStatusDraft,
  saveStatusUpdate,
}: ChapterStatusPanelProps) {
  return (
    <div
      className={
        embedded
          ? 'flex h-full min-h-0 bg-white'
          : 'fixed inset-0 z-[280] flex items-center justify-center bg-black/35 p-5'
      }
      onClick={() => {
        if (!embedded) onClose();
      }}
    >
      <section
        className={
          embedded
            ? 'flex h-full min-h-0 w-full flex-col overflow-hidden bg-white'
            : 'flex h-[78vh] max-h-[820px] w-[min(1280px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'
        }
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className={`${embedded ? 'hidden' : 'flex'} h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5`}
        >
          <div>
            <h2 className="text-lg font-black text-slate-900">更新状态</h2>
            <p className="mt-0.5 text-xs font-bold text-slate-400">
              阅读前文后，把角色、宝物、势力的最新状态写入设定卡片，并记录更新到第几章。
            </p>
          </div>
          {!embedded && (
            <button
              type="button"
              onClick={() => onClose()}
              className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              关闭
            </button>
          )}
        </header>
        <div
          className="grid min-h-0 flex-1 bg-slate-50"
          style={{
            gridTemplateColumns: `${statusPageLeftWidth}px 0px minmax(0,1fr) 0px ${statusPageRightWidth}px`,
          }}
        >
          <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">
            <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
              {chapterDirectoryGroups.map((group) => {
                const expanded = expandedStatusVolumeIds.has(group.id);
                const GroupFolderIcon = expanded ? FolderOpen : Folder;
                return (
                  <div key={group.id}>
                    <button
                      type="button"
                      onClick={() => toggleStatusDirectoryVolume(group.id)}
                      className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                      aria-expanded={expanded}
                    >
                      <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                      <span className="min-w-0 flex-1 truncate leading-none">{group.name}</span>
                      <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.chapters.length}章</span>
                    </button>
                    {expanded && (
                      <div
                        className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"
                        style={WORKBENCH_CHAPTER_NUMBER_GRID_STYLE}
                      >
                        {group.chapters.map((item) => {
                          const selected = activeStatusChapter?.id === item.id;
                          const updated = statusUpdatedChapterIds.has(item.id);
                          return (
                            <ChapterNumberButton
                              key={item.id}
                              onClick={() => selectStatusChapter(item.id)}
                              title={`${updated ? '已更新状态到' : '未更新状态到'}第${item.serialNumber}章 ${item.title || ''}`}
                              selected={selected}
                              state={updated ? 'used' : 'empty'}
                            >
                              {item.serialNumber}
                            </ChapterNumberButton>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
          {statusLeftResizeHandle}
          <main className="min-h-0 p-4">
            <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-900">
                    {activeStatusChapter
                      ? `截至第${activeStatusChapter.serialNumber}章：${activeStatusChapter.title || '未命名章节'}`
                      : '暂无章节'}
                  </h3>
                  <p className="mt-0.5 text-xs font-bold text-slate-400">
                    前文预览 · {statusPreviewChapters.length}章 ·{' '}
                    <WordCountText value={statusPreviewWordCount} compact />
                  </p>
                </div>
              </div>
              <textarea
                readOnly
                value={statusPreviewText}
                placeholder="这里会显示从第一章到所选章节的正文，方便判断状态变化。"
                className="editor-scrollbar min-h-0 flex-1 resize-none border-0 bg-white p-5 text-sm leading-7 text-slate-700 outline-none"
              />
            </div>
          </main>
          {statusRightResizeHandle}
          <aside className="flex min-h-0 flex-col border-l border-slate-100 bg-gray-50 px-4 pb-4 pt-2">
            <div className="shrink-0">
              <CombinedAiConfigSelect
                modelValue={reviewModelId}
                promptValue={activeStatusPromptId}
                modelOptions={
                  reviewModels.length === 0
                    ? [{ value: '', label: '暂无可用模型', disabled: true }]
                    : reviewModels.map((model) => ({ value: model.id, label: model.name }))
                }
                promptOptions={
                  statusPrompts.length === 0
                    ? [{ value: '', label: `暂无${STATUS_PROMPT_CATEGORY}提示词`, disabled: true }]
                    : statusPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))
                }
                onModelChange={setReviewModelIdWithStorage}
                onPromptChange={setStatusPromptId}
                onModelManage={() => onManageModels()}
                onPromptManage={() => onManagePrompts()}
              />
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="text-base font-black text-slate-900">状态目标</h3>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-black text-[#08AACE]">
                已选 {selectedStatusTargets.length}
              </span>
            </div>
            <div className="editor-scrollbar mt-3 max-h-[210px] shrink-0 space-y-2 overflow-y-auto pr-1">
              {statusTargetEntries.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-300">
                  暂无角色、宝物或势力卡片
                </div>
              ) : (
                statusTargetEntries.map((entry) => {
                  const selected = statusTargetIds.has(entry.id);
                  return (
                    <label
                      key={entry.id}
                      className={`block cursor-pointer rounded-xl border p-3 transition-colors ${
                        selected
                          ? 'border-[#08AACE] bg-sky-50/70'
                          : 'border-slate-100 bg-slate-50 hover:border-sky-100 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleStatusTarget(entry)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#08AACE] focus:ring-[#08AACE]/20"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-black text-slate-900">{entry.title}</div>
                          <div className="mt-1 truncate text-[11px] font-bold text-slate-400">
                            {getStatusTargetLabel(entry)}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <div
              className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count mt-4 min-h-0 flex-1 ${statusDraft.trim() ? 'xy-has-value' : ''}`}
            >
              <textarea
                value={statusDraft}
                onChange={(event) => setStatusDraft(event.target.value)}
                placeholder="例如：主角已从高中生变为大学生，当前就读玄都大学，心态更成熟，但仍隐藏真实实力。"
                className="editor-scrollbar text-sm leading-6 text-slate-700 outline-none"
              />
              <label>新的状态</label>
              <span className="xy-floating-count">
                <WordCountText value={countCompactWords(statusDraft)} />
              </span>
            </div>
            <div className="mt-3 text-xs font-bold leading-5 text-slate-500">
              保存规则：同一卡片同一章节只保留一条“更新到第 X 章”的状态记录；重复保存会覆盖旧状态，不会追加重复内容。
            </div>
            <button
              type="button"
              onClick={saveStatusUpdate}
              disabled={!activeStatusChapter || selectedStatusTargets.length === 0 || !statusDraft.trim()}
              className="mt-3 h-11 rounded-xl bg-[#08AACE] text-sm font-black text-white shadow-sm transition-colors hover:bg-[#0695B5] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              保存状态到第{activeStatusChapter?.serialNumber ?? '-'}章
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
