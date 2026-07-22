import { FileText, FolderOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  WORKBENCH_FOLDER_GROUP_BUTTON_CLASS,
  WORKBENCH_FOLDER_GROUP_COUNT_CLASS,
  WORKBENCH_FOLDER_GROUP_ICON_CLASS,
} from '@/features/workbench/components/chapterEditorLayout';
import { ChapterNumberButton, CHAPTER_NUMBER_GRID_STYLE } from '@/shared/ui/ChapterNumberButton';
import { WordCountText } from '@/shared/ui/WordCountText';

import {
  STATUS_TEST_CHAPTERS,
  STATUS_TEST_CHANGES,
  STATUS_TEST_PARAGRAPHS,
  type StatusChangeDecision,
  type StatusTestChange,
} from './postAuditStatusUpdateTestData';

export function StatusChapterNavigation() {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-gray-50 px-1 py-2">
      <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
        <div>
          <button type="button" className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS} aria-expanded="true">
            <FolderOpen className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
            <span className="min-w-0 flex-1 truncate leading-none">第一卷 · 黑石风云</span>
            <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{STATUS_TEST_CHAPTERS.length}章</span>
          </button>
          <div className="mt-1 grid justify-start gap-2 px-1.5 py-1.5" style={CHAPTER_NUMBER_GRID_STYLE}>
            {STATUS_TEST_CHAPTERS.map((chapter) => (
              <ChapterNumberButton
                key={chapter.serial}
                selected={chapter.serial === 12}
                state={chapter.state === '已更新' ? 'used' : 'empty'}
                showAlertDot={chapter.state === '待更新'}
                title={`${chapter.state} 第${chapter.serial}章 ${chapter.title}`}
              >
                {chapter.serial}
              </ChapterNumberButton>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function StatusOriginalColumn({ activeParagraph, onSelectParagraph }: { activeParagraph: number | null; onSelectParagraph: (number: number) => void }) {
  const paragraphRefs = useRef(new Map<number, HTMLParagraphElement>());

  useEffect(() => {
    if (activeParagraph === null) return;
    const paragraph = paragraphRefs.current.get(activeParagraph);
    if (paragraph && typeof paragraph.scrollIntoView === 'function') {
      paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeParagraph]);

  return (
    <section className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <header className="shrink-0 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">当前章节原文</h2>
            <p className="mt-1 text-[11px] font-bold text-slate-400">第12章 · 黑石镇</p>
          </div>
          <span className="text-[11px] font-black text-[#08AACE]"><WordCountText value={4286} /></span>
        </div>
      </header>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6 font-serif text-[16px] leading-[1.95] text-slate-800">
        {STATUS_TEST_PARAGRAPHS.map((paragraph) => (
          <p
            key={paragraph.number}
            id={`status-source-paragraph-${paragraph.number}`}
            ref={(element) => {
              if (element) paragraphRefs.current.set(paragraph.number, element);
              else paragraphRefs.current.delete(paragraph.number);
            }}
            onClick={() => onSelectParagraph(paragraph.number)}
            className={`mb-4 cursor-text border-l-2 px-3 py-1 transition-colors ${
              activeParagraph === paragraph.number
                ? 'border-[#08AACE] bg-[#F3FCFE] text-slate-950'
                : 'border-transparent'
            }`}
          >
            {paragraph.text}
          </p>
        ))}
      </div>
    </section>
  );
}

type StatusResultColumnProps = {
  hasRun: boolean;
  linkedIds: Set<string>;
  changeDecisions: Record<string, StatusChangeDecision>;
  writtenIds: Set<string>;
  onDecideChange: (id: string, decision: StatusChangeDecision) => void;
  onConfirmAll: () => void;
  onShowEvidence: (paragraph: number) => void;
  onWriteConfirmed: () => void;
};

function StatusChangeCard({ change, decision, written, onDecide, onShowEvidence }: { change: StatusTestChange; decision: StatusChangeDecision; written: boolean; onDecide: (decision: StatusChangeDecision) => void; onShowEvidence: () => void }) {
  return (
    <article className={`rounded-xl border bg-white p-3 shadow-sm ${decision === 'ignored' ? 'border-slate-200 opacity-60' : decision === 'confirmed' ? 'border-emerald-200' : 'border-amber-200'}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-950">{change.target}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">{change.group}</span>
            <span className="text-xs font-black text-[#078fb0]">{change.field}</span>
            {written ? <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600">已写入设定</span> : null}
          </div>
        </div>
        <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-black ${decision === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : decision === 'ignored' ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-600'}`}>
          {decision === 'confirmed' ? '已确认' : decision === 'ignored' ? '已忽略' : '待确认'}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] items-stretch gap-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <span className="text-[10px] font-black text-slate-400">原状态</span>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{change.before}</p>
        </div>
        <span className="grid place-items-center text-sm font-black text-[#08AACE]">→</span>
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-2.5">
          <span className="text-[10px] font-black text-[#078fb0]">更新后</span>
          <p className="mt-1 text-xs font-black leading-5 text-slate-900">{change.after}</p>
        </div>
      </div>
      <button type="button" onClick={onShowEvidence} className="mt-3 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left">
        <span className="text-[10px] font-black text-amber-700">更新依据 · 第{change.paragraph}段</span>
        <p className="mt-1 text-[11px] font-bold leading-5 text-slate-600">{change.reason}</p>
      </button>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => onDecide('ignored')} className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-500 hover:bg-slate-50">忽略</button>
        <button type="button" onClick={() => onDecide('confirmed')} className="h-8 rounded-lg bg-[#08AACE] px-3 text-[11px] font-black text-white hover:bg-[#0798b8]">确认更新</button>
      </div>
    </article>
  );
}

export function StatusResultColumn({ hasRun, linkedIds, changeDecisions, writtenIds, onDecideChange, onConfirmAll, onShowEvidence, onWriteConfirmed }: StatusResultColumnProps) {
  const changes = STATUS_TEST_CHANGES.filter((change) => linkedIds.has(change.targetId));
  const categories = ['全部', '人物', '道具', '地点', '伏笔', '其他设定'] as const;
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('全部');
  const visibleChanges = activeCategory === '全部'
    ? changes
    : changes.filter((change) => change.category === activeCategory);
  const pendingCount = changes.filter((change) => (changeDecisions[change.id] ?? 'pending') === 'pending').length;
  const confirmedCount = changes.filter((change) => changeDecisions[change.id] === 'confirmed').length;
  const ignoredCount = changes.filter((change) => changeDecisions[change.id] === 'ignored').length;
  return (
    <section className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/70">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <h2 className="text-sm font-black text-slate-900">状态更新栏</h2>
        <p className="mt-1 text-[11px] font-bold text-slate-400">对象、前后状态和原文依据集中显示在这里</p>
      </header>
      {!hasRun ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <div className="max-w-sm text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF9FD] text-[#08AACE]"><FileText className="h-7 w-7" /></div>
            <h3 className="mt-4 text-base font-black text-slate-900">等待AI分析本章状态</h3>
            <p className="mt-2 text-xs font-bold leading-6 text-slate-400">点击右侧“开始智能分析”。AI会先从正文发现可能变化的对象，再查询设定库并生成状态前后对比。</p>
          </div>
        </div>
      ) : (
        <>
          <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black">
              <span className="rounded-lg bg-amber-50 px-2 py-2 text-amber-600">待确认 {pendingCount}</span>
              <span className="rounded-lg bg-emerald-50 px-2 py-2 text-emerald-600">已确认 {confirmedCount}</span>
              <span className="rounded-lg bg-slate-100 px-2 py-2 text-slate-500">已忽略 {ignoredCount}</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">分析完成：发现 {changes.length} 项明确状态变化，请确认后再写入</div>
            <div className="rounded-xl border border-slate-200 bg-white p-2">
              <div className="mb-2 flex items-center justify-between text-[10px] font-black text-slate-500">
                <span>状态更新分类</span>
                <span>共 {changes.length} 项</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {categories.map((category) => {
                  const count = category === '全部'
                    ? changes.length
                    : changes.filter((change) => change.category === category).length;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-lg border px-2 py-1.5 text-[10px] font-black ${
                        activeCategory === category
                          ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078fb0]'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      {category} {count}
                    </button>
                  );
                })}
              </div>
            </div>
            {visibleChanges.length > 0 ? visibleChanges.map((change) => (
              <StatusChangeCard key={change.id} change={change} decision={changeDecisions[change.id] ?? 'pending'} written={writtenIds.has(change.id)} onDecide={(decision) => onDecideChange(change.id, decision)} onShowEvidence={() => onShowEvidence(change.paragraph)} />
            )) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-xs font-bold text-slate-400">本章没有发现{activeCategory}类状态更新</div>
            )}
          </div>
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
            <span className="text-xs font-black text-slate-500">已确认 {confirmedCount} 项</span>
            <div className="flex gap-2">
              <button type="button" onClick={onConfirmAll} disabled={pendingCount === 0} className="h-9 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] disabled:border-slate-200 disabled:text-slate-300">确认全部状态</button>
              <button type="button" onClick={onWriteConfirmed} disabled={confirmedCount === 0} className="h-9 rounded-xl bg-[#08AACE] px-4 text-xs font-black text-white hover:bg-[#0798b8] disabled:bg-slate-300">写入已确认状态</button>
            </div>
          </footer>
        </>
      )}
    </section>
  );
}
