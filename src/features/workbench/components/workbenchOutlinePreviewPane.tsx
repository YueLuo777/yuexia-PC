import type { MutableRefObject } from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';
import { WordCountText } from '@/shared/ui/WordCountText';

import {
  getDetailOutlinePreviewHeight,
  mergeDetailOutlineStateExpectation,
  splitDetailOutlineStateExpectation,
} from './workbenchDetailOutlineState';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';

interface WorkbenchOutlinePreviewPaneProps {
  isDetailOutlineTab: boolean;
  outlineChapters: Array<{ volume: Volume; chapter: Chapter }>;
  safeOutlineSelectionType: 'chapter' | 'volume';
  selectedOutlineVolume: Volume | null;
  selectedVolumeEntry: WorkbenchLibraryEntry | null | undefined;
  selectedOutlineChapter: { volume: Volume; chapter: Chapter } | null;
  effectiveSelectedOutlineChapterId: number | null;
  detailOutlineFontSize: number;
  activeDetailOutlineScrollId: number | null;
  outlinePreviewRefs: MutableRefObject<Record<number, HTMLElement | null>>;
  getChapterSummaryEntry: (serialNumber: number) => WorkbenchLibraryEntry | null | undefined;
  getOutlineChapterFrameTitle: (volume: Volume, chapter: Chapter) => string;
  getVolumeDisplayIndex: (volumeId: number) => number;
  updateVolumeSummary: (volumeName: string, content: string) => void;
  updateChapterSummary: (serialNumber: number, content: string) => void;
  selectOutlineChapter: (chapterId: number, serialNumber: number) => void;
  handleDetailOutlineTextareaScroll: (chapterId: number) => void;
  onActivateDetailOutlineFont: () => void;
}

export function WorkbenchOutlinePreviewPane({
  isDetailOutlineTab,
  outlineChapters,
  safeOutlineSelectionType,
  selectedOutlineVolume,
  selectedVolumeEntry,
  selectedOutlineChapter,
  effectiveSelectedOutlineChapterId,
  detailOutlineFontSize,
  activeDetailOutlineScrollId,
  outlinePreviewRefs,
  getChapterSummaryEntry,
  getOutlineChapterFrameTitle,
  getVolumeDisplayIndex,
  updateVolumeSummary,
  updateChapterSummary,
  selectOutlineChapter,
  handleDetailOutlineTextareaScroll,
  onActivateDetailOutlineFont,
}: WorkbenchOutlinePreviewPaneProps) {
  if (outlineChapters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
        暂无章节可预览
      </div>
    );
  }

  if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
    return (
      <section className="xy-selected-content-bg rounded-xl border border-[#08AACE] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">{selectedOutlineVolume.name}梗概</h4>
          <span className="shrink-0 text-lg font-bold text-gray-900">{selectedOutlineVolume.chapters.length}章</span>
        </div>
        <textarea
          data-no-modal-drag="true"
          value={selectedVolumeEntry?.content ?? ''}
          onChange={(event) => updateVolumeSummary(selectedOutlineVolume.name, event.target.value)}
          placeholder="这一卷的梗概会显示在这里，内容是该卷下所有章节内容的总结。"
          className="editor-scrollbar h-[460px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
        />
        <div className="mt-2 text-right text-xs font-bold text-gray-400">
          <WordCountText value={countTextWords(selectedVolumeEntry?.content ?? '')} />
        </div>
      </section>
    );
  }

  if (isDetailOutlineTab && selectedOutlineChapter) {
    const { volume, chapter } = selectedOutlineChapter;
    const outlineCardContent = getChapterSummaryEntry(chapter.serialNumber)?.content ?? '';
    const detailOutlineParts = splitDetailOutlineStateExpectation(outlineCardContent);
    const updatePart = (part: 'outline' | 'stateExpectation', value: string) => {
      updateChapterSummary(
        chapter.serialNumber,
        mergeDetailOutlineStateExpectation(
          part === 'outline' ? value : detailOutlineParts.outline,
          part === 'stateExpectation' ? value : detailOutlineParts.stateExpectation,
        ),
      );
    };
    const activate = () => {
      onActivateDetailOutlineFont();
      selectOutlineChapter(chapter.id, chapter.serialNumber);
    };
    return (
      <div
        ref={(element) => {
          outlinePreviewRefs.current[chapter.id] = element;
        }}
        className="flex h-full min-h-0 flex-col gap-4"
      >
        <section
          className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-[0_0_62%] ${detailOutlineParts.outline.trim() ? 'xy-has-value' : ''}`}
        >
          <textarea
            data-no-modal-drag="true"
            value={detailOutlineParts.outline}
            onChange={(event) => updatePart('outline', event.target.value)}
            onFocus={activate}
            onScroll={() => handleDetailOutlineTextareaScroll(chapter.id)}
            placeholder="该章章纲会显示在这里，可由 AI 根据章节内容生成。"
            className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`}
            style={{ height: '100%', overflowY: 'auto', fontSize: detailOutlineFontSize }}
          />
          <label className="xy-floating-title-count xy-detail-outline-title-count">
            <span className="xy-floating-title-text xy-detail-outline-heading-title">
              {getOutlineChapterFrameTitle(volume, chapter)}
            </span>
          </label>
          <span className="xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate absolute right-9 top-0 z-20 max-w-[44%] -translate-y-1/2 truncate text-sm font-black leading-5 text-slate-950">
            {`第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`}
          </span>
          <span className="xy-floating-count">
            <WordCountText value={countTextWords(detailOutlineParts.outline)} />
          </span>
        </section>
        <section
          className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${detailOutlineParts.stateExpectation.trim() ? 'xy-has-value' : ''}`}
        >
          <textarea
            data-no-modal-drag="true"
            value={detailOutlineParts.stateExpectation}
            onChange={(event) => updatePart('stateExpectation', event.target.value)}
            onFocus={activate}
            placeholder="按人物状态、道具状态、势力状态、关系状态、线索/信息记录本章预计变化。"
            className="w-full resize-none text-sm leading-6 text-gray-700 outline-none scrollbar-scroll-only"
            style={{ height: '100%', overflowY: 'auto', fontSize: detailOutlineFontSize }}
          />
          <label className="xy-floating-title-count xy-detail-outline-title-count">
            <span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>
          </label>
          <span className="xy-floating-count">
            <WordCountText value={countTextWords(detailOutlineParts.stateExpectation)} />
          </span>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {outlineChapters.map(({ volume, chapter }) => {
        const outlineCardContent = getChapterSummaryEntry(chapter.serialNumber)?.content ?? '';
        const selected = effectiveSelectedOutlineChapterId === chapter.id;
        return (
          <section
            key={chapter.id}
            ref={(element) => {
              outlinePreviewRefs.current[chapter.id] = element;
            }}
            className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-with-bottom-count ${selected ? 'xy-outline-selected xy-has-value' : outlineCardContent.trim() ? 'xy-has-value' : ''}`}
          >
            <textarea
              data-no-modal-drag="true"
              value={outlineCardContent}
              onChange={(event) => updateChapterSummary(chapter.serialNumber, event.target.value)}
              onFocus={() => {
                if (isDetailOutlineTab) onActivateDetailOutlineFont();
                selectOutlineChapter(chapter.id, chapter.serialNumber);
              }}
              onScroll={isDetailOutlineTab ? () => handleDetailOutlineTextareaScroll(chapter.id) : undefined}
              placeholder={
                isDetailOutlineTab
                  ? '该章章纲会显示在这里，可由 AI 根据章节内容生成。'
                  : '该章梗概会显示在这里，可由 AI 根据章节内容生成。'
              }
              className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none ${
                isDetailOutlineTab
                  ? `scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`
                  : 'editor-scrollbar h-36'
              }`}
              style={
                isDetailOutlineTab
                  ? { height: getDetailOutlinePreviewHeight(), overflowY: 'auto', fontSize: detailOutlineFontSize }
                  : undefined
              }
            />
            <label className={isDetailOutlineTab ? 'xy-floating-title-count xy-detail-outline-title-count' : undefined}>
              <span
                className={isDetailOutlineTab ? 'xy-floating-title-text xy-detail-outline-heading-title' : undefined}
              >
                {getOutlineChapterFrameTitle(volume, chapter)}
              </span>
            </label>
            <span className="xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate absolute right-9 top-0 z-20 max-w-[44%] -translate-y-1/2 truncate text-sm font-black leading-5 text-slate-950">
              {isDetailOutlineTab ? (
                `第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`
              ) : (
                <>
                  第{chapter.serialNumber}章 {chapter.title.trim() || '未命名章节'}{' '}
                  <WordCountText value={chapter.wordCount} compact />
                </>
              )}
            </span>
            {isDetailOutlineTab && (
              <span className="xy-floating-count">
                <WordCountText value={countTextWords(outlineCardContent)} />
              </span>
            )}
          </section>
        );
      })}
    </div>
  );
}
