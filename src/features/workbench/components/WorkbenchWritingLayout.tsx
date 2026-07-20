import type { ComponentProps, MouseEventHandler, ReactNode } from 'react';
import { ChapterSidebar } from './ChapterSidebar';
import { PublishedSidebar } from './PublishedSidebar';
import { WorkbenchAIPanel } from './WorkbenchAIPanel';

function ResizeHandle({ onMouseDown, title }: { onMouseDown: MouseEventHandler<HTMLDivElement>; title: string }) {
  return (
    <div
      data-no-modal-drag
      className="group relative z-10 -ml-[3px] -mr-[3px] flex w-[6px] shrink-0 cursor-ew-resize items-stretch justify-center bg-transparent"
      onMouseDown={onMouseDown}
      title={title}
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
export function WorkbenchWritingLayout({
  writing,
  content,
  chapterSidebarProps,
  publishedSidebarProps,
  aiPanelProps,
  showPublished,
  aiPanelWidth,
  onChapterResize,
  onPublishedResize,
  onAiResize,
}: {
  writing: boolean;
  content: ReactNode;
  chapterSidebarProps: ComponentProps<typeof ChapterSidebar>;
  publishedSidebarProps: ComponentProps<typeof PublishedSidebar>;
  aiPanelProps: ComponentProps<typeof WorkbenchAIPanel>;
  showPublished: boolean;
  aiPanelWidth: number;
  onChapterResize: MouseEventHandler<HTMLDivElement>;
  onPublishedResize: MouseEventHandler<HTMLDivElement>;
  onAiResize: MouseEventHandler<HTMLDivElement>;
}) {
  if (!writing)
    return (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7]">
        <div className="flex min-h-0 flex-1 overflow-hidden bg-white">{content}</div>
      </section>
    );
  return (
    <>
      <ChapterSidebar {...chapterSidebarProps} />
      {showPublished && (
        <>
          <ResizeHandle onMouseDown={onChapterResize} title="拖拽调整未发布栏宽度" />
          <PublishedSidebar {...publishedSidebarProps} />
        </>
      )}
      <ResizeHandle onMouseDown={showPublished ? onPublishedResize : onChapterResize} title="拖拽调整章节栏宽度" />
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7]">
        <div className="flex min-h-0 flex-1 overflow-hidden bg-white">{content}</div>
      </section>
      <ResizeHandle onMouseDown={onAiResize} title="拖拽调整宽度" />
      <aside
        className="relative shrink-0 border-l border-[#e1e5eb] bg-white"
        style={{ width: aiPanelWidth, maxWidth: 'calc(33.333vw / var(--xinyuexia-effective-scale, 1))' }}
      >
        <WorkbenchAIPanel {...aiPanelProps} />
      </aside>
    </>
  );
}
