import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useDraggableModal } from '@/shared/hooks/useDraggableModal';

import { ChapterReviewAiPanel } from './ChapterReviewAiPanel';
import { ChapterReviewDirectory } from './ChapterReviewDirectory';
import { ChapterReviewPreview } from './ChapterReviewPreview';
import type { ChapterEditorEmbeddedMode } from './chapterEditorReviewConfig';

type ReviewModalDraggable = ReturnType<typeof useDraggableModal>;

interface ChapterReviewPanelProps {
  embeddedMode?: ChapterEditorEmbeddedMode;
  isEmbeddedReviewMode: boolean;
  portalTarget: Element;
  activeReviewModeTitle: string;
  onClose: () => void;
  reviewModalDraggable: ReviewModalDraggable;
  reviewPageLeftWidth: number;
  reviewPageRightWidth: number;
  reviewLeftResizeHandle: ReactNode;
  reviewRightResizeHandle: ReactNode;
  directoryProps: ComponentProps<typeof ChapterReviewDirectory>;
  previewProps: ComponentProps<typeof ChapterReviewPreview>;
  aiPanelProps: ComponentProps<typeof ChapterReviewAiPanel>;
}

export function ChapterReviewPanel({
  embeddedMode,
  isEmbeddedReviewMode,
  portalTarget,
  activeReviewModeTitle,
  onClose,
  reviewModalDraggable,
  reviewPageLeftWidth,
  reviewPageRightWidth,
  reviewLeftResizeHandle,
  reviewRightResizeHandle,
  directoryProps,
  previewProps,
  aiPanelProps,
}: ChapterReviewPanelProps) {
  return createPortal(
    <div
      className={
        isEmbeddedReviewMode
          ? 'flex h-full min-h-0 bg-white'
          : 'fixed inset-0 z-[280] flex items-center justify-center bg-black/35 p-5'
      }
      style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
      onClick={() => {
        if (!embeddedMode) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        data-global-modal-static="true"
        style={
          {
            ...(embeddedMode ? {} : reviewModalDraggable.style),
            WebkitAppRegion: 'no-drag',
          } as CSSProperties
        }
        className={
          isEmbeddedReviewMode
            ? 'relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white'
            : 'relative flex h-[min(720px,82vh)] w-[min(1180px,92vw)] max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'
        }
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className={`${embeddedMode ? 'hidden' : 'flex'} h-14 shrink-0 items-center justify-between border-b border-slate-100 px-5 ${embeddedMode ? '' : 'cursor-move'}`}
          {...(embeddedMode ? {} : reviewModalDraggable.dragHandleProps)}
          style={
            {
              touchAction: embeddedMode ? undefined : 'none',
              WebkitAppRegion: 'no-drag',
            } as CSSProperties
          }
        >
          <div>
            <h2 className="text-lg font-black text-slate-900">{activeReviewModeTitle}</h2>
            <p className="mt-0.5 text-xs font-bold text-slate-400">
              左侧选择章节，中间预览正文，右侧配置 AI {activeReviewModeTitle}参数。
            </p>
          </div>
          <button
            type="button"
            data-no-modal-drag="true"
            onClick={onClose}
            className={`${embeddedMode ? 'hidden' : ''} rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700`}
          >
            关闭
          </button>
        </header>
        <div
          className={`grid min-h-0 flex-1 bg-slate-50 ${embeddedMode ? 'pb-3' : ''}`}
          style={{
            gridTemplateColumns: `${reviewPageLeftWidth}px 0px minmax(0,1fr) 0px ${reviewPageRightWidth}px`,
          }}
        >
          <ChapterReviewDirectory {...directoryProps} />
          {reviewLeftResizeHandle}
          <ChapterReviewPreview {...previewProps} />
          {reviewRightResizeHandle}
          <ChapterReviewAiPanel {...aiPanelProps} />
        </div>
        <div
          data-no-modal-drag="true"
          {...reviewModalDraggable.getResizeHandleProps('top')}
          className={`${embeddedMode ? 'hidden' : ''} absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize`}
        />
        <div
          data-no-modal-drag="true"
          {...reviewModalDraggable.getResizeHandleProps('bottom')}
          className={`${embeddedMode ? 'hidden' : ''} absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize`}
        />
        <div
          data-no-modal-drag="true"
          {...reviewModalDraggable.getResizeHandleProps('left')}
          className={`${embeddedMode ? 'hidden' : ''} absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize`}
        />
        <div
          data-no-modal-drag="true"
          {...reviewModalDraggable.getResizeHandleProps('right')}
          className={`${embeddedMode ? 'hidden' : ''} absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize`}
        />
        <div
          data-no-modal-drag="true"
          {...reviewModalDraggable.resizeHandleProps}
          className={`${embeddedMode ? 'hidden' : ''} absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize`}
        >
          <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-gray-300" />
        </div>
      </section>
    </div>,
    portalTarget,
  );
}
